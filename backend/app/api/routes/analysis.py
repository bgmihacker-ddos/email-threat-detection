"""Email analysis, persisted-analysis exploration, and forensic exports."""

import html
import json
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from app.database.session import get_db, SessionLocal
from app.detection.rule_engine import RuleEngine
from app.detection.risk_scorer import RiskEngine
from app.models.analysis import AnalysisResult
from app.schemas.analysis import EmailAnalysisSchema
from app.services.email_parser import EmailParser
from app.services.header_forensics import HeaderForensicsAnalyzer
from app.services.authentication_analyzer import AuthenticationAnalyzer
from app.services.ioc_extractor import IOCExtractor
from app.services.url_analyzer import URLIntelligence
from app.services.domain_analyzer import DomainIntelligence
from app.services.threat_intelligence import ThreatIntelligenceService
from app.services.attachment_analyzer import AttachmentAnalyzer
from app.services.content_analyzer import ContentAnalyzer
from app.services.threat_reasoning import ThreatReasoningEngine
from app.services.attack_chain import AttackChainReconstruction
from app.detection.ml_classifier import get_ml_classifier
from app.services.sender_intelligence import SenderIntelligenceAnalyzer
from app.services.dns_intelligence import DNSIntelligenceService
from app.services.whois_intelligence import WHOISIntelligenceService
from app.services.evidence_graph import build_evidence_graph
from app.services.case_timeline import build_case_timeline
from app.services.campaign_correlation import correlate_campaigns
from app.services.mitre_mapper import map_mitre_techniques
from app.services.stix_exporter import export_stix_bundle
from app.services.response_artifacts import generate_blocklist, generate_queries

router = APIRouter()


_REDACTED_EMAIL_FIELDS = {"raw_email", "plain_text", "html_body"}


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _sanitize_result(result: Any, include_raw_email: bool = False) -> Dict[str, Any]:
    """Return a result safe for exports without mutating persisted JSON.

    Parsed email content is operationally useful in a live analysis response, but
    it is redacted from portable reports by default. Callers must explicitly opt
    into raw-email inclusion.
    """
    payload = deepcopy(result) if isinstance(result, dict) else {}
    if include_raw_email:
        return payload

    email = payload.get("email")
    if isinstance(email, dict):
        for field in _REDACTED_EMAIL_FIELDS:
            if field in email:
                email[field] = "[redacted from export]"
    return payload


def _analysis_summary(record: AnalysisResult) -> Dict[str, Any]:
    """Create a list-safe summary without exposing raw message content."""
    result = record.result if isinstance(record.result, dict) else {}
    email = result.get("email") if isinstance(result.get("email"), dict) else {}
    metadata = email.get("metadata") if isinstance(email.get("metadata"), dict) else {}
    sender = email.get("from") or metadata.get("from") or "(unknown sender)"
    recipient = email.get("to") or metadata.get("to") or []
    if isinstance(recipient, list):
        recipient = ", ".join(str(value) for value in recipient[:3])

    return {
        "analysis_id": record.id,
        "verdict": record.verdict,
        "risk_score": record.risk_score,
        "severity": record.severity,
        "confidence": record.confidence,
        "summary": record.summary,
        "subject": email.get("subject") or metadata.get("subject") or "(no subject)",
        "sender": sender,
        "recipient": recipient or "(no recipient)",
        "created_at": _as_utc(record.created_at).isoformat(),
        "status": record.status or "completed",
    }


def _completed_result(record: AnalysisResult) -> Dict[str, Any]:
    """Return a persisted result only when the analysis has usable output."""
    if record.status not in {"completed", "partial"} or not isinstance(record.result, dict):
        raise HTTPException(
            status_code=409,
            detail={
                "analysis_id": record.id,
                "status": record.status or "processing",
                "stage": record.current_stage,
                "error": record.error_message,
            },
        )
    return record.result


def _result_iocs(result: Any) -> List[Dict[str, Any]]:
    if not isinstance(result, dict):
        return []
    extracted = result.get("extracted_iocs")
    if not isinstance(extracted, dict):
        return []
    iocs = extracted.get("iocs")
    return [item for item in iocs if isinstance(item, dict)] if isinstance(iocs, list) else []


def _render_report_html(analysis_id: str, payload: Dict[str, Any], created_at: datetime) -> str:
    """Render a printable, escaped forensic report with no client-side script."""
    evidence = json.dumps(payload, ensure_ascii=False, indent=2, default=str)
    verdict = html.escape(str(payload.get("verdict", "unknown")).upper())
    risk_score = html.escape(str(payload.get("risk_score", "unknown")))
    severity = html.escape(str(payload.get("severity", "unknown")).upper())
    summary = html.escape(str(payload.get("summary", "No summary available.")))
    report_id = html.escape(analysis_id)
    generated_at = html.escape(_as_utc(created_at).isoformat())
    evidence_html = html.escape(evidence)

    return f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
  <title>Forensic Report {report_id}</title>
  <style>
    body {{ font-family: Arial, sans-serif; color: #172033; margin: 2rem; line-height: 1.45; }}
    header {{ border-bottom: 2px solid #0e7490; margin-bottom: 1.5rem; padding-bottom: .75rem; }}
    h1 {{ margin: 0; font-size: 1.5rem; }}
    .meta {{ color: #526070; font-size: .85rem; }}
    .grid {{ display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin: 1rem 0; }}
    .card {{ border: 1px solid #d7dee8; border-radius: .4rem; padding: .8rem; }}
    .label {{ color: #526070; font-size: .75rem; font-weight: bold; text-transform: uppercase; }}
    .value {{ font-size: 1.15rem; font-weight: bold; margin-top: .25rem; }}
    pre {{ background: #f6f8fa; border: 1px solid #d7dee8; border-radius: .4rem; overflow-wrap: anywhere; padding: 1rem; white-space: pre-wrap; }}
    @media print {{ body {{ margin: .5in; }} }}
  </style>
</head>
<body>
  <header>
    <h1>Email Threat Detection — Forensic Analysis Report</h1>
    <div class=\"meta\">Analysis ID: {report_id} · Generated: {generated_at}</div>
  </header>
  <div class=\"grid\">
    <section class=\"card\"><div class=\"label\">Verdict</div><div class=\"value\">{verdict}</div></section>
    <section class=\"card\"><div class=\"label\">Risk score</div><div class=\"value\">{risk_score} / 100</div></section>
    <section class=\"card\"><div class=\"label\">Severity</div><div class=\"value\">{severity}</div></section>
  </div>
  <section><h2>Summary</h2><p>{summary}</p></section>
  <section><h2>Structured evidence</h2><pre>{evidence_html}</pre></section>
</body>
</html>"""



def _update_job_status(db: Session, analysis_id: str, status: str, stage: str, pct: int, error: Optional[str] = None):
    try:
        db_rec = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
        if not db_rec:
            db_rec = AnalysisResult(
                id=analysis_id,
                status=status,
                current_stage=stage,
                progress_percent=pct,
                error_message=error,
                started_at=datetime.now(timezone.utc)
            )
            db.add(db_rec)
        else:
            db_rec.status = status
            db_rec.current_stage = stage
            db_rec.progress_percent = pct
            db_rec.error_message = error
            db_rec.updated_at = datetime.now(timezone.utc)
            if status in ("completed", "failed"):
                db_rec.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        db.rollback()

async def _execute_analysis_pipeline(raw_email: bytes, analysis_id: str, db: Session) -> EmailAnalysisSchema:
    import asyncio
    try:
        _update_job_status(db, analysis_id, "processing", "Parsing RFC 5322 MIME stream & headers...", 15)

        # 1) Parsing and deterministic forensic components.
        parsed_email = EmailParser.parse_raw(raw_email)
        header_forensics = HeaderForensicsAnalyzer.analyze(parsed_email)
        authentication = AuthenticationAnalyzer.analyze(header_forensics, parsed_email)
        extracted_iocs = IOCExtractor.extract(parsed_email)

        _update_job_status(db, analysis_id, "processing", "Inspecting attachment payloads & content semantics...", 35)

        urls = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "url"]
        url_analysis = URLIntelligence.analyze_batch(urls)
        domains = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "domain"]
        domain_analysis = {domain: DomainIntelligence.analyze(domain) for domain in domains}

        attachment_analysis = AttachmentAnalyzer.analyze(parsed_email.get("attachments", []))
        content_analysis = ContentAnalyzer.analyze(parsed_email)
        ml_analysis = get_ml_classifier().predict_email(parsed_email)

        _update_job_status(db, analysis_id, "processing", "Correlating intelligence feeds (DNS/WHOIS/ThreatIntel)...", 60)

        # 2) Safe local intelligence enrichment. DNS is best-effort and never a verdict.
        async def enrich_domain(dom: str, det: dict):
            try:
                det["dns"] = await DNSIntelligenceService.resolve_domain_async(dom)
            except Exception:
                det["dns"] = {"status": "error"}

            try:
                det["whois"] = await WHOISIntelligenceService.lookup_domain(dom)
            except Exception:
                det["whois"] = {"status": "error"}

        enrich_tasks = [enrich_domain(domain, details) for domain, details in domain_analysis.items()]
        if enrich_tasks:
            await asyncio.gather(*enrich_tasks)

        addresses = parsed_email.get("addresses", {}) if isinstance(parsed_email, dict) else {}
        sender_intelligence = SenderIntelligenceAnalyzer.analyze(addresses, header_forensics, authentication)

        # Optional threat intelligence. Failures remain localized in output.
        threat_intelligence = await ThreatIntelligenceService().enrich_all(extracted_iocs["iocs"])

        _update_job_status(db, analysis_id, "processing", "Synthesizing MITRE ATT&CK techniques & evidence graph...", 80)

        # 3) Preserve legacy RuleEngine data and use new fused score as final verdict.
        rule_result = RuleEngine.analyze(parsed_email)
        risk_result = RiskEngine.calculate_risk(
            header_forensics,
            authentication,
            extracted_iocs,
            url_analysis,
            domain_analysis,
            threat_intelligence,
            attachment_analysis,
            content_analysis,
            ml_analysis,
            rule_result,
        )

        all_findings = (
            header_forensics.get("forensic_findings", [])
            + authentication.get("findings", [])
            + attachment_analysis.get("findings", [])
            + content_analysis.get("findings", [])
        )
        extended_reasoning = ThreatReasoningEngine.generate_reasoning(
            risk_result["verdict"],
            risk_result["risk_score"],
            risk_result["score_breakdown"],
            all_findings,
        )
        attack_chain_steps = AttackChainReconstruction.reconstruct(
            header_forensics,
            authentication,
            url_analysis,
            attachment_analysis,
            content_analysis,
        )

        evidence_graph = build_evidence_graph(
            addresses, header_forensics, authentication,
            {**extracted_iocs, "attachments": attachment_analysis},
        )
        timeline = build_case_timeline(addresses, header_forensics, authentication, parsed_email)
        mitre_techniques = map_mitre_techniques({
            "all_findings": all_findings,
            "attachments": attachment_analysis,
            "content": content_analysis,
            "urls": urls,
            "risk": risk_result,
        })

        recommendations = rule_result.get("recommendations", [])
        if risk_result["verdict"] != "benign":
            recommendations = list(dict.fromkeys([
                *recommendations,
                "Verify suspicious sender requests through an independent channel.",
                "Do not interact with suspicious links or attachments.",
            ]))

        analysis = EmailAnalysisSchema(
            analysis_id=analysis_id,
            verdict=risk_result["verdict"],
            risk_score=risk_result["risk_score"],
            severity=risk_result["severity"],
            confidence=risk_result["confidence"],
            summary=extended_reasoning["summary"],
            reasons=rule_result.get("reasons", []),
            evidence=rule_result.get("evidence", []),
            detections=rule_result.get("detections", []),
            authentication=authentication,
            forensic_findings=all_findings,
            threat_reasoning=rule_result.get("threat_reasoning", []),
            extended_reasoning=extended_reasoning,
            attack_chain=rule_result.get("attack_chain", []),
            attack_chain_steps=attack_chain_steps,
            iocs=rule_result.get("iocs", {"urls": [], "domains": [], "ips": [], "attachments": []}),
            extracted_iocs=extracted_iocs,
            threat_intelligence=threat_intelligence,
            recommendations=recommendations,
            header_forensics=header_forensics,
            url_analysis=url_analysis,
            domain_analysis=domain_analysis,
            attachment_analysis=attachment_analysis,
            content_analysis=content_analysis,
            ml_analysis=ml_analysis,
            risk_breakdown=risk_result["score_breakdown"],
            sender_intelligence=sender_intelligence,
            evidence_graph=evidence_graph,
            timeline=timeline,
            mitre_techniques=mitre_techniques,
            email=parsed_email,
        )

        historical_records = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(1000).all()
        related_investigations = correlate_campaigns(
            analysis_id,
            extracted_iocs,
            {
                "from_domain": sender_intelligence.get("from_domain"),
                "attachment_hashes": [
                    item.get("sha256") for item in attachment_analysis.get("attachments", [])
                    if isinstance(item, dict) and item.get("sha256")
                ],
            },
            historical_records,
        )
        analysis.related_investigations = related_investigations

        db_result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
        if not db_result:
            db_result = AnalysisResult(id=analysis_id)
            db.add(db_result)
        db_result.verdict = analysis.verdict
        db_result.risk_score = analysis.risk_score
        db_result.severity = analysis.severity
        db_result.confidence = analysis.confidence
        db_result.summary = analysis.summary
        db_result.result = analysis.model_dump(mode="json")
        db.commit()

        _update_job_status(db, analysis_id, "completed", "Analysis finalized and persisted", 100)

        return analysis
    except Exception as exc:
        db.rollback()
        _update_job_status(db, analysis_id, "failed", "Analysis failed", 0, error=str(exc) if isinstance(exc, ValueError) else "Email analysis could not be completed.")
        raise


async def _background_analysis_task(raw_email: bytes, analysis_id: str):
    db = SessionLocal()
    try:
        await _execute_analysis_pipeline(raw_email, analysis_id, db)
    except Exception:
        pass
    finally:
        db.close()


@router.post("/analyze")
async def analyze_email(
    background_tasks: BackgroundTasks,
    raw_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    async_mode: bool = Form(False),
    db: Session = Depends(get_db),
):
    if not raw_content and not file:
        raise HTTPException(status_code=400, detail="No email content provided.")

    if file:
        raw_email = await file.read()
    else:
        raw_email = raw_content.encode("utf-8")

    analysis_id = str(uuid.uuid4())

    if async_mode:
        _update_job_status(db, analysis_id, "queued", "Queued for forensic ingestion", 5)
        background_tasks.add_task(_background_analysis_task, raw_email, analysis_id)
        return {
            "analysis_id": analysis_id,
            "status": "queued",
            "stage": "Queued for forensic ingestion",
            "progress_pct": 5,
            "error": None,
        }

    try:
        return await _execute_analysis_pipeline(raw_email, analysis_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Email analysis could not be completed.")


@router.get("/analyze/{analysis_id}/status")
def get_analysis_status(analysis_id: str, db: Session = Depends(get_db)):
    db_result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if db_result is not None:
        return {
            "analysis_id": analysis_id,
            "status": db_result.status or "completed",
            "stage": db_result.current_stage or "Analysis finalized and persisted",
            "progress_pct": db_result.progress_percent if db_result.progress_percent is not None else 100,
            "error": db_result.error_message,
        }

    raise HTTPException(status_code=404, detail="Analysis job not found.")


@router.get("/analyze/{analysis_id}", response_model=EmailAnalysisSchema)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    db_result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if db_result is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return EmailAnalysisSchema(**_completed_result(db_result))


@router.get("/analyses", response_model=dict)
def list_analyses(
    query: Optional[str] = Query(None, min_length=1, max_length=200),
    verdict: Optional[str] = Query(None, pattern="^(benign|suspicious|malicious)$"),
    severity: Optional[str] = Query(None, pattern="^(info|low|medium|high|critical)$"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List compact persisted analysis records with server-side filters."""
    statement = db.query(AnalysisResult)
    if verdict:
        statement = statement.filter(AnalysisResult.verdict == verdict)
    if severity:
        statement = statement.filter(AnalysisResult.severity == severity)
    if query:
        escaped_query = query.replace("%", "\\%").replace("_", "\\_")
        match = f"%{escaped_query}%"
        statement = statement.filter(
            (AnalysisResult.summary.ilike(match)) | (AnalysisResult.id.ilike(match))
        )

    total = statement.count()
    records = statement.order_by(AnalysisResult.created_at.desc()).offset(offset).limit(limit).all()
    return {"data": [_analysis_summary(record) for record in records], "meta": {"total": total, "limit": limit, "offset": offset}}


@router.get("/analyses/iocs/search", response_model=dict)
def search_persisted_iocs(
    value: Optional[str] = Query(None, min_length=1, max_length=500),
    indicator_type: Optional[str] = Query(None, alias="type", max_length=32),
    limit: int = Query(100, ge=1, le=250),
    db: Session = Depends(get_db),
):
    """Search IOCs observed in persisted local analyses without external lookups."""
    # JSON querying differs between SQLite and PostgreSQL, so bounded filtering is
    # intentionally performed in Python for cross-database compatibility.
    records = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(1000).all()
    needle = value.lower() if value else ""
    matches: List[Dict[str, Any]] = []
    seen = set()

    for record in records:
        result_dict = record.result if isinstance(record.result, dict) else {}
        email_info = result_dict.get("email") if isinstance(result_dict.get("email"), dict) else {}
        email_subject = email_info.get("subject") or "(No subject)"
        email_sender = email_info.get("from") or email_info.get("sender") or "Sender not available in parsed message"

        for ioc in _result_iocs(record.result):
            current_type = str(ioc.get("type") or "")
            current_value = str(ioc.get("normalized_value") or ioc.get("value") or "")
            if indicator_type and current_type != indicator_type:
                continue
            if needle and needle not in current_value.lower():
                continue
            key = (current_type, current_value.lower(), record.id)
            if not current_value or key in seen:
                continue
            seen.add(key)
            matches.append({
                "indicator": current_value,
                "type": current_type,
                "confidence": ioc.get("confidence") or 80,
                "sources": ioc.get("sources") or ioc.get("source") or ["local_analysis"],
                "context": ioc.get("context") or "Extracted from message body/headers",
                "analysis_id": record.id,
                "email_subject": email_subject,
                "email_sender": email_sender,
                "verdict": record.verdict,
                "severity": record.severity,
                "risk_score": record.risk_score,
                "created_at": _as_utc(record.created_at).isoformat(),
            })
            if len(matches) >= limit:
                return {"data": matches, "meta": {"limit": limit, "truncated": True, "source": "persisted_local_analyses"}}

    return {"data": matches, "meta": {"limit": limit, "truncated": False, "source": "persisted_local_analyses"}}


@router.get("/analyze/{analysis_id}/report.json")
def export_analysis_json(
    analysis_id: str,
    include_raw_email: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Download portable structured evidence, redacting message content by default."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    payload = _sanitize_result(_completed_result(record), include_raw_email=include_raw_email)
    return JSONResponse(
        content=payload,
        headers={"Content-Disposition": f'attachment; filename="analysis-{analysis_id}.json"'},
    )


@router.get("/analyze/{analysis_id}/report.stix")
def export_analysis_stix(analysis_id: str, db: Session = Depends(get_db)):
    """Export sanitized evidence as a STIX 2.1 bundle."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return JSONResponse(
        content=export_stix_bundle(record.id, _sanitize_result(_completed_result(record))),
        headers={"Content-Disposition": f'attachment; filename="analysis-{analysis_id}.stix.json"'},
        media_type="application/stix+json",
    )


@router.get("/analyze/{analysis_id}/blocklist.csv")
def export_analysis_blocklist(analysis_id: str, db: Session = Depends(get_db)):
    """Export a bounded IOC blocklist without raw email content."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    from fastapi.responses import PlainTextResponse
    response = PlainTextResponse(generate_blocklist(_sanitize_result(_completed_result(record))), media_type="text/csv")
    response.headers["Content-Disposition"] = f'attachment; filename="analysis-{analysis_id}-blocklist.csv"'
    return response


@router.get("/analyze/{analysis_id}/queries")
def export_analysis_queries(analysis_id: str, db: Session = Depends(get_db)):
    """Return SIEM query templates generated from observed IOCs."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return generate_queries(_sanitize_result(_completed_result(record)))


@router.get("/analyses/{analysis_id}/related")
def get_related_investigations(analysis_id: str, db: Session = Depends(get_db)):
    """Return campaign-correlation results persisted on an analysis."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {"data": (record.result or {}).get("related_investigations", []), "analysis_id": analysis_id}


@router.get("/analyze/{analysis_id}/report.html", response_class=HTMLResponse)
def export_analysis_html(
    analysis_id: str,
    include_raw_email: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Serve a printable HTML report containing escaped structured evidence."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    payload = _sanitize_result(_completed_result(record), include_raw_email=include_raw_email)
    response = HTMLResponse(_render_report_html(record.id, payload, record.created_at))
    response.headers["Content-Disposition"] = f'inline; filename="analysis-{analysis_id}.html"'
    return response

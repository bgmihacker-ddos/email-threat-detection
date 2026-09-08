"""
Comprehensive Pipeline Diagnostic and Reproduction Script.
Executes every available .eml file in the repository through:
1. The exact stage-by-stage breakdown of `app/api/routes/analysis.py:analyze_email`
2. An end-to-end HTTP POST /api/analyze request using TestClient/httpx.
"""

import sys
import os
import time
import uuid
import inspect
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

import asyncio
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.database import init_db, Base, engine, SessionLocal, get_db
from app.models.analysis import AnalysisResult
from app.schemas.analysis import EmailAnalysisSchema

from app.detection.rule_engine import RuleEngine
from app.detection.risk_scorer import RiskEngine
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


def find_eml_files() -> List[Path]:
    """Locate all .eml fixtures in backend repository (excluding worktrees)."""
    eml_files = []

    # 1. Look in backend/tests/fixtures/emails
    fixtures_dir = BACKEND_DIR / "tests" / "fixtures" / "emails"
    if fixtures_dir.exists():
        eml_files.extend(list(fixtures_dir.glob("*.eml")))

    # 2. Root backend test_req.eml
    root_eml = BACKEND_DIR / "test_req.eml"
    if root_eml.exists() and root_eml not in eml_files:
        eml_files.append(root_eml)

    # 3. Any other .eml in backend
    for p in BACKEND_DIR.glob("**/*.eml"):
        if p not in eml_files and ".venv" not in str(p) and "venv" not in str(p) and ".claude" not in str(p):
            eml_files.append(p)

    return sorted(list(set(eml_files)))


class StageTracker:
    def __init__(self, sample_name: str):
        self.sample_name = sample_name
        self.stages: List[Dict[str, Any]] = []
        self.errors: List[Dict[str, Any]] = []

    def record_stage(self, stage_name: str, start_time: float, end_time: float, status: str = "SUCCESS", details: str = ""):
        duration_ms = (end_time - start_time) * 1000
        self.stages.append({
            "stage": stage_name,
            "start_time": datetime.fromtimestamp(start_time, tz=timezone.utc).strftime("%H:%M:%S.%f")[:-3],
            "end_time": datetime.fromtimestamp(end_time, tz=timezone.utc).strftime("%H:%M:%S.%f")[:-3],
            "duration_ms": duration_ms,
            "status": status,
            "details": details
        })

    def record_error(self, stage_name: str, exc: Exception, tb_str: str, local_vars: Dict[str, Any]):
        self.errors.append({
            "stage": stage_name,
            "exception_type": type(exc).__name__,
            "exception_msg": str(exc),
            "traceback": tb_str,
            "local_vars": {k: repr(v)[:200] for k, v in local_vars.items() if not k.startswith("__")}
        })


async def run_stage_by_stage(eml_path: Path, db: Session) -> StageTracker:
    tracker = StageTracker(eml_path.name)
    raw_email = eml_path.read_bytes()

    print(f"\n================================================================================")
    print(f"STAGE-BY-STAGE TEST: {eml_path.name} ({len(raw_email)} bytes)")
    print(f"Path: {eml_path.resolve()}")
    print(f"================================================================================")

    # Variables corresponding to pipeline
    parsed_email = None
    header_forensics = None
    authentication = None
    extracted_iocs = None
    urls = []
    url_analysis = None
    domains = []
    domain_analysis = None
    attachment_analysis = None
    content_analysis = None
    ml_analysis = None
    sender_intelligence = None
    threat_intelligence = None
    rule_result = None
    risk_result = None
    all_findings = []
    extended_reasoning = None
    attack_chain_steps = None
    evidence_graph = None
    timeline = None
    mitre_techniques = None
    recommendations = []
    analysis = None
    related_investigations = None

    # STAGE 1: EmailParser.parse_raw
    st = time.time()
    try:
        parsed_email = EmailParser.parse_raw(raw_email)
        et = time.time()
        tracker.record_stage("1. EmailParser.parse_raw", st, et, "SUCCESS", f"Subject: {parsed_email.get('subject')}, Attachments: {len(parsed_email.get('attachments', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("1. EmailParser.parse_raw", st, et, "FAILED")
        tracker.record_error("1. EmailParser.parse_raw", e, tb, locals())
        return tracker

    # STAGE 2: HeaderForensicsAnalyzer.analyze
    st = time.time()
    try:
        header_forensics = HeaderForensicsAnalyzer.analyze(parsed_email)
        et = time.time()
        tracker.record_stage("2. HeaderForensicsAnalyzer.analyze", st, et, "SUCCESS", f"Hops: {len(header_forensics.get('hops', []))}, Findings: {len(header_forensics.get('forensic_findings', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("2. HeaderForensicsAnalyzer.analyze", st, et, "FAILED")
        tracker.record_error("2. HeaderForensicsAnalyzer.analyze", e, tb, locals())

    # STAGE 3: AuthenticationAnalyzer.analyze
    st = time.time()
    try:
        authentication = AuthenticationAnalyzer.analyze(header_forensics, parsed_email)
        et = time.time()
        tracker.record_stage("3. AuthenticationAnalyzer.analyze", st, et, "SUCCESS", f"SPF: {authentication.get('spf', {}).get('status')}, DKIM: {authentication.get('dkim', {}).get('status')}, DMARC: {authentication.get('dmarc', {}).get('status')}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("3. AuthenticationAnalyzer.analyze", st, et, "FAILED")
        tracker.record_error("3. AuthenticationAnalyzer.analyze", e, tb, locals())

    # STAGE 4: IOCExtractor.extract
    st = time.time()
    try:
        extracted_iocs = IOCExtractor.extract(parsed_email)
        et = time.time()
        tracker.record_stage("4. IOCExtractor.extract", st, et, "SUCCESS", f"Total IOCs: {len(extracted_iocs.get('iocs', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("4. IOCExtractor.extract", st, et, "FAILED")
        tracker.record_error("4. IOCExtractor.extract", e, tb, locals())

    # STAGE 5: URLIntelligence.analyze_batch
    st = time.time()
    try:
        urls = [ioc["value"] for ioc in (extracted_iocs.get("iocs", []) if extracted_iocs else []) if ioc.get("type") == "url"]
        url_analysis = URLIntelligence.analyze_batch(urls)
        et = time.time()
        tracker.record_stage("5. URLIntelligence.analyze_batch", st, et, "SUCCESS", f"URLs analyzed: {len(urls)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("5. URLIntelligence.analyze_batch", st, et, "FAILED")
        tracker.record_error("5. URLIntelligence.analyze_batch", e, tb, locals())

    # STAGE 6: DomainIntelligence.analyze
    st = time.time()
    try:
        domains = [ioc["value"] for ioc in (extracted_iocs.get("iocs", []) if extracted_iocs else []) if ioc.get("type") == "domain"]
        domain_analysis = {domain: DomainIntelligence.analyze(domain) for domain in domains}
        et = time.time()
        tracker.record_stage("6. DomainIntelligence.analyze", st, et, "SUCCESS", f"Domains analyzed: {len(domains)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("6. DomainIntelligence.analyze", st, et, "FAILED")
        tracker.record_error("6. DomainIntelligence.analyze", e, tb, locals())

    # STAGE 7: AttachmentAnalyzer.analyze
    st = time.time()
    try:
        attachment_analysis = AttachmentAnalyzer.analyze(parsed_email.get("attachments", []))
        et = time.time()
        tracker.record_stage("7. AttachmentAnalyzer.analyze", st, et, "SUCCESS", f"Attachments processed: {len(attachment_analysis.get('attachments', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("7. AttachmentAnalyzer.analyze", st, et, "FAILED")
        tracker.record_error("7. AttachmentAnalyzer.analyze", e, tb, locals())

    # STAGE 8: ContentAnalyzer.analyze
    st = time.time()
    try:
        content_analysis = ContentAnalyzer.analyze(parsed_email)
        et = time.time()
        tracker.record_stage("8. ContentAnalyzer.analyze", st, et, "SUCCESS", f"Intent: {content_analysis.get('intent', {}).get('intent')}, Findings: {len(content_analysis.get('findings', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("8. ContentAnalyzer.analyze", st, et, "FAILED")
        tracker.record_error("8. ContentAnalyzer.analyze", e, tb, locals())

    # STAGE 9: ML Classifier
    st = time.time()
    try:
        ml_analysis = get_ml_classifier().predict_email(parsed_email)
        et = time.time()
        prob = ml_analysis.get('malicious_probability')
        prob_str = f"{prob:.3f}" if prob is not None else "None"
        tracker.record_stage("9. ML Classifier predict_email", st, et, "SUCCESS", f"Prediction: {ml_analysis.get('prediction')}, Prob: {prob_str}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("9. ML Classifier predict_email", st, et, "FAILED")
        tracker.record_error("9. ML Classifier predict_email", e, tb, locals())

    # STAGE 10: DNS & WHOIS enrichment
    st = time.time()
    try:
        if domain_analysis:
            for domain, details in domain_analysis.items():
                try:
                    details["dns"] = DNSIntelligenceService.resolve_domain(domain)
                except Exception:
                    details["dns"] = {"status": "error"}

                try:
                    details["whois"] = await WHOISIntelligenceService.lookup_domain(domain)
                except Exception:
                    details["whois"] = {"status": "error"}
        et = time.time()
        tracker.record_stage("10. DNS & WHOIS enrichment", st, et, "SUCCESS", f"Domains enriched: {len(domain_analysis or {})}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("10. DNS & WHOIS enrichment", st, et, "FAILED")
        tracker.record_error("10. DNS & WHOIS enrichment", e, tb, locals())

    # STAGE 11: SenderIntelligenceAnalyzer.analyze
    st = time.time()
    try:
        addresses = parsed_email.get("addresses", {}) if isinstance(parsed_email, dict) else {}
        sender_intelligence = SenderIntelligenceAnalyzer.analyze(addresses, header_forensics, authentication)
        et = time.time()
        tracker.record_stage("11. SenderIntelligenceAnalyzer.analyze", st, et, "SUCCESS", f"Domain: {sender_intelligence.get('from_domain')}, Spoof risk: {sender_intelligence.get('spoof_risk')}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("11. SenderIntelligenceAnalyzer.analyze", st, et, "FAILED")
        tracker.record_error("11. SenderIntelligenceAnalyzer.analyze", e, tb, locals())

    # STAGE 12: ThreatIntelligenceService.enrich_all
    st = time.time()
    try:
        threat_intelligence = await ThreatIntelligenceService().enrich_all(extracted_iocs.get("iocs", []) if extracted_iocs else [])
        et = time.time()
        tracker.record_stage("12. ThreatIntelligenceService.enrich_all", st, et, "SUCCESS", f"Enriched IOCs: {len(threat_intelligence)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("12. ThreatIntelligenceService.enrich_all", st, et, "FAILED")
        tracker.record_error("12. ThreatIntelligenceService.enrich_all", e, tb, locals())

    # STAGE 13: RuleEngine.analyze
    st = time.time()
    try:
        rule_result = RuleEngine.analyze(parsed_email)
        et = time.time()
        tracker.record_stage("13. RuleEngine.analyze", st, et, "SUCCESS", f"Rule verdict: {rule_result.get('verdict')}, score: {rule_result.get('score')}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("13. RuleEngine.analyze", st, et, "FAILED")
        tracker.record_error("13. RuleEngine.analyze", e, tb, locals())

    # STAGE 14: RiskEngine.calculate_risk
    st = time.time()
    try:
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
        et = time.time()
        tracker.record_stage("14. RiskEngine.calculate_risk", st, et, "SUCCESS", f"Verdict: {risk_result.get('verdict')}, Risk Score: {risk_result.get('risk_score')}, Severity: {risk_result.get('severity')}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("14. RiskEngine.calculate_risk", st, et, "FAILED")
        tracker.record_error("14. RiskEngine.calculate_risk", e, tb, locals())

    # STAGE 15: ThreatReasoningEngine.generate_reasoning
    st = time.time()
    try:
        all_findings = (
            (header_forensics or {}).get("forensic_findings", [])
            + (authentication or {}).get("findings", [])
            + (attachment_analysis or {}).get("findings", [])
            + (content_analysis or {}).get("findings", [])
        )
        extended_reasoning = ThreatReasoningEngine.generate_reasoning(
            risk_result["verdict"],
            risk_result["risk_score"],
            risk_result["score_breakdown"],
            all_findings,
        )
        et = time.time()
        tracker.record_stage("15. ThreatReasoningEngine.generate_reasoning", st, et, "SUCCESS", f"Summary: {extended_reasoning.get('summary')[:60]}...")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("15. ThreatReasoningEngine.generate_reasoning", st, et, "FAILED")
        tracker.record_error("15. ThreatReasoningEngine.generate_reasoning", e, tb, locals())

    # STAGE 16: AttackChainReconstruction.reconstruct
    st = time.time()
    try:
        attack_chain_steps = AttackChainReconstruction.reconstruct(
            header_forensics,
            authentication,
            url_analysis,
            attachment_analysis,
            content_analysis,
        )
        et = time.time()
        tracker.record_stage("16. AttackChainReconstruction.reconstruct", st, et, "SUCCESS", f"Steps: {len(attack_chain_steps)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("16. AttackChainReconstruction.reconstruct", st, et, "FAILED")
        tracker.record_error("16. AttackChainReconstruction.reconstruct", e, tb, locals())

    # STAGE 17: build_evidence_graph
    st = time.time()
    try:
        evidence_graph = build_evidence_graph(
            addresses, header_forensics, authentication,
            {**(extracted_iocs or {}), "attachments": attachment_analysis},
        )
        et = time.time()
        tracker.record_stage("17. build_evidence_graph", st, et, "SUCCESS", f"Nodes: {len(evidence_graph.get('nodes', []))}, Edges: {len(evidence_graph.get('edges', []))}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("17. build_evidence_graph", st, et, "FAILED")
        tracker.record_error("17. build_evidence_graph", e, tb, locals())

    # STAGE 18: build_case_timeline
    st = time.time()
    try:
        timeline = build_case_timeline(addresses, header_forensics, authentication, parsed_email)
        et = time.time()
        tracker.record_stage("18. build_case_timeline", st, et, "SUCCESS", f"Events: {len(timeline)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("18. build_case_timeline", st, et, "FAILED")
        tracker.record_error("18. build_case_timeline", e, tb, locals())

    # STAGE 19: map_mitre_techniques
    st = time.time()
    try:
        mitre_techniques = map_mitre_techniques({
            "all_findings": all_findings,
            "attachments": attachment_analysis,
            "content": content_analysis,
            "urls": urls,
            "risk": risk_result,
        })
        et = time.time()
        tracker.record_stage("19. map_mitre_techniques", st, et, "SUCCESS", f"Techniques: {len(mitre_techniques)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("19. map_mitre_techniques", st, et, "FAILED")
        tracker.record_error("19. map_mitre_techniques", e, tb, locals())

    # STAGE 20: EmailAnalysisSchema Instantiation and Serialization
    st = time.time()
    try:
        analysis_id = str(uuid.uuid4())
        recommendations = (rule_result or {}).get("recommendations", [])
        if risk_result and risk_result.get("verdict") != "benign":
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
            reasons=(rule_result or {}).get("reasons", []),
            evidence=(rule_result or {}).get("evidence", []),
            detections=(rule_result or {}).get("detections", []),
            authentication=authentication,
            forensic_findings=all_findings,
            threat_reasoning=(rule_result or {}).get("threat_reasoning", []),
            extended_reasoning=extended_reasoning,
            attack_chain=(rule_result or {}).get("attack_chain", []),
            attack_chain_steps=attack_chain_steps,
            iocs=(rule_result or {}).get("iocs", {"urls": [], "domains": [], "ips": [], "attachments": []}),
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
        et = time.time()
        tracker.record_stage("20. EmailAnalysisSchema validate & construct", st, et, "SUCCESS", f"ID: {analysis.analysis_id}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        tracker.record_stage("20. EmailAnalysisSchema validate & construct", st, et, "FAILED")
        tracker.record_error("20. EmailAnalysisSchema validate & construct", e, tb, locals())

    # STAGE 21: Campaign Correlation & DB Persistence
    st = time.time()
    try:
        historical_records = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).limit(1000).all()
        related_investigations = correlate_campaigns(
            analysis_id,
            extracted_iocs,
            {
                "from_domain": (sender_intelligence or {}).get("from_domain"),
                "attachment_hashes": [
                    item.get("sha256") for item in (attachment_analysis or {}).get("attachments", [])
                    if isinstance(item, dict) and item.get("sha256")
                ],
            },
            historical_records,
        )
        analysis.related_investigations = related_investigations

        db_result = AnalysisResult(
            id=analysis_id,
            verdict=analysis.verdict,
            risk_score=analysis.risk_score,
            severity=analysis.severity,
            confidence=analysis.confidence,
            summary=analysis.summary,
            result=analysis.model_dump(mode="json"),
        )
        db.add(db_result)
        db.commit()
        et = time.time()
        tracker.record_stage("21. Campaign Correlation & DB Save", st, et, "SUCCESS", f"Persisted ID: {analysis_id}, Related count: {len(related_investigations)}")
    except Exception as e:
        et = time.time()
        tb = traceback.format_exc()
        db.rollback()
        tracker.record_stage("21. Campaign Correlation & DB Save", st, et, "FAILED")
        tracker.record_error("21. Campaign Correlation & DB Save", e, tb, locals())

    return tracker


def run_http_endpoint_test(eml_path: Path, client: TestClient) -> Dict[str, Any]:
    """Test the full /api/analyze endpoint with TestClient sending file and raw_content."""
    raw_bytes = eml_path.read_bytes()
    raw_str = raw_bytes.decode("utf-8", errors="replace")

    results = {}

    # 1. Test multipart file upload
    st = time.time()
    try:
        response = client.post(
            "/api/analyze",
            files={"file": (eml_path.name, raw_bytes, "message/rfc822")}
        )
        duration_ms = (time.time() - st) * 1000
        results["file_upload"] = {
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "success": response.status_code == 200,
            "response_data": response.json() if response.status_code == 200 else response.text
        }
    except Exception as e:
        duration_ms = (time.time() - st) * 1000
        results["file_upload"] = {
            "status_code": -1,
            "duration_ms": duration_ms,
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

    # 2. Test form raw_content upload
    st = time.time()
    try:
        response = client.post(
            "/api/analyze",
            data={"raw_content": raw_str}
        )
        duration_ms = (time.time() - st) * 1000
        results["raw_content"] = {
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "success": response.status_code == 200,
            "response_data": response.json() if response.status_code == 200 else response.text
        }
    except Exception as e:
        duration_ms = (time.time() - st) * 1000
        results["raw_content"] = {
            "status_code": -1,
            "duration_ms": duration_ms,
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

    return results


async def main():
    print("================================================================================")
    print("EMAIL THREAT DETECTION RUNTIME REPRODUCTION INVESTIGATION")
    print("================================================================================")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    eml_files = find_eml_files()
    print(f"Running on: {len(eml_files)} files: {[f.name for f in eml_files]}")

    db = SessionLocal()
    client = TestClient(app)

    all_stage_trackers = []
    http_test_results = {}

    try:
        for eml_file in eml_files:
            tracker = await run_stage_by_stage(eml_file, db)
            all_stage_trackers.append(tracker)

            # Print stage report for this file
            total_dur = sum(s["duration_ms"] for s in tracker.stages)
            print(f"\n--- Stage Execution Summary for {tracker.sample_name} (Total: {total_dur:.2f} ms) ---")
            for s in tracker.stages:
                status_str = f"[{s['status']}]"
                print(f"  {status_str:10} {s['stage']:45} : {s['duration_ms']:8.2f} ms | Start: {s['start_time']} -> End: {s['end_time']} | {s['details']}")

            if tracker.errors:
                print(f"\n  !!! ERRORS ENCOUNTERED IN {len(tracker.errors)} STAGES !!!")
                for err in tracker.errors:
                    print(f"  Stage: {err['stage']}")
                    print(f"  Type:  {err['exception_type']}: {err['exception_msg']}")
                    print(f"  Traceback:\n{err['traceback']}")
                    print(f"  Local variables snapshot:")
                    for k, v in err['local_vars'].items():
                        print(f"    {k} = {v}")

            # Run HTTP endpoint test
            print(f"\n--- HTTP Endpoint Test (POST /api/analyze) for {eml_file.name} ---")
            http_res = run_http_endpoint_test(eml_file, client)
            http_test_results[eml_file.name] = http_res
            for test_type, res in http_res.items():
                if res["success"]:
                    resp_json = res["response_data"]
                    print(f"  [PASS] {test_type:15} -> Status: {res['status_code']} in {res['duration_ms']:.2f} ms | Verdict: {resp_json.get('verdict')} | Score: {resp_json.get('risk_score')} | Severity: {resp_json.get('severity')}")
                else:
                    print(f"  [FAIL] {test_type:15} -> Status: {res['status_code']} in {res['duration_ms']:.2f} ms")
                    if "error" in res:
                        print(f"    Error: {res['error']}")
                    if "traceback" in res:
                        print(f"    Traceback:\n{res['traceback']}")
                    if "response_data" in res:
                        print(f"    Response body: {res['response_data']}")

    finally:
        db.close()

    print("\n================================================================================")
    print("FINAL SUMMARY REPORT")
    print("================================================================================")
    total_samples = len(all_stage_trackers)
    failed_samples = [t for t in all_stage_trackers if t.errors]
    print(f"Total EML samples evaluated: {total_samples}")
    print(f"Samples with stage exceptions: {len(failed_samples)}")

    # Calculate average timing per stage across all files
    stage_timings: Dict[str, List[float]] = {}
    for t in all_stage_trackers:
        for s in t.stages:
            stage_timings.setdefault(s["stage"], []).append(s["duration_ms"])

    print("\nAverage Runtime Per Pipeline Stage Across All EML Files:")
    for stage_name, timings in stage_timings.items():
        avg_t = sum(timings) / len(timings)
        min_t = min(timings)
        max_t = max(timings)
        print(f"  {stage_name:45} : Avg: {avg_t:8.2f} ms  (Min: {min_t:7.2f} ms, Max: {max_t:7.2f} ms)")


if __name__ == "__main__":
    asyncio.run(main())

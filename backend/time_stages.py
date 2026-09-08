import sys
import time
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

import asyncio
from app.services.email_parser import EmailParser
from app.services.header_forensics import HeaderForensicsAnalyzer
from app.services.authentication_analyzer import AuthenticationAnalyzer
from app.services.ioc_extractor import IOCExtractor
from app.services.url_analyzer import URLIntelligence
from app.services.domain_analyzer import DomainIntelligence
from app.services.threat_intelligence import ThreatIntelligenceService
from app.services.attachment_analyzer import AttachmentAnalyzer
from app.services.content_analyzer import ContentAnalyzer
from app.detection.ml_classifier import get_ml_classifier
from app.services.dns_intelligence import DNSIntelligenceService
from app.services.whois_intelligence import WHOISIntelligenceService
from app.services.sender_intelligence import SenderIntelligenceAnalyzer
from app.detection.rule_engine import RuleEngine
from app.detection.risk_scorer import RiskEngine
from app.services.threat_reasoning import ThreatReasoningEngine
from app.services.attack_chain import AttackChainReconstruction
from app.services.evidence_graph import build_evidence_graph
from app.services.case_timeline import build_case_timeline
from app.services.mitre_mapper import map_mitre_techniques
from app.database import SessionLocal, init_db, engine, Base
from app.models.analysis import AnalysisResult
from app.schemas.analysis import EmailAnalysisSchema
from app.services.campaign_correlation import correlate_campaigns
import uuid

async def test_file(eml_path: Path):
    print(f"=== Testing {eml_path.name} ===", flush=True)
    raw = eml_path.read_bytes()

    t0 = time.perf_counter()
    parsed_email = EmailParser.parse_raw(raw)
    t1 = time.perf_counter()
    print(f"1. EmailParser: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    header_forensics = HeaderForensicsAnalyzer.analyze(parsed_email)
    t1 = time.perf_counter()
    print(f"2. HeaderForensics: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    authentication = AuthenticationAnalyzer.analyze(header_forensics, parsed_email)
    t1 = time.perf_counter()
    print(f"3. AuthenticationAnalyzer: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    extracted_iocs = IOCExtractor.extract(parsed_email)
    t1 = time.perf_counter()
    print(f"4. IOCExtractor: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    urls = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "url"]
    url_analysis = URLIntelligence.analyze_batch(urls)
    t1 = time.perf_counter()
    print(f"5. URLIntelligence: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    domains = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "domain"]
    domain_analysis = {domain: DomainIntelligence.analyze(domain) for domain in domains}
    t1 = time.perf_counter()
    print(f"6. DomainIntelligence: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    attachment_analysis = AttachmentAnalyzer.analyze(parsed_email.get("attachments", []))
    t1 = time.perf_counter()
    print(f"7. AttachmentAnalyzer: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    content_analysis = ContentAnalyzer.analyze(parsed_email)
    t1 = time.perf_counter()
    print(f"8. ContentAnalyzer: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    ml_analysis = get_ml_classifier().predict_email(parsed_email)
    t1 = time.perf_counter()
    print(f"9. ML Classifier: {(t1-t0)*1000:.3f} ms", flush=True)

    print(f"Starting DNS / WHOIS for domains: {list(domain_analysis.keys())}", flush=True)
    for domain, details in domain_analysis.items():
        t0 = time.perf_counter()
        details["dns"] = DNSIntelligenceService.resolve_domain(domain)
        t1 = time.perf_counter()
        print(f"10a. DNS for {domain}: {(t1-t0)*1000:.3f} ms", flush=True)

        t0 = time.perf_counter()
        details["whois"] = await WHOISIntelligenceService.lookup_domain(domain)
        t1 = time.perf_counter()
        print(f"10b. WHOIS for {domain}: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    addresses = parsed_email.get("addresses", {}) if isinstance(parsed_email, dict) else {}
    sender_intelligence = SenderIntelligenceAnalyzer.analyze(addresses, header_forensics, authentication)
    t1 = time.perf_counter()
    print(f"11. SenderIntelligence: {(t1-t0)*1000:.3f} ms", flush=True)

    print(f"Starting ThreatIntelligence for {len(extracted_iocs['iocs'])} IOCs", flush=True)
    t0 = time.perf_counter()
    threat_intelligence = await ThreatIntelligenceService().enrich_all(extracted_iocs["iocs"])
    t1 = time.perf_counter()
    print(f"12. ThreatIntelligence: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    rule_result = RuleEngine.analyze(parsed_email)
    t1 = time.perf_counter()
    print(f"13. RuleEngine: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    risk_result = RiskEngine.calculate_risk(
        header_forensics, authentication, extracted_iocs,
        url_analysis, domain_analysis, threat_intelligence,
        attachment_analysis, content_analysis, ml_analysis, rule_result
    )
    t1 = time.perf_counter()
    print(f"14. RiskEngine: {(t1-t0)*1000:.3f} ms", flush=True)

    all_findings = (
        header_forensics.get("forensic_findings", [])
        + authentication.get("findings", [])
        + attachment_analysis.get("findings", [])
        + content_analysis.get("findings", [])
    )
    t0 = time.perf_counter()
    extended_reasoning = ThreatReasoningEngine.generate_reasoning(
        risk_result["verdict"], risk_result["risk_score"], risk_result["score_breakdown"], all_findings
    )
    t1 = time.perf_counter()
    print(f"15. ThreatReasoning: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    attack_chain_steps = AttackChainReconstruction.reconstruct(
        header_forensics, authentication, url_analysis, attachment_analysis, content_analysis
    )
    t1 = time.perf_counter()
    print(f"16. AttackChain: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    evidence_graph = build_evidence_graph(
        addresses, header_forensics, authentication,
        {**extracted_iocs, "attachments": attachment_analysis}
    )
    t1 = time.perf_counter()
    print(f"17. EvidenceGraph: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    timeline = build_case_timeline(addresses, header_forensics, authentication, parsed_email)
    t1 = time.perf_counter()
    print(f"18. Timeline: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    mitre_techniques = map_mitre_techniques({
        "all_findings": all_findings,
        "attachments": attachment_analysis,
        "content": content_analysis,
        "urls": urls,
        "risk": risk_result,
    })
    t1 = time.perf_counter()
    print(f"19. MitreMapper: {(t1-t0)*1000:.3f} ms", flush=True)

    t0 = time.perf_counter()
    analysis_id = str(uuid.uuid4())
    recommendations = (rule_result or {}).get("recommendations", [])
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
    t1 = time.perf_counter()
    print(f"20. EmailAnalysisSchema: {(t1-t0)*1000:.3f} ms", flush=True)

if __name__ == "__main__":
    asyncio.run(test_file(BACKEND_DIR / "test_req.eml"))

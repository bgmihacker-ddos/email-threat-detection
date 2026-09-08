import asyncio
import time
import sys
import os

sys.path.insert(0, r"D:\project\email-threat-detection\backend")

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
from app.detection.rule_engine import RuleEngine
from app.detection.risk_scorer import RiskEngine

async def run_diagnostics(eml_path):
    print(f"Loading EML: {eml_path}")
    with open(eml_path, "rb") as f:
        raw_email = f.read()

    timings = {}

    def record_time(step_name, start_ns, end_ns):
        timings[step_name] = (end_ns - start_ns) / 1_000_000.0  # in ms

    start = time.time_ns()
    parsed_email = EmailParser.parse_raw(raw_email)
    record_time("Email parser", start, time.time_ns())

    start = time.time_ns()
    header_forensics = HeaderForensicsAnalyzer.analyze(parsed_email)
    record_time("Header forensics", start, time.time_ns())

    start = time.time_ns()
    authentication = AuthenticationAnalyzer.analyze(header_forensics, parsed_email)
    record_time("Auth analyzer", start, time.time_ns())

    start = time.time_ns()
    extracted_iocs = IOCExtractor.extract(parsed_email)
    record_time("IOC extractor", start, time.time_ns())

    urls = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "url"]
    domains = [ioc["value"] for ioc in extracted_iocs["iocs"] if ioc["type"] == "domain"]

    start = time.time_ns()
    url_analysis = URLIntelligence.analyze_batch(urls)
    domain_analysis = {domain: DomainIntelligence.analyze(domain) for domain in domains}
    record_time("URL / Domain analyzers", start, time.time_ns())

    start = time.time_ns()
    # Mocking rule engine result which might be needed for risk score
    rule_result = RuleEngine.analyze(parsed_email)
    # attach content
    attachment_analysis = AttachmentAnalyzer.analyze(parsed_email.get("attachments", []))
    content_analysis = ContentAnalyzer.analyze(parsed_email)
    record_time("Content & Attachment analyzer & rules", start, time.time_ns())

    start = time.time_ns()
    ml_analysis = get_ml_classifier().predict_email(parsed_email)
    record_time("ML classifier", start, time.time_ns())

    start = time.time_ns()
    for domain, details in domain_analysis.items():
        try:
            details["dns"] = DNSIntelligenceService.resolve_domain(domain)
        except Exception:
            details["dns"] = {"status": "error"}

        try:
            details["whois"] = await WHOISIntelligenceService.lookup_domain(domain)
        except Exception:
            details["whois"] = {"status": "error"}
    record_time("DNS / WHOIS lookups", start, time.time_ns())

    start = time.time_ns()
    addresses = parsed_email.get("addresses", {}) if isinstance(parsed_email, dict) else {}
    sender_intelligence = SenderIntelligenceAnalyzer.analyze(addresses, header_forensics, authentication)
    record_time("Sender intelligence", start, time.time_ns())

    start = time.time_ns()
    threat_intelligence = await ThreatIntelligenceService().enrich_all(extracted_iocs["iocs"])
    record_time("Threat intelligence (enrich_all)", start, time.time_ns())

    start = time.time_ns()
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
    record_time("Risk scorer", start, time.time_ns())

    all_findings = (
        header_forensics.get("forensic_findings", [])
        + authentication.get("findings", [])
        + attachment_analysis.get("findings", [])
        + content_analysis.get("findings", [])
    )

    start = time.time_ns()
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
    record_time("Artifact / Evidence graph builders", start, time.time_ns())

    start = time.time_ns()
    related_investigations = correlate_campaigns(
        "mock-id",
        extracted_iocs,
        {
            "from_domain": sender_intelligence.get("from_domain"),
            "attachment_hashes": [
                item.get("sha256") for item in attachment_analysis.get("attachments", [])
                if isinstance(item, dict) and item.get("sha256")
            ],
        },
        []
    )
    record_time("Campaign correlation", start, time.time_ns())

    print("\nTIMING LOG TABLE")
    print("-" * 50)
    print(f"{'Step Name':<35} | {'Duration (ms)':>13}")
    print("-" * 50)
    for k, v in timings.items():
        print(f"{k:<35} | {v:>13.2f}")
    print("-" * 50)

if __name__ == "__main__":
    eml_path = sys.argv[1] if len(sys.argv) > 1 else r"D:\project\email-threat-detection\backend\tests\fixtures\emails\malware_executable_attachment.eml"
    asyncio.run(run_diagnostics(eml_path))

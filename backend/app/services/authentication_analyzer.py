"""Phase 6C: Authentication Analysis Engine."""

import re
import logging
from typing import Dict, Any, List, Optional
try:
    import dns.resolver
    DNS_AVAILABLE = True
except ImportError:
    DNS_AVAILABLE = False

logger = logging.getLogger(__name__)

class AuthenticationAnalyzer:
    @staticmethod
    def analyze(header_forensics: Dict[str, Any], email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize authentication evidence and selectively verify DNS."""

        result = {
            "spf": {"status": "missing", "verified": False, "details": {}},
            "dkim": {"status": "missing", "verified": False, "details": {}, "signatures": []},
            "dmarc": {"status": "missing", "verified": False, "details": {}},
            "arc": {"status": "missing", "verified": False, "details": {}},
            "findings": []
        }

        auth_evidence = header_forensics.get("authentication_evidence", {})
        domains = header_forensics.get("domain_relationships", {})

        from_domain = domains.get("from_domain")

        # Seed from reported evidence
        AuthenticationAnalyzer._extract_reported(result, auth_evidence)

        # Attempt safe DNS-based policy verification
        if DNS_AVAILABLE and from_domain:
            AuthenticationAnalyzer._verify_spf(result, from_domain)
            AuthenticationAnalyzer._verify_dmarc(result, from_domain)

        AuthenticationAnalyzer._extract_dkim_signatures(result, email_data)
        AuthenticationAnalyzer._extract_arc(result, email_data)

        AuthenticationAnalyzer._generate_findings(result, from_domain)

        return result

    @staticmethod
    def _extract_reported(result: Dict[str, Any], auth_evidence: Dict[str, Any]):
        for mech in ["spf", "dkim", "dmarc", "arc"]:
            reported = auth_evidence.get(mech, {})
            if reported and reported.get("available"):
                status = reported.get("status")
                if status:
                    result[mech]["status"] = status
                result[mech]["details"]["reported_sources"] = reported.get("sources", [])
                result[mech]["details"]["reported_headers"] = reported.get("reported_by_header", [])

    @staticmethod
    def _fetch_txt(domain: str, prefix: str) -> Optional[str]:
        try:
            answers = dns.resolver.resolve(domain, 'TXT', lifetime=2.0)
            for rdata in answers:
                txt = b"".join(rdata.strings).decode("utf-8")
                if txt.lower().startswith(prefix.lower()):
                    return txt
        except Exception:
            pass
        return None

    @staticmethod
    def _verify_spf(result: Dict[str, Any], domain: str):
        record = AuthenticationAnalyzer._fetch_txt(domain, "v=spf1")
        if record:
            result["spf"]["details"]["record"] = record
            result["spf"]["details"]["domain"] = domain
            result["spf"]["verified"] = True

            policy = "neutral"
            if "-all" in record:
                policy = "hardfail"
            elif "~all" in record:
                policy = "softfail"
            elif "+all" in record:
                policy = "pass_all"
            result["spf"]["details"]["policy"] = policy

    @staticmethod
    def _verify_dmarc(result: Dict[str, Any], domain: str):
        dmarc_domain = f"_dmarc.{domain}"
        record = AuthenticationAnalyzer._fetch_txt(dmarc_domain, "v=DMARC1")
        if record:
            result["dmarc"]["details"]["record"] = record
            result["dmarc"]["details"]["domain"] = domain
            result["dmarc"]["verified"] = True

            # Simple policy extraction
            parts = [p.strip() for p in record.split(";")]
            policy = "none"
            for p in parts:
                if p.startswith("p="):
                    policy = p.split("=")[1].lower()
            result["dmarc"]["details"]["policy"] = policy

    @staticmethod
    def _extract_dkim_signatures(result: Dict[str, Any], email_data: Dict[str, Any]):
        headers = email_data.get("headers", {})
        dkim_headers = headers.get("dkim-signature", [])
        if isinstance(dkim_headers, str):
            dkim_headers = [dkim_headers]

        for dkim in dkim_headers:
            sig = {"domain": None, "selector": None, "algorithm": None}
            d_match = re.search(r"\bd=([^;\s]+)", dkim)
            s_match = re.search(r"\bs=([^;\s]+)", dkim)
            a_match = re.search(r"\ba=([^;\s]+)", dkim)

            if d_match: sig["domain"] = d_match.group(1)
            if s_match: sig["selector"] = s_match.group(1)
            if a_match: sig["algorithm"] = a_match.group(1)

            if DNS_AVAILABLE and sig["domain"] and sig["selector"]:
                dkim_domain = f"{sig['selector']}._domainkey.{sig['domain']}"
                record = AuthenticationAnalyzer._fetch_txt(dkim_domain, "v=DKIM1")
                if record:
                    sig["record_found"] = True
                else:
                    sig["record_found"] = False

            result["dkim"]["signatures"].append(sig)

    @staticmethod
    def _extract_arc(result: Dict[str, Any], email_data: Dict[str, Any]):
        headers = email_data.get("headers", {})
        arc_seals = headers.get("arc-seal", [])
        if isinstance(arc_seals, str): arc_seals = [arc_seals]

        result["arc"]["details"]["seal_count"] = len(arc_seals)

    @staticmethod
    def _generate_findings(result: Dict[str, Any], from_domain: Optional[str]):
        findings = result["findings"]

        # Weak DMARC
        if result["dmarc"]["verified"]:
            policy = result["dmarc"]["details"].get("policy")
            if policy == "none":
                findings.append({
                    "finding_id": "auth.dmarc.weak_policy",
                    "category": "authentication",
                    "title": "Weak DMARC Policy",
                    "description": f"Domain {from_domain} uses a 'none' DMARC policy, which monitors but does not prevent spoofing.",
                    "severity": "low",
                    "confidence": 100,
                    "evidence": [result["dmarc"]["details"].get("record")],
                    "related_iocs": [from_domain] if from_domain else []
                })

        if from_domain and not result["dmarc"]["verified"] and result["dmarc"]["status"] == "missing":
            findings.append({
                "finding_id": "auth.dmarc.missing",
                "category": "authentication",
                "title": "Missing DMARC Record",
                "description": f"Domain {from_domain} lacks a DMARC record, offering no spoofing protection.",
                "severity": "medium",
                "confidence": 90,
                "evidence": [f"Domain: {from_domain}"],
                "related_iocs": [from_domain]
            })

        if result["spf"]["verified"]:
            policy = result["spf"]["details"].get("policy")
            if policy == "pass_all":
                findings.append({
                    "finding_id": "auth.spf.permissive",
                    "category": "authentication",
                    "title": "Permissive SPF Policy",
                    "description": f"Domain {from_domain} uses '+all' in its SPF record, allowing any IP to send mail.",
                    "severity": "high",
                    "confidence": 100,
                    "evidence": [result["spf"]["details"].get("record")],
                    "related_iocs": [from_domain] if from_domain else []
                })

        # Failed DMARC reported
        if result["dmarc"]["status"] in ["fail", "failed"]:
             findings.append({
                "finding_id": "auth.dmarc.fail",
                "category": "authentication",
                "title": "DMARC Validation Failed",
                "description": "Upstream MTA reported a DMARC failure, strongly suggesting email spoofing.",
                "severity": "high",
                "confidence": 100,
                "evidence": result["dmarc"]["details"].get("reported_headers", []),
                "related_iocs": [from_domain] if from_domain else []
             })

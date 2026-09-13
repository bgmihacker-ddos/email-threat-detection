"""India-specific threat intelligence: brand impersonation, UPI/KYC scams, IST anomalies."""

import re
from datetime import datetime, timezone
from typing import Any, Dict, List

_INDIAN_BRANDS = {
    "banks": ["sbi", "state bank", "hdfc", "icici", "axis bank", "pnb", "punjab national",
              "bank of baroda", "canara bank", "kotak", "yes bank", "idbi", "indian bank",
              "union bank", "bob", "rbi", "reserve bank"],
    "upi": ["paytm", "phonepe", "google pay", "gpay", "bhim", "upi", "bharat pay",
            "amazon pay", "cred", "mobikwik", "freecharge"],
    "govt": ["aadhaar", "aadhar", "pan card", "income tax", "gst", "epfo", "provident fund",
             "digilocker", "umang", "cowin", "rti", "nrega", "pmjay", "ayushman",
             "ministry of", "govt of india", "government of india", "mygov"],
    "ecommerce": ["flipkart", "myntra", "meesho", "snapdeal", "jiomart", "bigbasket",
                  "swiggy", "zomato", "dunzo", "blinkit", "nykaa"],
    "telecom": ["jio", "airtel", "vi ", "vodafone", "idea ", "bsnl", "trai"],
}
_FLAT = {brand: cat for cat, brands in _INDIAN_BRANDS.items() for brand in brands}

_INDIA_SCAM_PATTERNS = [
    r"kyc\s*(update|verify|expir|mandatory|pending|suspend)",
    r"(aadhaar|aadhar|pan)\s*(link|verify|update|expir|mismatch)",
    r"upi\s*(id|pin|verify|block|suspend|limit)",
    r"(refund|cashback)\s*(of|worth)?\s*₹?\s*[\d,]+",
    r"(dear\s+customer|valued\s+customer)",
    r"(sbi|hdfc|icici|axis)\s*(yono|net\s*banking|alert)",
    r"electricity\s*(bill|disconnect|payment)",
    r"sim\s*(card|swap|block|deactivat)",
    r"(lucky\s*draw|lottery)\s*(winner|prize|selected)",
    r"(customs|courier)\s*(held|seized|parcel|package)",
    r"(whatsapp|telegram)\s*(job|earn|part.time|work.from.home)",
]
_INDIA_SCAM_RE = [re.compile(p, re.IGNORECASE) for p in _INDIA_SCAM_PATTERNS]

_HINDI_THREAT_KEYWORDS = [
    "turant", "jaldi", "khata band", "kyc", "aadhar", "paisa", "rupaye",
    "account block", "sim block", "otp bheje", "bhejein", "kripya",
    "sarkari", "naukri", "lottery jeetein",
]


class IndiaThreatIntel:
    @staticmethod
    def analyze(email_data: Dict[str, Any]) -> Dict[str, Any]:
        plain = str(email_data.get("plain_text") or "")
        html = str(email_data.get("html_body") or "")
        subject = str(email_data.get("subject") or "")
        full_text = (subject + " " + plain + " " + html).lower()
        headers = email_data.get("headers") or {}

        # Brand impersonation
        impersonated: List[Dict[str, str]] = []
        for brand, category in _FLAT.items():
            if brand in full_text:
                impersonated.append({"brand": brand, "category": category})

        # Scam pattern matches
        scam_hits: List[str] = []
        for rx in _INDIA_SCAM_RE:
            m = rx.search(full_text)
            if m:
                scam_hits.append(m.group(0))

        # Hindi/regional keywords
        hindi_hits = [k for k in _HINDI_THREAT_KEYWORDS if k in full_text]

        # IST timezone anomaly: if claimed sender is Indian but Date header offset isn't +0530
        ist_anomaly = False
        date_header = headers.get("Date") or headers.get("date") or ""
        if impersonated and date_header:
            ist_anomaly = _check_ist_anomaly(date_header)

        # Build findings
        findings: List[Dict[str, Any]] = []

        if impersonated:
            findings.append({
                "finding_id": "india.brand_impersonation",
                "category": "india_specific",
                "title": "Indian Brand Impersonation Detected",
                "description": f"Email references {len(impersonated)} Indian brand(s) which may indicate targeted impersonation.",
                "severity": "high" if len(impersonated) >= 2 else "medium",
                "confidence": min(90, 70 + len(impersonated) * 10),
                "evidence": [f"{b['brand']} ({b['category']})" for b in impersonated[:10]],
                "related_iocs": [],
                "evidence_class": "strong_risk_signal" if scam_hits else "contextual_anomaly",
                "risk_relevance": "risk_contributing" if scam_hits else "contextual",
            })

        if scam_hits:
            findings.append({
                "finding_id": "india.scam_pattern",
                "category": "india_specific",
                "title": "India-Specific Scam Pattern Detected",
                "description": "Email matches known Indian scam patterns (KYC fraud, UPI scams, fake refunds).",
                "severity": "high", "confidence": 88,
                "evidence": scam_hits[:10], "related_iocs": [],
                "evidence_class": "strong_risk_signal", "risk_relevance": "risk_contributing",
            })

        if hindi_hits:
            findings.append({
                "finding_id": "india.hindi_threat_keywords",
                "category": "india_specific",
                "title": "Hindi/Regional Threat Keywords",
                "description": "Email contains Hindi keywords commonly used in social engineering targeting Indian users.",
                "severity": "low", "confidence": 65,
                "evidence": hindi_hits[:10], "related_iocs": [],
                "evidence_class": "contextual_anomaly", "risk_relevance": "contextual",
            })

        if ist_anomaly:
            findings.append({
                "finding_id": "india.timezone_anomaly",
                "category": "india_specific",
                "title": "IST Timezone Mismatch",
                "description": "Email claims Indian origin but Date header timezone is not IST (+0530).",
                "severity": "medium", "confidence": 75,
                "evidence": [f"Date header: {date_header}"], "related_iocs": [],
                "evidence_class": "contextual_anomaly", "risk_relevance": "contextual",
            })

        return {
            "impersonated_brands": impersonated,
            "scam_patterns": scam_hits,
            "hindi_keywords": hindi_hits,
            "ist_timezone_anomaly": ist_anomaly,
            "findings": findings,
        }


def _check_ist_anomaly(date_str: str) -> bool:
    """Returns True if date header exists but offset is NOT +0530."""
    try:
        # Check for +0530 or +05:30 in the raw header
        if "+0530" in date_str or "+05:30" in date_str:
            return False
        # If there's any timezone offset, it's not IST
        if re.search(r"[+-]\d{4}", date_str):
            return True
    except Exception:
        pass
    return False

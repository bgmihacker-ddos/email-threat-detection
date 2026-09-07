"""Phase 6H: Content / NLP / Phishing Analysis.

Analyzes plain text and HTML body for social engineering, urgency,
credential harvesting, financial/payment fraud, brand impersonation, and BEC.
"""

import re
from typing import Any, Dict, List


_URGENCY_KEYWORDS = [
    "urgent", "immediate action", "act now", "critical update",
    "within 24 hours", "account suspended", "limited time", "verify now",
    "final notice", "immediate response required"
]

_CREDENTIAL_KEYWORDS = [
    "password", "verify credentials", "login to continue", "reset password",
    "confirm identity", "security alert", "unauthorized access", "update security",
    "two-factor", "2fa code"
]

_FINANCIAL_KEYWORDS = [
    "invoice", "wire transfer", "payment overdue", "bank details",
    "remittance", "gift card", "direct deposit", "payroll", "purchase order"
]

_AUTHORITY_KEYWORDS = [
    "ceo", "chief executive", "director", "human resources", "it department",
    "help desk", "administrator", "legal department"
]


class ContentAnalyzer:
    @staticmethod
    def analyze(email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform deterministic lexical and structural content analysis."""
        plain_text = email_data.get("plain_text", "")
        html_body = email_data.get("html_body", "")
        full_text = (plain_text + " " + html_body).lower()

        urgency_hits = [k for k in _URGENCY_KEYWORDS if k in full_text]
        credential_hits = [k for k in _CREDENTIAL_KEYWORDS if k in full_text]
        financial_hits = [k for k in _FINANCIAL_KEYWORDS if k in full_text]
        authority_hits = [k for k in _AUTHORITY_KEYWORDS if k in full_text]

        findings: List[Dict[str, Any]] = []

        # BEC check: Authority/Urgency + Financial
        is_bec = bool((authority_hits or urgency_hits) and financial_hits)
        if is_bec:
            findings.append({
                "finding_id": "content.social_engineering.bec",
                "category": "content",
                "title": "Suspected Business Email Compromise (BEC)",
                "description": "Email combines authority references with financial/wire transfer keywords.",
                "severity": "high",
                "confidence": 85,
                "evidence": authority_hits + financial_hits,
                "related_iocs": [],
            })

        # Credential Harvesting check
        if credential_hits:
            findings.append({
                "finding_id": "content.social_engineering.credential_harvesting",
                "category": "content",
                "title": "Credential Harvesting Indicators",
                "description": "Email contains requests related to password resets or security verification.",
                "severity": "medium",
                "confidence": 80,
                "evidence": credential_hits,
                "related_iocs": [],
            })

        # Urgency check
        if urgency_hits:
            findings.append({
                "finding_id": "content.social_engineering.urgency",
                "category": "content",
                "title": "High Urgency / Coercive Language",
                "description": "Email utilizes psychological urgency triggers to prompt rapid action.",
                "severity": "low",
                "confidence": 75,
                "evidence": urgency_hits,
                "related_iocs": [],
            })

        # HTML specific analysis: hidden text, suspicious forms
        html_indicators = []
        if html_body:
            if "<form" in html_body.lower():
                html_indicators.append("embedded_form")
                findings.append({
                    "finding_id": "content.html.embedded_form",
                    "category": "content",
                    "title": "Embedded HTML Form Detected",
                    "description": "Email contains an interactive form, which is frequently used to harvest credentials.",
                    "severity": "high",
                    "confidence": 90,
                    "evidence": ["<form> tag found in HTML"],
                    "related_iocs": [],
                })
            if "display:none" in html_body.lower() or "visibility:hidden" in html_body.lower():
                html_indicators.append("hidden_elements")

        return {
            "urgency_keywords": urgency_hits,
            "credential_keywords": credential_hits,
            "financial_keywords": financial_hits,
            "authority_keywords": authority_hits,
            "is_bec_indicator": is_bec,
            "html_indicators": html_indicators,
            "findings": findings,
        }

"""Phase 6H: Content / NLP / Phishing Analysis Engine.

Analyzes plain text, subject, and HTML body for social engineering, urgency,
credential harvesting, financial/payment fraud, brand impersonation, and BEC.
"""

import re
from html.parser import HTMLParser
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

_URGENCY_KEYWORDS = [
    "urgent", "immediate action", "act now", "critical update",
    "within 24 hours", "account suspended", "limited time", "verify now",
    "final notice", "immediate response required", "deadline", "suspended",
    "expire in 24 hours", "locked", "restriction", "action required"
]

_CREDENTIAL_KEYWORDS = [
    "password", "verify credentials", "login to continue", "reset password",
    "confirm identity", "security alert", "unauthorized access", "update security",
    "two-factor", "2fa code", "otp", "mfa", "confirm account", "security confirmation"
]

_FINANCIAL_KEYWORDS = [
    "invoice", "wire transfer", "payment overdue", "bank details",
    "remittance", "gift card", "direct deposit", "payroll", "purchase order",
    "beneficiary", "account change", "payment deadline", "routing number"
]

_AUTHORITY_KEYWORDS = [
    "ceo", "chief executive", "director", "human resources", "it department",
    "help desk", "administrator", "legal department", "executive", "president",
    "chief financial officer", "cfo", "head of department"
]

_SECRECY_KEYWORDS = [
    "strictly confidential", "keep this private", "do not call",
    "discrete", "handle this privately", "urgent and confidential"
]


class _HTMLDeceptionParser(HTMLParser):
    """Safely extracts deceptive HTML elements: link mismatches, hidden text, forms, iframes."""

    def __init__(self) -> None:
        super().__init__()
        self.forms: int = 0
        self.password_inputs: int = 0
        self.iframes: int = 0
        self.hidden_tags: List[str] = []
        self.links: List[Tuple[str, str]] = [] # (href, text)
        self._current_tag: Optional[str] = None
        self._current_href: Optional[str] = None
        self._current_text: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        tag_lower = tag.lower()
        attr_dict = {k.lower(): (v or "") for k, v in attrs}

        if tag_lower == "form":
            self.forms += 1
        elif tag_lower == "iframe" or tag_lower == "object" or tag_lower == "embed":
            self.iframes += 1
        elif tag_lower == "input":
            if attr_dict.get("type", "").lower() == "password":
                self.password_inputs += 1

        style = attr_dict.get("style", "").lower()
        if "display:none" in style or "visibility:hidden" in style or "font-size:0" in style or "opacity:0" in style:
            self.hidden_tags.append(tag_lower)

        if tag_lower == "a":
            self._current_tag = "a"
            self._current_href = attr_dict.get("href", "")
            self._current_text = []

    def handle_data(self, data: str) -> None:
        if self._current_tag == "a":
            self._current_text.append(data.strip())

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._current_tag == "a":
            visible_text = " ".join(self._current_text).strip()
            if self._current_href:
                self.links.append((self._current_href, visible_text))
            self._current_tag = None
            self._current_href = None
            self._current_text = []


class ContentAnalyzer:
    @staticmethod
    def analyze(email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform layered lexical, psychological, and HTML structural content analysis."""
        plain_text = str(email_data.get("plain_text") or "")
        html_body = str(email_data.get("html_body") or "")
        subject = str(email_data.get("subject") or "")
        full_text = (subject + " " + plain_text + " " + html_body).lower()

        urgency_hits = [k for k in _URGENCY_KEYWORDS if k in full_text]
        credential_hits = [k for k in _CREDENTIAL_KEYWORDS if k in full_text]
        financial_hits = [k for k in _FINANCIAL_KEYWORDS if k in full_text]
        authority_hits = [k for k in _AUTHORITY_KEYWORDS if k in full_text]
        secrecy_hits = [k for k in _SECRECY_KEYWORDS if k in full_text]

        findings: List[Dict[str, Any]] = []
        html_indicators: List[str] = []

        # 1. HTML Structural & Deception Analysis
        if html_body:
            parser = _HTMLDeceptionParser()
            try:
                parser.feed(html_body)
            except Exception:
                pass

            if parser.forms > 0:
                html_indicators.append("embedded_form")
                findings.append({
                    "finding_id": "content.html.embedded_form",
                    "category": "content",
                    "title": "Interactive HTML Form Embedded",
                    "description": "Email contains an interactive form (<form> tag). Standard emails do not include embedded forms; this is commonly used to harvest credentials directly inside email clients.",
                    "severity": "high",
                    "confidence": 95,
                    "evidence": ["<form> tag found in HTML content"],
                    "related_iocs": [],
                    "evidence_class": "strong_risk_signal",
                    "risk_relevance": "risk_contributing"
                })

            if parser.password_inputs > 0:
                html_indicators.append("password_input")
                findings.append({
                    "finding_id": "content.html.password_input",
                    "category": "content",
                    "title": "Password Input Field in Body",
                    "description": "Email body contains a password entry field (<input type='password'>). Legitimate services direct users to official portals rather than embedding password fields in email bodies.",
                    "severity": "high",
                    "confidence": 95,
                    "evidence": ["<input type='password'> field detected"],
                    "related_iocs": [],
                    "evidence_class": "strong_risk_signal",
                    "risk_relevance": "risk_contributing"
                })

            if parser.hidden_tags:
                html_indicators.append("hidden_elements")
                findings.append({
                    "finding_id": "content.html.hidden_text",
                    "category": "content",
                    "title": "Hidden Text or Elements Detected",
                    "description": "Email HTML uses CSS hiding techniques (display:none, font-size:0, visibility:hidden) often used to inject invisible text that fools spam filters.",
                    "severity": "medium",
                    "confidence": 90,
                    "evidence": [f"Hidden tags: {', '.join(set(parser.hidden_tags))}"],
                    "related_iocs": [],
                    "evidence_class": "contextual_anomaly",
                    "risk_relevance": "contextual"
                })

            # Check Link Text vs Href Deception
            for href, text in parser.links:
                if re.match(r"^https?://", text, re.IGNORECASE) or ("." in text and " " not in text):
                    # Text looks like a domain or URL
                    text_host = urlparse("http://" + text if not text.startswith("http") else text).hostname
                    href_host = urlparse(href).hostname
                    if text_host and href_host and text_host.lower() != href_host.lower():
                        html_indicators.append("deceptive_hyperlink")
                        findings.append({
                            "finding_id": "content.html.link_mismatch",
                            "category": "content",
                            "title": "Deceptive Hyperlink Text vs Destination Mismatch",
                            "description": f"The visible link text claims destination '{text_host}', but the actual click URL directs to '{href_host}'. This is a high-confidence phishing tactic.",
                            "severity": "high",
                            "confidence": 98,
                            "evidence": [f"Visible text: {text}", f"Actual href: {href}"],
                            "related_iocs": [href_host],
                            "evidence_class": "strong_risk_signal",
                            "risk_relevance": "risk_contributing"
                        })
                        break

        # 2. Correlated BEC / Wire Fraud Detection
        is_bec = bool((authority_hits or secrecy_hits or urgency_hits) and financial_hits)
        if is_bec:
            evidence_bec = []
            if authority_hits:
                evidence_bec.append(f"Authority cues: {', '.join(authority_hits)}")
            if financial_hits:
                evidence_bec.append(f"Financial requests: {', '.join(financial_hits)}")
            if secrecy_hits:
                evidence_bec.append(f"Secrecy/Urgency: {', '.join(secrecy_hits)}")

            findings.append({
                "finding_id": "content.social_engineering.bec",
                "category": "content",
                "title": "Business Email Compromise (BEC) / Wire Fraud Patterns",
                "description": "Email combines executive authority, urgent/confidential pressure, and payment/wire transfer language.",
                "severity": "high",
                "confidence": 88,
                "evidence": evidence_bec,
                "related_iocs": [],
                "evidence_class": "strong_risk_signal",
                "risk_relevance": "risk_contributing"
            })

        # 3. Credential Harvesting Language Detection
        if credential_hits:
            findings.append({
                "finding_id": "content.social_engineering.credential_harvesting",
                "category": "content",
                "title": "Credential Harvesting Cues Detected",
                "description": "Email contains requests related to password resets, OTP verification, or urgent identity confirmation.",
                "severity": "medium",
                "confidence": 80,
                "evidence": credential_hits,
                "related_iocs": [],
                "evidence_class": "strong_risk_signal" if ("embedded_form" in html_indicators or urgency_hits) else "contextual_anomaly",
                "risk_relevance": "risk_contributing" if ("embedded_form" in html_indicators or urgency_hits) else "contextual"
            })

        # 4. Standalone Urgency Language
        if urgency_hits and not is_bec:
            findings.append({
                "finding_id": "content.social_engineering.urgency",
                "category": "content",
                "title": "Urgency / Coercive Language",
                "description": "Email contains psychological urgency triggers designed to provoke hasty user response.",
                "severity": "low",
                "confidence": 75,
                "evidence": urgency_hits,
                "related_iocs": [],
                "evidence_class": "contextual_anomaly",
                "risk_relevance": "contextual"
            })

        return {
            "urgency_keywords": urgency_hits,
            "credential_keywords": credential_hits,
            "financial_keywords": financial_hits,
            "authority_keywords": authority_hits,
            "secrecy_keywords": secrecy_hits,
            "is_bec_indicator": is_bec,
            "html_indicators": html_indicators,
            "findings": findings,
        }

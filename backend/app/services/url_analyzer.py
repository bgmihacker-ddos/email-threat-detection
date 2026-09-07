"""Phase 6E: URL Intelligence — offline URL analysis and enrichment."""

import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse, parse_qs
import ipaddress


_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "short.link", "rb.gy", "cutt.ly", "tiny.cc",
}

_SUSPICIOUS_TLDS = {
    "tk", "ml", "ga", "cf", "gq", "top", "xyz", "buzz", "club",
    "work", "click", "link", "info", "online", "site", "icu",
}


class URLIntelligence:
    @staticmethod
    def analyze(url: str) -> Dict[str, Any]:
        """Analyze a single URL for suspicious characteristics."""
        result: Dict[str, Any] = {
            "url": url,
            "normalized": url.strip().rstrip("/"),
            "scheme": None,
            "hostname": None,
            "port": None,
            "path": None,
            "query": None,
            "fragment": None,
            "registrable_domain": None,
            "indicators": [],
            "risk_indicators": 0,
        }

        try:
            parsed = urlparse(url)
        except Exception:
            result["indicators"].append("malformed_url")
            result["risk_indicators"] = 1
            return result

        result["scheme"] = parsed.scheme
        result["hostname"] = parsed.hostname
        result["port"] = parsed.port
        result["path"] = parsed.path
        result["query"] = parsed.query or None
        result["fragment"] = parsed.fragment or None

        host = parsed.hostname or ""

        # IP-hosted URL
        try:
            ipaddress.ip_address(host)
            result["indicators"].append("ip_hosted_url")
        except ValueError:
            pass

        # Punycode detection
        if host.startswith("xn--") or ".xn--" in host:
            result["indicators"].append("punycode_domain")

        # Suspicious encoding
        if "%" in url and re.search(r"%[0-9a-fA-F]{2}", url):
            encoded_chars = re.findall(r"%[0-9a-fA-F]{2}", url)
            if len(encoded_chars) > 3:
                result["indicators"].append("excessive_encoding")

        # URL shortener
        if host.lower() in _SHORTENERS:
            result["indicators"].append("url_shortener")

        # Suspicious TLD
        tld = host.rsplit(".", 1)[-1].lower() if "." in host else ""
        if tld in _SUSPICIOUS_TLDS:
            result["indicators"].append("suspicious_tld")

        # Credential-looking URL (user:pass@host)
        if parsed.username or "@" in (parsed.netloc or ""):
            result["indicators"].append("credential_url")

        # Excessive subdomains
        if host.count(".") >= 4:
            result["indicators"].append("excessive_subdomains")

        # Registrable domain (simple: last two parts)
        parts = host.split(".")
        if len(parts) >= 2:
            result["registrable_domain"] = ".".join(parts[-2:])

        result["risk_indicators"] = len(result["indicators"])

        return result

    @staticmethod
    def analyze_batch(urls: List[str]) -> List[Dict[str, Any]]:
        return [URLIntelligence.analyze(url) for url in urls]

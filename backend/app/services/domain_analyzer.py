"""Phase 6E: Domain Intelligence — lexical and offline domain analysis."""

from typing import Any, Dict, List, Optional
try:
    import dns.resolver
    DNS_AVAILABLE = True
except ImportError:
    DNS_AVAILABLE = False


_SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "banking",
    "signin", "support", "service", "auth", "confirm", "security"
]


class DomainIntelligence:
    @staticmethod
    def analyze(domain: str) -> Dict[str, Any]:
        """Analyze a domain name lexically and query optional DNS records."""
        domain_clean = domain.strip().lower().strip(".<>[]()\"'")
        result: Dict[str, Any] = {
            "domain": domain_clean,
            "tld": domain_clean.rsplit(".", 1)[-1] if "." in domain_clean else "",
            "length": len(domain_clean),
            "subdomain_count": domain_clean.count(".") - 1 if domain_clean.count(".") >= 1 else 0,
            "punycode": domain_clean.startswith("xn--"),
            "suspicious_keywords_found": [],
            "dns": {
                "available": DNS_AVAILABLE,
                "a": [],
                "mx": [],
                "txt": [],
            }
        }

        for kw in _SUSPICIOUS_KEYWORDS:
            if kw in domain_clean:
                result["suspicious_keywords_found"].append(kw)

        if DNS_AVAILABLE and domain_clean:
            # A records
            try:
                answers = dns.resolver.resolve(domain_clean, 'A', lifetime=1.5)
                result["dns"]["a"] = [r.address for r in answers]
            except Exception:
                pass

            # MX records
            try:
                answers = dns.resolver.resolve(domain_clean, 'MX', lifetime=1.5)
                result["dns"]["mx"] = [str(r.exchange) for r in answers]
            except Exception:
                pass

            # TXT records
            try:
                answers = dns.resolver.resolve(domain_clean, 'TXT', lifetime=1.5)
                result["dns"]["txt"] = [b"".join(r.strings).decode("utf-8") for r in answers]
            except Exception:
                pass

        return result

"""WHOIS intelligence lookup service."""

import logging
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

class WHOISIntelligenceService:
    """Offline-friendly / Cached WHOIS enrichment via whoisxmlapi or similar provider."""

    _TIMEOUT = httpx.Timeout(5.0, connect=2.0)

    @classmethod
    async def lookup_domain(cls, domain: str) -> Dict[str, Any]:
        """Fetch WHOIS data for a domain."""
        if not settings.WHOIS_API_KEY:
            return {"status": "not_configured"}

        try:
            # Assuming whoisxmlapi for the structure based on common WHOIS_API_KEY env setups
            # adjust if a different provider was intended.
            async with httpx.AsyncClient(timeout=cls._TIMEOUT) as client:
                response = await client.get(
                    "https://www.whoisxmlapi.com/whoisserver/WhoisService",
                    params={
                        "apiKey": settings.WHOIS_API_KEY,
                        "domainName": domain,
                        "outputFormat": "JSON"
                    }
                )

            if response.status_code != 200:
                logger.warning(f"WHOIS lookup failed with status {response.status_code}")
                return {"status": "error", "error": f"HTTP {response.status_code}"}

            data = response.json()
            whr = data.get("WhoisRecord", {})

            registry_data = whr.get("registryData", {})
            created = registry_data.get("createdDate") or whr.get("createdDate")
            expires = registry_data.get("expiresDate") or whr.get("expiresDate")
            registrar = whr.get("registrarName")

            return {
                "status": "ok",
                "domain": domain,
                "created_date": created,
                "expires_date": expires,
                "registrar": registrar,
                "raw_record": data
            }
        except httpx.TimeoutException:
            return {"status": "timeout", "error": "Provider request timed out."}
        except Exception as e:
            logger.warning(f"WHOIS lookup exception: {e}")
            return {"status": "error", "error": str(e)}

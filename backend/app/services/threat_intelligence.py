"""Optional external threat-intelligence enrichment.

Only normalized indicator values are sent to configured providers.  Raw email
content, credentials, attachment bytes, and provider keys never leave this
service or appear in responses.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

import httpx

from app.core.config import settings


ProviderResult = Dict[str, Any]


@dataclass(frozen=True)
class ThreatIntelProvider:
    """Base class for a narrow, indicator-only intelligence provider."""

    name: str
    api_key: Optional[str]

    async def lookup(self, indicator_type: str, indicator: str) -> ProviderResult:
        raise NotImplementedError

    def unavailable(self, indicator_type: str, indicator: str, reason: str) -> ProviderResult:
        return _result(self.name, indicator, indicator_type, "unavailable", error=reason)


class VirusTotalProvider(ThreatIntelProvider):
    """VirusTotal v3 indicator lookup, called only when a key is configured."""

    def __init__(self) -> None:
        super().__init__("VirusTotal", settings.VIRUSTOTAL_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str) -> ProviderResult:
        if not self.api_key:
            return self.unavailable(indicator_type, indicator, "VirusTotal API key is not configured.")

        endpoint_type = {"url": "urls", "domain": "domains", "ip": "ip_addresses", "ipv6": "ip_addresses", "hash": "files"}.get(indicator_type)
        if not endpoint_type:
            return self.unavailable(indicator_type, indicator, "Provider does not support this indicator type.")

        # URL identifiers are base64 URL-safe encoded without padding in v3.
        target = indicator
        if indicator_type == "url":
            import base64
            target = base64.urlsafe_b64encode(indicator.encode("utf-8")).decode("ascii").rstrip("=")

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.get(
                    f"https://www.virustotal.com/api/v3/{endpoint_type}/{target}",
                    headers={"x-apikey": self.api_key},
                )
            if response.status_code == 404:
                return _result(self.name, indicator, indicator_type, "not_found")
            if response.status_code in {401, 403}:
                return _result(self.name, indicator, indicator_type, "unavailable", error="Provider authorization failed.")
            if response.status_code == 429:
                return _result(self.name, indicator, indicator_type, "rate_limited", error="Provider rate limit reached.")
            response.raise_for_status()
            stats = response.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            malicious = int(stats.get("malicious", 0))
            suspicious = int(stats.get("suspicious", 0))
            detections = malicious + suspicious
            return _result(
                self.name,
                indicator,
                indicator_type,
                "ok",
                reputation="malicious" if malicious else ("suspicious" if suspicious else "unknown"),
                detections=detections,
                confidence=min(100, detections * 10),
                categories=[key for key, value in stats.items() if value],
            )
        except httpx.TimeoutException:
            return _result(self.name, indicator, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, indicator, indicator_type, "error", error="Provider request failed.")


class URLhausProvider(ThreatIntelProvider):
    """URLhaus URL lookup. Its endpoint is intentionally URL-only."""

    def __init__(self) -> None:
        super().__init__("URLhaus", settings.URLHAUS_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str) -> ProviderResult:
        if not self.api_key:
            return self.unavailable(indicator_type, indicator, "URLhaus API key is not configured.")
        if indicator_type != "url":
            return self.unavailable(indicator_type, indicator, "Provider does not support this indicator type.")
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.post(
                    "https://urlhaus-api.abuse.ch/v1/url/",
                    data={"url": indicator},
                    headers={"API-KEY": self.api_key},
                )
            if response.status_code == 404:
                return _result(self.name, indicator, indicator_type, "not_found")
            if response.status_code in {401, 403}:
                return _result(self.name, indicator, indicator_type, "unavailable", error="Provider authorization failed.")
            if response.status_code == 429:
                return _result(self.name, indicator, indicator_type, "rate_limited", error="Provider rate limit reached.")
            response.raise_for_status()
            payload = response.json()
            if payload.get("query_status") != "ok":
                return _result(self.name, indicator, indicator_type, "not_found")
            tags = payload.get("tags") or []
            return _result(
                self.name,
                indicator,
                indicator_type,
                "ok",
                reputation="malicious",
                detections=1,
                confidence=90,
                categories=list(tags),
                first_seen=payload.get("date_added"),
                last_seen=payload.get("last_online"),
                references=[payload.get("urlhaus_reference")] if payload.get("urlhaus_reference") else [],
            )
        except httpx.TimeoutException:
            return _result(self.name, indicator, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, indicator, indicator_type, "error", error="Provider request failed.")


class ThreatFoxProvider(ThreatIntelProvider):
    """ThreatFox IOC lookup against the documented v1 query API."""

    def __init__(self) -> None:
        super().__init__("ThreatFox", settings.THREATFOX_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str) -> ProviderResult:
        if not self.api_key:
            return self.unavailable(indicator_type, indicator, "ThreatFox API key is not configured.")
        if indicator_type not in {"url", "domain", "ip", "ipv6", "hash"}:
            return self.unavailable(indicator_type, indicator, "Provider does not support this indicator type.")
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.post(
                    "https://threatfox-api.abuse.ch/api/v1/",
                    json={"query": "search_ioc", "search_term": indicator},
                    headers={"API-KEY": self.api_key},
                )
            if response.status_code in {401, 403}:
                return _result(self.name, indicator, indicator_type, "unavailable", error="Provider authorization failed.")
            if response.status_code == 429:
                return _result(self.name, indicator, indicator_type, "rate_limited", error="Provider rate limit reached.")
            response.raise_for_status()
            payload = response.json()
            records = payload.get("data") if payload.get("query_status") == "ok" else []
            if not records:
                return _result(self.name, indicator, indicator_type, "not_found")
            record = records[0]
            confidence = int(record.get("confidence_level") or 0)
            return _result(
                self.name,
                indicator,
                indicator_type,
                "ok",
                reputation="malicious",
                detections=len(records),
                confidence=confidence,
                categories=[record.get("threat_type")] if record.get("threat_type") else [],
                first_seen=record.get("first_seen"),
                last_seen=record.get("last_seen"),
                references=[record.get("reference")] if record.get("reference") else [],
            )
        except httpx.TimeoutException:
            return _result(self.name, indicator, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, indicator, indicator_type, "error", error="Provider request failed.")


class AbuseIPDBProvider(ThreatIntelProvider):
    """AbuseIPDB IP lookup."""

    def __init__(self) -> None:
        super().__init__("AbuseIPDB", settings.ABUSEIPDB_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str) -> ProviderResult:
        if not self.api_key:
            return self.unavailable(indicator_type, indicator, "AbuseIPDB API key is not configured.")
        if indicator_type not in {"ip", "ipv6"}:
            return self.unavailable(indicator_type, indicator, "Provider does not support this indicator type.")
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    headers={"Key": self.api_key, "Accept": "application/json"},
                    params={"ipAddress": indicator, "maxAgeInDays": 90},
                )
            if response.status_code in {401, 403}:
                return _result(self.name, indicator, indicator_type, "unavailable", error="Provider authorization failed.")
            if response.status_code == 429:
                return _result(self.name, indicator, indicator_type, "rate_limited", error="Provider rate limit reached.")
            response.raise_for_status()
            data = response.json().get("data", {})
            score = int(data.get("abuseConfidenceScore") or 0)
            return _result(
                self.name,
                indicator,
                indicator_type,
                "ok",
                reputation="malicious" if score >= 50 else ("suspicious" if score else "unknown"),
                detections=score,
                confidence=score,
                categories=["reported_abuse"] if score else [],
            )
        except httpx.TimeoutException:
            return _result(self.name, indicator, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, indicator, indicator_type, "error", error="Provider request failed.")


def _result(
    provider: str,
    indicator: str,
    indicator_type: str,
    status: str,
    reputation: str = "unknown",
    detections: int = 0,
    confidence: int = 0,
    categories: Optional[List[str]] = None,
    first_seen: Optional[str] = None,
    last_seen: Optional[str] = None,
    references: Optional[List[str]] = None,
    error: Optional[str] = None,
) -> ProviderResult:
    return {
        "provider": provider,
        "indicator": indicator,
        "indicator_type": indicator_type,
        "status": status,
        "reputation": reputation,
        "detections": detections,
        "confidence": confidence,
        "categories": categories or [],
        "first_seen": first_seen,
        "last_seen": last_seen,
        "references": references or [],
        "error": error,
    }


class ThreatIntelligenceService:
    """Fuses optional provider lookups with bounded concurrency and a small cache."""

    _cache: Dict[Tuple[str, str], List[ProviderResult]] = {}

    def __init__(self, providers: Optional[Iterable[ThreatIntelProvider]] = None) -> None:
        self.providers = list(providers) if providers is not None else [
            VirusTotalProvider(),
            URLhausProvider(),
            ThreatFoxProvider(),
            AbuseIPDBProvider(),
        ]

    async def enrich_ioc(self, indicator_type: str, indicator: str) -> List[ProviderResult]:
        key = (indicator_type, indicator.lower())
        if key in self._cache:
            return self._cache[key]
        results = await asyncio.gather(
            *(provider.lookup(indicator_type, indicator) for provider in self.providers),
            return_exceptions=True,
        )
        normalized = [
            item for item in results if isinstance(item, dict)
        ]
        self._cache[key] = normalized
        return normalized

    async def enrich_all(self, iocs: List[Dict[str, Any]]) -> List[ProviderResult]:
        """Deduplicate supported indicators and enrich at most twelve per email."""
        supported = {"url", "domain", "ip", "ipv6", "hash"}
        unique: List[Tuple[str, str]] = []
        seen = set()
        for ioc in iocs:
            indicator_type = str(ioc.get("type") or "")
            value = str(ioc.get("normalized_value") or ioc.get("value") or "")
            key = (indicator_type, value.lower())
            if indicator_type in supported and value and key not in seen:
                seen.add(key)
                unique.append((indicator_type, value))
            if len(unique) == 12:
                break
        batches = await asyncio.gather(*(self.enrich_ioc(*item) for item in unique))
        return [result for batch in batches for result in batch]

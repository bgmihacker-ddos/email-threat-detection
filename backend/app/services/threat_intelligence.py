"""Credential-gated threat-intelligence lookups with normalized results."""

from __future__ import annotations

import asyncio
import base64
import ipaddress
import time
import logging
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple, Set
from urllib.parse import urlparse

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

ProviderResult = Dict[str, Any]
_TIMEOUT = httpx.Timeout(5.0, connect=2.0)
_MAX_INDICATOR_LENGTH = 2048


def _configured(value: Optional[str]) -> bool:
    return bool(value and value.strip())


def _normalize_indicator(indicator_type: str, indicator: str) -> Optional[str]:
    value = str(indicator or "").strip()
    if not value or len(value) > _MAX_INDICATOR_LENGTH:
        return None
    kind = indicator_type.lower().strip()
    if kind in {"ip", "ipv6"}:
        try:
            parsed = ipaddress.ip_address(value)
        except ValueError:
            return None
        if kind == "ip" and parsed.version != 4:
            return None
        if kind == "ipv6" and parsed.version != 6:
            return None
        return str(parsed)
    if kind == "url":
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return None
        return value
    if kind in {"domain", "hash"}:
        return value.lower()
    return None


@dataclass
class ThreatIntelProvider:
    name: str
    api_key: Optional[str]
    _circuit_breaker_until: float = 0.0

    async def lookup(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> ProviderResult:
        raise NotImplementedError

    def is_healthy(self) -> bool:
        if not _configured(self.api_key):
            return False
        return time.monotonic() >= self._circuit_breaker_until

    def trip_circuit_breaker(self, duration: float = 300.0) -> None:
        """Trip circuit breaker for providers on unauthorized or persistent errors."""
        self._circuit_breaker_until = time.monotonic() + duration
        logger.warning(f"Circuit breaker tripped for provider {self.name} due to auth/persistent error.")

    def unavailability_reason(self) -> str:
        if not _configured(self.api_key):
            return "not_configured"
        if time.monotonic() < self._circuit_breaker_until:
            return "circuit_broken"
        return "available"

    def unavailable_result(self, indicator_type: str, indicator: str) -> ProviderResult:
        reason = self.unavailability_reason()
        error_msg = f"{self.name} API key is not configured." if reason == "not_configured" else f"{self.name} is temporarily disabled (unauthorized/rate-limited)."
        status = "not_configured" if reason == "not_configured" else "skipped"
        return _result(self.name, indicator, indicator_type, status, error=error_msg)

    def invalid_result(self, indicator_type: str, indicator: str) -> ProviderResult:
        return _result(self.name, indicator, indicator_type, "error", error="Unsupported or malformed indicator.")


class VirusTotalProvider(ThreatIntelProvider):
    """VirusTotal v3 object lookup; this never submits or uploads an indicator."""

    def __init__(self) -> None:
        super().__init__("VirusTotal", settings.VIRUSTOTAL_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> ProviderResult:
        if not self.is_healthy():
            return self.unavailable_result(indicator_type, indicator)
        value = _normalize_indicator(indicator_type, indicator)
        endpoint_type = {"url": "urls", "domain": "domains", "ip": "ip_addresses", "ipv6": "ip_addresses", "hash": "files"}.get(indicator_type)
        if not value or not endpoint_type:
            return self.invalid_result(indicator_type, indicator)
        target = base64.urlsafe_b64encode(value.encode()).decode().rstrip("=") if indicator_type == "url" else value

        if client is not None:
            result = await _get_object(self, value, indicator_type, f"https://www.virustotal.com/api/v3/{endpoint_type}/{target}", {"x-apikey": self.api_key}, client)
        else:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as local_client:
                result = await _get_object(self, value, indicator_type, f"https://www.virustotal.com/api/v3/{endpoint_type}/{target}", {"x-apikey": self.api_key}, local_client)

        if result["status"] in {"unavailable", "rate_limited"}:
            self.trip_circuit_breaker()
        return result


class URLhausProvider(ThreatIntelProvider):
    """URLhaus URL lookup using the abuse.ch Auth-Key header."""

    def __init__(self) -> None:
        super().__init__("URLhaus", settings.URLHAUS_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> ProviderResult:
        if not self.is_healthy():
            return self.unavailable_result(indicator_type, indicator)
        value = _normalize_indicator(indicator_type, indicator)
        if indicator_type != "url" or not value:
            return self.invalid_result(indicator_type, indicator)
        try:
            if client is not None:
                response = await client.post("https://urlhaus-api.abuse.ch/v1/url/", data={"url": value}, headers={"Auth-Key": self.api_key})
            else:
                async with httpx.AsyncClient(timeout=_TIMEOUT) as local_client:
                    response = await local_client.post("https://urlhaus-api.abuse.ch/v1/url/", data={"url": value}, headers={"Auth-Key": self.api_key})
            result = _urlhaus_result(self.name, value, indicator_type, response)
            if result["status"] in {"unauthorized", "rate_limited"}:
                self.trip_circuit_breaker()
            return result
        except httpx.TimeoutException:
            return _result(self.name, value, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, value, indicator_type, "error", error="Provider request failed.")


class ThreatFoxProvider(ThreatIntelProvider):
    """ThreatFox IOC lookup using the abuse.ch Auth-Key header."""

    def __init__(self) -> None:
        super().__init__("ThreatFox", settings.THREATFOX_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> ProviderResult:
        if not self.is_healthy():
            return self.unavailable_result(indicator_type, indicator)
        value = _normalize_indicator(indicator_type, indicator)
        if indicator_type not in {"url", "domain", "ip", "ipv6", "hash"} or not value:
            return self.invalid_result(indicator_type, indicator)
        try:
            if client is not None:
                response = await client.post("https://threatfox-api.abuse.ch/api/v1/", json={"query": "search_ioc", "search_term": value}, headers={"Auth-Key": self.api_key})
            else:
                async with httpx.AsyncClient(timeout=_TIMEOUT) as local_client:
                    response = await local_client.post("https://threatfox-api.abuse.ch/api/v1/", json={"query": "search_ioc", "search_term": value}, headers={"Auth-Key": self.api_key})
            result = _threatfox_result(self.name, value, indicator_type, response)
            if result["status"] in {"unauthorized", "rate_limited"}:
                self.trip_circuit_breaker()
            return result
        except httpx.TimeoutException:
            return _result(self.name, value, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, value, indicator_type, "error", error="Provider request failed.")


class AbuseIPDBProvider(ThreatIntelProvider):
    """AbuseIPDB v2 IP reputation lookup."""

    def __init__(self) -> None:
        super().__init__("AbuseIPDB", settings.ABUSEIPDB_API_KEY)

    async def lookup(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> ProviderResult:
        if not self.is_healthy():
            return self.unavailable_result(indicator_type, indicator)
        value = _normalize_indicator(indicator_type, indicator)
        if indicator_type not in {"ip", "ipv6"} or not value:
            return self.invalid_result(indicator_type, indicator)
        try:
            if client is not None:
                response = await client.get("https://api.abuseipdb.com/api/v2/check", headers={"Key": self.api_key, "Accept": "application/json"}, params={"ipAddress": value, "maxAgeInDays": 90})
            else:
                async with httpx.AsyncClient(timeout=_TIMEOUT) as local_client:
                    response = await local_client.get("https://api.abuseipdb.com/api/v2/check", headers={"Key": self.api_key, "Accept": "application/json"}, params={"ipAddress": value, "maxAgeInDays": 90})
            result = _abuse_result(self.name, value, indicator_type, response)
            if result["status"] in {"unauthorized", "rate_limited"}:
                self.trip_circuit_breaker()
            return result
        except httpx.TimeoutException:
            return _result(self.name, value, indicator_type, "timeout", error="Provider request timed out.")
        except httpx.HTTPError:
            return _result(self.name, value, indicator_type, "error", error="Provider request failed.")


async def _get_object(provider_obj: ThreatIntelProvider, indicator: str, kind: str, endpoint: str, headers: Dict[str, str], client: httpx.AsyncClient) -> ProviderResult:
    provider = provider_obj.name
    try:
        response = await client.get(endpoint, headers=headers)
        status = _http_status(provider, indicator, kind, response)
        if status:
            return status
        payload = response.json()
        stats = payload.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        malicious = _int(stats.get("malicious")); suspicious = _int(stats.get("suspicious"))
        detections = malicious + suspicious
        return _result(provider, indicator, kind, "ok", "malicious" if malicious else ("suspicious" if suspicious else "unknown"), detections, min(100, detections * 10), [str(k) for k, v in stats.items() if _int(v)])
    except (httpx.TimeoutException, httpx.ReadTimeout):
        return _result(provider, indicator, kind, "timeout", error="Provider request timed out.")
    except (httpx.HTTPError, ValueError, TypeError, AttributeError):
        return _result(provider, indicator, kind, "error", error="Provider response was unavailable or malformed.")


def _http_status(provider: str, indicator: str, kind: str, response: httpx.Response) -> Optional[ProviderResult]:
    if response.status_code == 404: return _result(provider, indicator, kind, "not_found")
    if response.status_code in {401, 403}: return _result(provider, indicator, kind, "unavailable", error="Provider authorization failed.")
    if response.status_code == 429: return _result(provider, indicator, kind, "rate_limited", error="Provider rate limit reached.")
    if response.status_code >= 400: return _result(provider, indicator, kind, "error", error="Provider request failed.")
    return None


def _urlhaus_result(provider: str, indicator: str, kind: str, response: httpx.Response) -> ProviderResult:
    status = _http_status(provider, indicator, kind, response)
    if status: return status
    try:
        payload = response.json()
        if payload.get("query_status") != "ok": return _result(provider, indicator, kind, "not_found")
        tags = [str(x) for x in (payload.get("tags") or [])]
        return _result(provider, indicator, kind, "ok", "malicious", 1, 90, tags, payload.get("date_added"), payload.get("last_online"), [payload["urlhaus_reference"]] if payload.get("urlhaus_reference") else [])
    except (ValueError, TypeError, AttributeError):
        return _result(provider, indicator, kind, "error", error="Provider response was malformed.")
    except Exception as e:
        return _result(provider, indicator, kind, "error", error=f"Provider response error {str(e)}")

def _threatfox_result(provider: str, indicator: str, kind: str, response: httpx.Response) -> ProviderResult:
    status = _http_status(provider, indicator, kind, response)
    if status: return status
    try:
        payload = response.json(); records = payload.get("data") if payload.get("query_status") == "ok" else []
        if not records: return _result(provider, indicator, kind, "not_found")
        records = records if isinstance(records, list) else [records]; record = records[0]
        return _result(provider, indicator, kind, "ok", "malicious", len(records), max(0, min(100, _int(record.get("confidence_level")))), [str(record["threat_type"])] if record.get("threat_type") else [], record.get("first_seen"), record.get("last_seen"), [record["reference"]] if record.get("reference") else [])
    except (ValueError, TypeError, AttributeError):
        return _result(provider, indicator, kind, "error", error="Provider response was malformed.")


def _abuse_result(provider: str, indicator: str, kind: str, response: httpx.Response) -> ProviderResult:
    status = _http_status(provider, indicator, kind, response)
    if status: return status
    try:
        score = max(0, min(100, _int(response.json().get("data", {}).get("abuseConfidenceScore"))))
        return _result(provider, indicator, kind, "ok", "malicious" if score >= 50 else ("suspicious" if score else "unknown"), score, score, ["reported_abuse"] if score else [])
    except (ValueError, TypeError, AttributeError):
        return _result(provider, indicator, kind, "error", error="Provider response was malformed.")


def _int(value: Any) -> int:
    try: return max(0, int(value or 0))
    except (TypeError, ValueError): return 0


def _result(provider: str, indicator: str, indicator_type: str, status: str, reputation: str = "unknown", detections: int = 0, confidence: int = 0, categories: Optional[List[str]] = None, first_seen: Optional[str] = None, last_seen: Optional[str] = None, references: Optional[List[str]] = None, error: Optional[str] = None) -> ProviderResult:
    return {"provider": provider, "indicator": indicator, "indicator_type": indicator_type, "status": status, "reputation": reputation, "detections": detections, "confidence": confidence, "categories": categories or [], "first_seen": first_seen, "last_seen": last_seen, "references": references or [], "error": error}


class ThreatIntelligenceService:
    """Bounded, deduplicated provider enrichment with TTL caching and Connection Pooling."""

    _cache: Dict[Tuple[str, str], Tuple[float, List[ProviderResult]]] = {}
    _CACHE_TTL_SECONDS = 300
    _CACHE_MAX_ENTRIES = 512

    # Global list of provider instances to preserve circuit breaker states across requests
    _GLOBAL_PROVIDERS = [VirusTotalProvider(), URLhausProvider(), ThreatFoxProvider(), AbuseIPDBProvider()]

    def __init__(self, providers: Optional[Iterable[ThreatIntelProvider]] = None) -> None:
        self.providers = list(providers) if providers is not None else self._GLOBAL_PROVIDERS

    async def enrich_ioc(self, indicator_type: str, indicator: str, client: Optional[httpx.AsyncClient] = None) -> List[ProviderResult]:
        key = (indicator_type.lower(), indicator.lower())
        now = time.monotonic()
        cached = self._cache.get(key)
        if cached and now - cached[0] < self._CACHE_TTL_SECONDS: return cached[1]

        if cached: self._cache.pop(key, None)

        # Bounded concurrency across providers
        results = await asyncio.gather(*(p.lookup(indicator_type, indicator, client) for p in self.providers), return_exceptions=True)
        normalized = [r if isinstance(r, dict) else _result(p.name, indicator, indicator_type, "error", error=f"Unhandled exception: {str(r)}") for r, p in zip(results, self.providers)]

        if len(self._cache) >= self._CACHE_MAX_ENTRIES:
            oldest = min(self._cache, key=lambda item: self._cache[item][0]); self._cache.pop(oldest, None)

        self._cache[key] = (now, normalized)
        return normalized

    async def enrich_all(self, iocs: List[Dict[str, Any]]) -> List[ProviderResult]:
        supported = {"url", "domain", "ip", "ipv6", "hash"}
        unique = []
        seen = set()

        for ioc in iocs:
            kind = str(ioc.get("type") or "")
            value = str(ioc.get("normalized_value") or ioc.get("value") or "")
            key = (kind, value.lower())
            if kind in supported and value and key not in seen:
                seen.add(key)
                unique.append((kind, value))

            if len(unique) == 12:  # Bounded item count to prevent abuse
                break

        # Connection pooling via a shared AsyncClient
        limits = httpx.Limits(max_connections=12, max_keepalive_connections=8)
        async with httpx.AsyncClient(timeout=_TIMEOUT, limits=limits) as client:
            batches = await asyncio.gather(*(self.enrich_ioc(kind, val, client) for kind, val in unique))

        return [item for batch in batches for item in batch]

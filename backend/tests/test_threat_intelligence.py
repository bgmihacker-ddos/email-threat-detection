"""Unit tests for external threat intelligence providers with mocked responses."""

from __future__ import annotations

import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.services.threat_intelligence import (
    AbuseIPDBProvider,
    CIRCLHashlookupProvider,
    CertificateTransparencyProvider,
    AlienVaultOTXProvider,
    GoogleSafeBrowsingProvider,
    RDAPProvider,
    ThreatFoxProvider,
    ThreatIntelligenceService,
    URLhausProvider,
    VirusTotalProvider,
)


@pytest.mark.asyncio
async def test_google_safe_browsing_match_is_malicious():
    with patch("app.services.threat_intelligence.settings.GOOGLE_SAFE_BROWSING_API_KEY", "test_google_key"):
        provider = GoogleSafeBrowsingProvider()
        with patch("httpx.AsyncClient.post") as mock_post:
            response = MagicMock(status_code=200)
            response.json.return_value = {"matches": [{"threatType": "SOCIAL_ENGINEERING"}]}
            mock_post.return_value = response
            result = await provider.lookup("url", "https://example.com/login")

    assert result["status"] == "ok"
    assert result["reputation"] == "malicious"
    assert result["categories"] == ["SOCIAL_ENGINEERING"]


@pytest.mark.asyncio
async def test_otx_pulse_context_is_not_auto_malicious():
    with patch.dict("os.environ", {"OTX_API_KEY": "test_otx_key"}):
        provider = AlienVaultOTXProvider()
        with patch("httpx.AsyncClient.get") as mock_get:
            response = MagicMock(status_code=200)
            response.json.return_value = {"pulse_info": {"count": 2, "pulses": [{"name": "Test pulse"}]}}
            mock_get.return_value = response
            result = await provider.lookup("domain", "example.com")

    assert result["status"] == "ok"
    assert result["reputation"] == "suspicious"
    assert result["metadata"]["pulse_count"] == 2


@pytest.mark.asyncio
async def test_keyless_rdap_provider_returns_registration_context():
    provider = RDAPProvider()
    with patch("httpx.AsyncClient.get") as mock_get:
        response = MagicMock(status_code=200)
        response.json.return_value = {"name": "example.com", "status": ["active"]}
        mock_get.return_value = response
        result = await provider.lookup("domain", "example.com")

    assert result["status"] == "ok"
    assert result["reputation"] == "unknown"
    assert result["metadata"]["name"] == "example.com"


@pytest.mark.asyncio
async def test_keyless_certificate_provider_returns_history_context():
    provider = CertificateTransparencyProvider()
    with patch("httpx.AsyncClient.get") as mock_get:
        response = MagicMock(status_code=200)
        response.json.return_value = [{"issuer_name": "Test CA", "name_value": "example.com"}]
        mock_get.return_value = response
        result = await provider.lookup("domain", "example.com")

    assert result["status"] == "ok"
    assert result["detections"] == 1
    assert result["reputation"] == "unknown"


@pytest.mark.asyncio
async def test_keyless_hashlookup_provider_returns_known_file_context():
    provider = CIRCLHashlookupProvider()
    with patch("httpx.AsyncClient.get") as mock_get:
        response = MagicMock(status_code=200)
        response.json.return_value = {"SHA-256": "a" * 64, "FileName": "sample.bin"}
        mock_get.return_value = response
        result = await provider.lookup("hash", "a" * 64)

    assert result["status"] == "ok"
    assert result["reputation"] == "unknown"
    assert result["metadata"]["file_name"] == "sample.bin"


@pytest.mark.asyncio
async def test_virustotal_no_key():
    with patch("app.services.threat_intelligence.settings.VIRUSTOTAL_API_KEY", None):
        provider = VirusTotalProvider()
        res = await provider.lookup("domain", "example.com")
        assert res["status"] == "not_configured"
        assert "not configured" in res["error"]


@pytest.mark.asyncio
async def test_virustotal_url_encoding_and_headers():
    with patch("app.services.threat_intelligence.settings.VIRUSTOTAL_API_KEY", "test_vt_key"):
        provider = VirusTotalProvider()
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "data": {
                    "attributes": {
                        "last_analysis_stats": {"malicious": 5, "suspicious": 1, "harmless": 60}
                    }
                }
            }
            mock_get.return_value = mock_resp

            res = await provider.lookup("url", "https://example.com/login")
            assert res["status"] == "ok"
            assert res["reputation"] == "malicious"
            assert res["detections"] == 6
            assert res["confidence"] == 60

            # Verify endpoint called uses base64-encoded URL and correct header
            assert mock_get.called
            call_args, call_kwargs = mock_get.call_args
            assert "api/v3/urls/" in call_args[0]
            assert call_kwargs["headers"] == {"x-apikey": "test_vt_key"}


@pytest.mark.asyncio
async def test_virustotal_clean_indicator():
    with patch("app.services.threat_intelligence.settings.VIRUSTOTAL_API_KEY", "test_vt_key"):
        provider = VirusTotalProvider()
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "data": {
                    "attributes": {
                        "last_analysis_stats": {"malicious": 0, "suspicious": 0, "harmless": 70}
                    }
                }
            }
            mock_get.return_value = mock_resp

            res = await provider.lookup("domain", "example.com")
            assert res["status"] == "ok"
            assert res["reputation"] == "unknown"  # Never fabricate malicious or benign
            assert res["detections"] == 0


@pytest.mark.asyncio
async def test_urlhaus_no_key():
    with patch("app.services.threat_intelligence.settings.URLHAUS_API_KEY", None):
        provider = URLhausProvider()
        res = await provider.lookup("url", "https://example.com")
        assert res["status"] == "not_configured"


@pytest.mark.asyncio
async def test_urlhaus_mocked_request_and_response():
    with patch("app.services.threat_intelligence.settings.URLHAUS_API_KEY", "test_uh_key"):
        provider = URLhausProvider()
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "query_status": "ok",
                "tags": ["malware", "downloader"],
                "urlhaus_reference": "https://urlhaus.abuse.ch/url/12345/",
                "date_added": "2026-09-01",
                "last_online": "2026-09-07",
            }
            mock_post.return_value = mock_resp

            res = await provider.lookup("url", "https://example.com/test")
            assert res["status"] == "ok"
            assert res["reputation"] == "malicious"
            assert "malware" in res["categories"]

            assert mock_post.called
            call_args, call_kwargs = mock_post.call_args
            assert call_args[0] == "https://urlhaus-api.abuse.ch/v1/url/"
            assert call_kwargs["headers"] == {"Auth-Key": "test_uh_key"}
            assert call_kwargs["data"] == {"url": "https://example.com/test"}


@pytest.mark.asyncio
async def test_urlhaus_not_found():
    with patch("app.services.threat_intelligence.settings.URLHAUS_API_KEY", "test_uh_key"):
        provider = URLhausProvider()
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {"query_status": "no_results"}
            mock_post.return_value = mock_resp

            res = await provider.lookup("url", "https://example.com/clean")
            assert res["status"] == "not_found"
            assert res["reputation"] == "unknown"


@pytest.mark.asyncio
async def test_threatfox_no_key():
    with patch("app.services.threat_intelligence.settings.THREATFOX_API_KEY", None):
        provider = ThreatFoxProvider()
        res = await provider.lookup("ip", "1.1.1.1")
        assert res["status"] == "not_configured"


@pytest.mark.asyncio
async def test_threatfox_mocked_request_and_response():
    with patch("app.services.threat_intelligence.settings.THREATFOX_API_KEY", "test_tf_key"):
        provider = ThreatFoxProvider()
        with patch("httpx.AsyncClient.post") as mock_post:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {
                "query_status": "ok",
                "data": [
                    {
                        "confidence_level": 85,
                        "threat_type": "botnet_cc",
                        "first_seen": "2026-09-01",
                        "last_seen": "2026-09-07",
                        "reference": "https://threatfox.abuse.ch/ioc/999/",
                    }
                ],
            }
            mock_post.return_value = mock_resp

            res = await provider.lookup("ip", "192.0.2.1")
            assert res["status"] == "ok"
            assert res["reputation"] == "malicious"
            assert res["confidence"] == 85
            assert "botnet_cc" in res["categories"]

            assert mock_post.called
            call_args, call_kwargs = mock_post.call_args
            assert call_args[0] == "https://threatfox-api.abuse.ch/api/v1/"
            assert call_kwargs["headers"] == {"Auth-Key": "test_tf_key"}
            assert call_kwargs["json"] == {"query": "search_ioc", "search_term": "192.0.2.1"}


@pytest.mark.asyncio
async def test_abuseipdb_no_key():
    with patch("app.services.threat_intelligence.settings.ABUSEIPDB_API_KEY", None):
        provider = AbuseIPDBProvider()
        res = await provider.lookup("ip", "192.0.2.1")
        assert res["status"] == "not_configured"


@pytest.mark.asyncio
async def test_abuseipdb_mocked_request_and_response():
    with patch("app.services.threat_intelligence.settings.ABUSEIPDB_API_KEY", "test_ab_key"):
        provider = AbuseIPDBProvider()
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_resp.json.return_value = {"data": {"abuseConfidenceScore": 75}}
            mock_get.return_value = mock_resp

            res = await provider.lookup("ip", "192.0.2.1")
            assert res["status"] == "ok"
            assert res["reputation"] == "malicious"
            assert res["confidence"] == 75

            assert mock_get.called
            call_args, call_kwargs = mock_get.call_args
            assert call_args[0] == "https://api.abuseipdb.com/api/v2/check"
            assert call_kwargs["headers"] == {"Key": "test_ab_key", "Accept": "application/json"}
            assert call_kwargs["params"] == {"ipAddress": "192.0.2.1", "maxAgeInDays": 90}


@pytest.mark.asyncio
async def test_error_status_mapping_and_rate_limiting():
    with patch("app.services.threat_intelligence.settings.VIRUSTOTAL_API_KEY", "test_key"):
        provider = VirusTotalProvider()

        # 429 Rate limit
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 429
            mock_get.return_value = mock_resp
            res = await provider.lookup("domain", "example.com")
            assert res["status"] == "rate_limited"

        # 401 / 403 Unauthorized
        provider._circuit_breaker_until = 0
        with patch("httpx.AsyncClient.get") as mock_get:
            mock_resp = MagicMock()
            mock_resp.status_code = 401
            mock_get.return_value = mock_resp
            res = await provider.lookup("domain", "example.com")
            assert res["status"] == "unavailable"

        # Timeout
        provider._circuit_breaker_until = 0
        with patch("httpx.AsyncClient.get", side_effect=httpx.TimeoutException("Timeout")):
            res = await provider.lookup("domain", "example.com")
            assert res["status"] == "timeout"


@pytest.mark.asyncio
async def test_enrich_ioc_skips_unconfigured_providers():
    provider_a = VirusTotalProvider()
    provider_b = URLhausProvider()
    provider_a.api_key = None
    provider_b.api_key = None

    with (
        patch.object(provider_a, "lookup", new_callable=AsyncMock) as mock_a,
        patch.object(provider_b, "lookup", new_callable=AsyncMock) as mock_b,
    ):
        service = ThreatIntelligenceService(providers=[provider_a, provider_b])
        service._cache.clear()
        results = await service.enrich_ioc("domain", "example.com")

    assert len(results) == 2
    assert all(item["status"] == "not_configured" for item in results)
    assert mock_a.await_count == 0
    assert mock_b.await_count == 0


@pytest.mark.asyncio
async def test_enrich_ioc_skips_circuit_broken_providers():
    provider = VirusTotalProvider()
    provider.api_key = "configured"
    provider._circuit_breaker_until = time.monotonic() + 60

    with patch.object(provider, "lookup", new_callable=AsyncMock) as mock_lookup:
        service = ThreatIntelligenceService(providers=[provider])
        service._cache.clear()
        results = await service.enrich_ioc("domain", "example.com")

    assert len(results) == 1
    assert results[0]["status"] == "skipped"
    assert mock_lookup.await_count == 0


@pytest.mark.asyncio
async def test_caching_and_enrich_all():
    service = ThreatIntelligenceService(providers=[])
    # Manually test cache TTL and storage
    service._cache.clear()
    res = await service.enrich_ioc("domain", "example.com")
    assert len(res) == 0
    assert ("domain", "example.com") in service._cache

    # Repeat call uses cache
    res2 = await service.enrich_ioc("domain", "example.com")
    assert res == res2


def test_ioc_priority_prefers_infrastructure_and_threat_artifacts():
    received_ip = {"type": "ip", "source": "received_chain", "confidence": 90}
    suspicious_url = {"type": "url", "context": "credential phishing URL", "confidence": 80}
    attachment_hash = {"type": "hash", "source": "attachment", "confidence": 90}
    ordinary_domain = {"type": "domain", "source": "header", "confidence": 70}

    assert ThreatIntelligenceService._ioc_priority(received_ip) > ThreatIntelligenceService._ioc_priority(ordinary_domain)
    assert ThreatIntelligenceService._ioc_priority(suspicious_url) > ThreatIntelligenceService._ioc_priority(ordinary_domain)
    assert ThreatIntelligenceService._ioc_priority(attachment_hash) > ThreatIntelligenceService._ioc_priority(ordinary_domain)

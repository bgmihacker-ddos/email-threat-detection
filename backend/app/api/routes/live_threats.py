import asyncio
import httpx
from fastapi import APIRouter
from app.integrations.threatfox import ThreatFoxService
from app.integrations.urlhaus import URLhausService
from app.services.geo_enricher import GeoEnricher
from app.core.config import settings

router = APIRouter()

@router.get("/live-threats", response_model=dict)
async def get_live_threats():
    tf = ThreatFoxService()
    uh = URLhausService()

    tf_response, uh_response = await asyncio.gather(
        tf.get_recent_ioc(),
        uh.get_recent_urls(),
        return_exceptions=True,
    )

    if isinstance(tf_response, Exception):
        tf_response = {"data": [], "status": "error", "error_message": str(tf_response)}
    if isinstance(uh_response, Exception):
        uh_response = {"data": [], "status": "error", "error_message": str(uh_response)}

    all_data = []

    # 1. Collect all events first
    for item in tf_response.get("data", []):
        all_data.append({
            "id": f"TF-{item.id}",
            "indicator": item.indicator,
            "indicator_type": item.indicator_type,
            "country": item.country,
            "country_code": item.country_code,
            "city": None,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "severity": item.severity,
            "confidence": item.confidence,
            "source": item.source,
            "timestamp": item.first_seen or item.last_seen or "",
            "geo_source": None,
            "malware": item.malware,
            "tags": item.tags,
            "reference_url": item.reference_url,
            "reporter": item.reporter,
            "threat_type": item.threat_type,
            "status": item.status,
            "first_seen": item.first_seen,
            "last_seen": item.last_seen,
        })

    for item in uh_response.get("data", []):
        all_data.append({
            "id": f"UH-{item.id}",
            "indicator": item.indicator,
            "indicator_type": item.indicator_type,
            "country": item.country,
            "country_code": item.country_code,
            "city": None,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "severity": item.severity,
            "confidence": item.confidence,
            "source": item.source,
            "timestamp": item.first_seen or item.last_seen or "",
            "geo_source": None,
            "malware": item.malware,
            "tags": item.tags,
            "reference_url": item.reference_url,
            "reporter": item.reporter,
            "threat_type": item.threat_type,
            "status": item.status,
            "first_seen": item.first_seen,
            "last_seen": item.last_seen,
        })

    # 2. Extract public IPs for enrichment
    ip_events = []
    unique_ips = set()
    for event in all_data:
        # Ignore if already geolocated by the provider
        if event["latitude"] is not None and event["longitude"] is not None:
            continue

        candidate_ip = GeoEnricher.extract_ip(event["indicator"])
        if candidate_ip:
            event["_clean_ip"] = candidate_ip
            ip_events.append(event)
            unique_ips.add(candidate_ip)

    # 3. Request missing IP geolocations with bounded concurrency
    # Limits simultaneous external calls and bounds total enrichment time
    new_ips = [ip for ip in unique_ips if ip not in GeoEnricher._cache][:25]
    if new_ips:
        semaphore = asyncio.Semaphore(10)

        async def _enrich_worker(http_client: httpx.AsyncClient, ip: str):
            async with semaphore:
                try:
                    await GeoEnricher.enrich_ip(ip, client=http_client)
                except Exception:
                    pass

        try:
            async with httpx.AsyncClient(timeout=settings.GEOLOCATION_API_TIMEOUT_SECONDS) as client:
                await asyncio.wait_for(
                    asyncio.gather(*(_enrich_worker(client, ip) for ip in new_ips), return_exceptions=True),
                    timeout=5.0,
                )
        except asyncio.TimeoutError:
            pass





    # 4. Apply geolocation data to events
    for event in ip_events:
        clean_ip = event.get("_clean_ip")
        if not clean_ip:
            continue

        del event["_clean_ip"]

        # Apply cached result if it exists and succeeded
        cached_result = GeoEnricher._cache.get(clean_ip)
        if cached_result:
            event["latitude"] = cached_result["latitude"]
            event["longitude"] = cached_result["longitude"]
            event["country"] = cached_result["country"]
            if cached_result.get("country_code"):
                event["country_code"] = cached_result["country_code"]
            if cached_result.get("city"):
                event["city"] = cached_result["city"]
            event["geo_source"] = cached_result["geo_source"]

    return {
        "data": all_data,
        "meta": {
            "count": len(all_data),
            "providers": [
                {"source": "ThreatFox", "status": tf_response.get("status", "unknown"), "error": tf_response.get("error_message")},
                {"source": "URLhaus", "status": uh_response.get("status", "unknown"), "error": uh_response.get("error_message")}
            ]
        }
    }

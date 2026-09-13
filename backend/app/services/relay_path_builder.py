"""Build an ordered, geo-enriched relay path from parsed email headers."""

from __future__ import annotations

from typing import Any, Dict, List

from app.services.geo_enricher import GeoEnricher


async def build_relay_path(header_forensics: Dict[str, Any]) -> List[Dict[str, Any]]:
    mail_flow = header_forensics.get("mail_flow") if isinstance(header_forensics, dict) else {}
    hops = mail_flow.get("hops", []) if isinstance(mail_flow, dict) else []
    result: List[Dict[str, Any]] = []

    for index, hop in enumerate(hops if isinstance(hops, list) else []):
        if not isinstance(hop, dict):
            hop = {}
        classifications = hop.get("ip_classifications") if isinstance(hop.get("ip_classifications"), list) else []
        ip = next((item.get("ip") for item in classifications if isinstance(item, dict) and item.get("ip")), None)
        is_private = not bool(ip and GeoEnricher.is_public_ip(ip))
        geo = await GeoEnricher.enrich_ip(ip) if ip and not is_private else None
        result.append({
            "hop_number": index + 1,
            "from_server": hop.get("from_server"),
            "by_server": hop.get("by_server"),
            "ip": ip,
            "timestamp": hop.get("timestamp"),
            "timestamp_utc": hop.get("timestamp_utc"),
            "geo": geo,
            "is_private": is_private,
            "is_suspicious": bool(geo and (geo.get("is_proxy") or geo.get("is_hosting") or geo.get("is_tor_exit_node"))),
        })
    return result

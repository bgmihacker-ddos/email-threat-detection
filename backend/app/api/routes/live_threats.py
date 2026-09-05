from fastapi import APIRouter
from typing import List, Optional
from app.integrations.threatfox import ThreatFoxService
from app.integrations.urlhaus import URLhausService

router = APIRouter()

@router.get("/live-threats", response_model=dict)
async def get_live_threats():
    tf = ThreatFoxService()
    uh = URLhausService()

    tf_response = await tf.get_recent_ioc()
    uh_response = await uh.get_recent_urls()

    all_data = []

    # Process ThreatFox
    for item in tf_response["data"]:
        # Only include if we have geo data
        if item.latitude is not None and item.longitude is not None:
            all_data.append({
                "id": f"TF-{item.id}",
                "indicator": item.indicator,
                "indicator_type": item.indicator_type,
                "country": item.country,
                "country_code": item.country_code,
                "latitude": item.latitude,
                "longitude": item.longitude,
                "severity": item.severity,
                "confidence": item.confidence,
                "source": item.source,
                "timestamp": item.first_seen if item.first_seen else ""
            })

    # Process URLhaus (no geo data usually)
    for item in uh_response["data"]:
        all_data.append({
            "id": f"UH-{item.id}",
            "indicator": item.indicator,
            "indicator_type": item.indicator_type,
            "country": "Unknown",
            "country_code": None,
            "severity": item.severity,
            "confidence": item.confidence,
            "source": item.source,
            "timestamp": ""
        })

    return {
        "data": all_data,
        "meta": {
            "count": len(all_data),
            "providers": [
                {"source": "ThreatFox", "status": tf_response["status"], "error": tf_response["error_message"]},
                {"source": "URLhaus", "status": uh_response["status"], "error": uh_response["error_message"]}
            ]
        }
    }

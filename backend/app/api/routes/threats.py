from fastapi import APIRouter
from typing import List
from app.schemas.indicator import ThreatIndicator
from app.integrations.threatfox import ThreatFoxService
from app.integrations.urlhaus import URLhausService

router = APIRouter()

@router.get("/threats", response_model=dict)
async def get_threats(limit: int = 100):
    tf = ThreatFoxService()
    uh = URLhausService()

    tf_response = await tf.get_recent_ioc()
    uh_response = await uh.get_recent_urls()

    all_data = tf_response["data"] + uh_response["data"]

    return {
        "data": all_data[:limit],
        "meta": {
            "source": "ThreatFox, URLhaus",
            "count": len(all_data[:limit]),
            "providers": [
                {"source": "ThreatFox", "status": tf_response["status"], "error": tf_response["error_message"]},
                {"source": "URLhaus", "status": uh_response["status"], "error": uh_response["error_message"]}
            ]
        }
    }

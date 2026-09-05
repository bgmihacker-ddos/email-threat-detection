from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.indicator import ThreatIndicator
from app.integrations.threatfox import ThreatFoxService
from app.integrations.urlhaus import URLhausService

router = APIRouter()

@router.get("/indicators", response_model=dict)
async def get_indicators(
    type: Optional[str] = None,
    source: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    tf = ThreatFoxService()
    uh = URLhausService()

    tf_response = await tf.get_recent_ioc()
    uh_response = await uh.get_recent_urls()

    all_data = tf_response["data"] + uh_response["data"]

    # Apply filters
    filtered_data = all_data

    if type:
        filtered_data = [i for i in filtered_data if i.indicator_type == type]
    if source:
        filtered_data = [i for i in filtered_data if i.source == source]
    if risk:
        filtered_data = [i for i in filtered_data if i.severity == risk]
    if search:
        search_lower = search.lower()
        filtered_data = [i for i in filtered_data if search_lower in i.indicator.lower()]

    paginated_data = filtered_data[offset : offset + limit]

    return {
        "data": paginated_data,
        "meta": {
            "count": len(paginated_data),
            "total": len(filtered_data),
            "providers": [
                {"source": "ThreatFox", "status": tf_response["status"], "error": tf_response["error_message"]},
                {"source": "URLhaus", "status": uh_response["status"], "error": uh_response["error_message"]}
            ]
        }
    }

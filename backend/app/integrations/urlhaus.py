import httpx
import logging
from typing import List, Optional
from app.schemas.provider import ProviderResponse
from app.schemas.indicator import ThreatIndicator
from app.core.config import settings

logger = logging.getLogger(__name__)

class URLhausService:
    def __init__(self):
        self.base_url = "https://urlhaus-api.abuse.ch/v1/"
        self.timeout = 10.0

    async def get_recent_urls(self) -> ProviderResponse:
        if not settings.URLHAUS_API_KEY:
            return {"data": [], "status": "not_configured", "error_message": "API key missing"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"API-KEY": settings.URLHAUS_API_KEY}
                response = await client.post(self.base_url + "urls/recent/", data={"limit": 100}, headers=headers)
                response.raise_for_status()
                data = response.json()

                if data.get("query_status") != "ok":
                    logger.error(f"URLhaus API Error: {data.get('query_status')}")
                    return {"data": [], "status": "error", "error_message": data.get('query_status')}

                indicators = []
                for item in data.get("urls", []):
                    indicators.append(ThreatIndicator(
                        id=str(item.get("id")),
                        indicator=item.get("url"),
                        indicator_type="url",
                        severity="high",
                        confidence=80,
                        source="URLhaus",
                        status="active" if item.get("url_status") == "online" else "inactive",
                        tags=item.get("tags", []),
                        reference_url=item.get("urlhaus_reference")
                    ))
                logger.info(f"URLhaus: HTTP 200, received {len(data.get('urls', []))} records, normalized {len(indicators)}")
                return {"data": indicators, "status": "ok", "error_message": None}
        except httpx.HTTPError as e:
            logger.error(f"URLhaus HTTP Error: {e}")
            return {"data": [], "status": "error", "error_message": str(e)}
        except Exception as e:
            logger.error(f"URLhaus Unexpected Error: {e}")
            return {"data": [], "status": "error", "error_message": str(e)}

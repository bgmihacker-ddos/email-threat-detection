import httpx
import logging
from typing import List, Optional
from app.schemas.provider import ProviderResponse
from app.schemas.indicator import ThreatIndicator
from app.core.config import settings

logger = logging.getLogger(__name__)

class ThreatFoxService:
    def __init__(self):
        self.api_key = settings.THREATFOX_API_KEY
        self.base_url = "https://threatfox-api.abuse.ch/api/v1/"
        self.timeout = 10.0

    async def get_recent_ioc(self) -> ProviderResponse:
        if not self.api_key:
            return {"data": [], "status": "not_configured", "error_message": "API key missing"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"API-KEY": self.api_key}
                response = await client.post(self.base_url, json={"query": "get_recent_iocs", "days": 1}, headers=headers)
                response.raise_for_status()
                data = response.json()

                if data.get("query_status") != "ok":
                    logger.error(f"ThreatFox API Error: {data.get('query_status')}")
                    return {"data": [], "status": "error", "error_message": data.get('query_status')}

                indicators = []
                for item in data.get("data", []):
                    indicators.append(ThreatIndicator(
                        id=item.get("ioc_id"),
                        indicator=item.get("ioc"),
                        indicator_type=item.get("ioc_type"),
                        severity=self._map_severity(item.get("threat_type")),
                        confidence=int(item.get("confidence_level", 0)),
                        source="ThreatFox",
                        status="active" if item.get("status") == "online" else "inactive",
                        malware=item.get("malware"),
                        tags=item.get("tags", []),
                        reference_url=item.get("reference"),
                        latitude=float(item.get("geo_lat")) if item.get("geo_lat") else None,
                        longitude=float(item.get("geo_long")) if item.get("geo_long") else None,
                        country=item.get("country")
                    ))
                logger.info(f"ThreatFox: HTTP 200, received {len(data.get('data', []))} records, normalized {len(indicators)}")
                return {"data": indicators, "status": "ok", "error_message": None}
        except httpx.HTTPError as e:
            logger.error(f"ThreatFox HTTP Error: {e}")
            return {"data": [], "status": "error", "error_message": str(e)}
        except Exception as e:
            logger.error(f"ThreatFox Unexpected Error: {e}")
            return {"data": [], "status": "error", "error_message": str(e)}

    def _map_severity(self, threat_type: Optional[str]) -> str:
        # Simple mapping for now
        return "high" # Placeholder

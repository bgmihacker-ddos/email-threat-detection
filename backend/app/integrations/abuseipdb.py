import httpx
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AbuseIPDBService:
    def __init__(self):
        self.api_key = settings.ABUSEIPDB_API_KEY
        self.base_url = "https://api.abuseipdb.com/api/v2/check"
        self.timeout = 10.0

    async def get_ip_reputation(self, ip: str) -> Optional[dict]:
        if not self.api_key:
            logger.warning("AbuseIPDB API Key not configured")
            return None

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Key": self.api_key, "Accept": "application/json"}
                params = {"ipAddress": ip, "maxAgeInDays": "90"}
                response = await client.get(self.base_url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()

                return data.get("data")
        except httpx.HTTPError as e:
            logger.error(f"AbuseIPDB HTTP Error: {e}")
            return None
        except Exception as e:
            logger.error(f"AbuseIPDB Unexpected Error: {e}")
            return None

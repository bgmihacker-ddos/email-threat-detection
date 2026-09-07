import os
from typing import List
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()


def _parse_cors_origins(value: str) -> List[str]:
    origins = []
    for raw_origin in value.split(","):
        origin = raw_origin.strip().rstrip("/")
        if not origin:
            continue

        parsed = urlparse(origin)
        if parsed.scheme and parsed.netloc:
            origin = f"{parsed.scheme}://{parsed.netloc}"

        origins.append(origin)
    return origins


def _normalize_database_url(value: str) -> str:
    if value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql://", 1)
    return value


class Settings:
    APP_NAME = os.getenv("APP_NAME", "Email Threat Detection Platform")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    DATABASE_URL = _normalize_database_url(
        os.getenv("DATABASE_URL", "sqlite:///./email_threat_detection.db")
    )

    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    CORS_ORIGINS = _parse_cors_origins(
        os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,https://sih-2026-project-blush.vercel.app",
        )
    )

    THREATFOX_API_KEY = os.getenv("THREATFOX_API_KEY")
    ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY")
    URLHAUS_API_KEY = os.getenv("URLHAUS_API_KEY")
    VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
    URLSCAN_API_KEY = os.getenv("URLSCAN_API_KEY")
    GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")
    GEOLOCATION_API_URL = os.getenv("GEOLOCATION_API_URL", "https://ipapi.co")
    GEOLOCATION_API_TIMEOUT_SECONDS = float(os.getenv("GEOLOCATION_API_TIMEOUT_SECONDS", "3"))
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()

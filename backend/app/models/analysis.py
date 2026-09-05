import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, JSON, String

from app.database.base import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verdict = Column(String(32), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False, index=True)
    severity = Column(String(32), nullable=False, index=True)
    confidence = Column(Integer, nullable=False)
    summary = Column(String(1000), nullable=False)
    result = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

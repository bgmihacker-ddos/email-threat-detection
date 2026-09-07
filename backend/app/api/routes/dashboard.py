"""Persisted analysis aggregations for the SOC dashboard.

This route only summarizes results created by the local analysis pipeline. It does
not represent external intelligence feeds or invent operational outcomes.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.analysis import AnalysisResult

router = APIRouter()


_SEVERITY_COLORS = {
    "critical": "#ef4444",
    "high": "#f97316",
    "medium": "#eab308",
    "low": "#06b6d4",
    "info": "#64748b",
}


def _as_utc(value: datetime) -> datetime:
    """Normalize SQLite's naive timestamps and aware database timestamps."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _summary(record: AnalysisResult) -> Dict[str, Any]:
    """Produce a compact record without embedding parsed email content."""
    result = record.result if isinstance(record.result, dict) else {}
    email = result.get("email") if isinstance(result.get("email"), dict) else {}
    metadata = email.get("metadata") if isinstance(email.get("metadata"), dict) else {}
    sender = email.get("from") or metadata.get("from")
    recipient = email.get("to") or metadata.get("to") or []
    if isinstance(recipient, list):
        recipient = ", ".join(str(item) for item in recipient[:3])

    return {
        "analysis_id": record.id,
        "verdict": record.verdict,
        "risk_score": record.risk_score,
        "severity": record.severity,
        "confidence": record.confidence,
        "summary": record.summary,
        "subject": email.get("subject") or metadata.get("subject") or "(no subject)",
        "sender": sender or "(unknown sender)",
        "recipient": recipient or "(no recipient)",
        "created_at": _as_utc(record.created_at).isoformat(),
        "status": "analyzed",
    }


@router.get("/dashboard/summary", response_model=dict)
def get_dashboard_summary(
    recent_limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Return honest dashboard aggregates over persisted local analyses."""
    records: List[AnalysisResult] = (
        db.query(AnalysisResult)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1000)
        .all()
    )

    verdict_counts = Counter(record.verdict for record in records)
    severity_counts = Counter(record.severity for record in records)
    total = len(records)
    malicious_or_suspicious = verdict_counts["malicious"] + verdict_counts["suspicious"]
    average_risk = round(sum(record.risk_score for record in records) / total, 1) if total else 0

    now = datetime.now(timezone.utc)
    start_day = (now - timedelta(days=6)).date()
    daily = {str(start_day + timedelta(days=index)): 0 for index in range(7)}
    daily_malicious = {str(start_day + timedelta(days=index)): 0 for index in range(7)}
    indicator_counts: Counter[str] = Counter()

    for record in records:
        created_at = _as_utc(record.created_at)
        day = str(created_at.date())
        if day in daily:
            daily[day] += 1
            if record.verdict in {"malicious", "suspicious"}:
                daily_malicious[day] += 1

        result = record.result if isinstance(record.result, dict) else {}
        extracted = result.get("extracted_iocs") if isinstance(result.get("extracted_iocs"), dict) else {}
        for ioc in extracted.get("iocs", [])[:100]:
            if not isinstance(ioc, dict):
                continue
            value = str(ioc.get("normalized_value") or ioc.get("value") or "").strip()
            if value:
                indicator_counts[value] += 1

    activity = [
        {"date": day, "analyses": daily[day], "flagged": daily_malicious[day]}
        for day in daily
    ]
    distribution = [
        {
            "name": severity,
            "value": severity_counts[severity],
            "color": _SEVERITY_COLORS.get(severity, "#64748b"),
        }
        for severity in ("critical", "high", "medium", "low", "info")
        if severity_counts[severity]
    ]

    return {
        "metrics": {
            "total_analyses": total,
            "flagged_analyses": malicious_or_suspicious,
            "malicious_analyses": verdict_counts["malicious"],
            "average_risk_score": average_risk,
        },
        "verdict_counts": dict(verdict_counts),
        "severity_counts": dict(severity_counts),
        "activity": activity,
        "distribution": distribution,
        "top_indicators": [
            {"indicator": indicator, "count": count}
            for indicator, count in indicator_counts.most_common(8)
        ],
        "recent_analyses": [_summary(record) for record in records[:recent_limit]],
        "data_source": "persisted_local_analyses",
    }

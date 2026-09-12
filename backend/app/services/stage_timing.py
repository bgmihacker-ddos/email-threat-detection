"""Reusable, analysis-scoped timing records for forensic pipeline stages."""

from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from time import perf_counter
from typing import Any, Dict, Iterator, Optional


class StageTimer:
    """Measure one pipeline stage without hiding stage failures."""

    def __init__(self, analysis_id: str, stage: str, item_count: Optional[int] = None):
        self.analysis_id = analysis_id
        self.stage = stage
        self.item_count = item_count
        self.started_at = datetime.now(timezone.utc)
        self._started = perf_counter()
        self.status = "running"
        self.error: Optional[str] = None
        self.duration_ms: Optional[int] = None

    def complete(self, status: str = "completed", error: Optional[str] = None) -> Dict[str, Any]:
        """Finish the timer and return a JSON-safe timing record."""
        self.status = status
        self.error = error
        self.duration_ms = max(0, round((perf_counter() - self._started) * 1000))
        return self.as_dict()

    def as_dict(self) -> Dict[str, Any]:
        return {
            "analysis_id": self.analysis_id,
            "stage": self.stage,
            "status": self.status,
            "started_at": self.started_at.isoformat(),
            "duration_ms": self.duration_ms,
            "item_count": self.item_count,
            "error": self.error,
        }


@contextmanager
def timed_stage(
    analysis_id: str,
    stage: str,
    item_count: Optional[int] = None,
) -> Iterator[StageTimer]:
    """Yield a timer and finalize it as completed or failed on exit."""
    timer = StageTimer(analysis_id, stage, item_count)
    try:
        yield timer
    except Exception as exc:
        timer.complete("failed", type(exc).__name__)
        raise
    else:
        timer.complete()

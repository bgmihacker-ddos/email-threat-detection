from typing import Dict, Any

# In-memory store for tracking background analysis jobs
# Format: { analysis_id: { "status": "queued|processing|completed|failed", "stage": str, "progress_pct": int, "error": str | None } }
JOB_STORE: Dict[str, Dict[str, Any]] = {}

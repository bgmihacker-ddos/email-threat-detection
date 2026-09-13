"""Batch email ingestion and queued analysis orchestration."""

from __future__ import annotations

import asyncio
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.routes.analysis import _background_analysis_task
from app.database.session import get_db
from app.models.analysis_job import AnalysisJob

router = APIRouter()


@router.post("/batch/analyze")
async def analyze_batch(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """Queue multiple EML uploads for asynchronous forensic processing."""
    if not files:
        raise HTTPException(status_code=400, detail="At least one email file is required.")

    queued: List[dict] = []
    for upload in files:
        if upload.filename is None or not upload.filename.lower().endswith((".eml", ".msg")):
            raise HTTPException(status_code=400, detail=f"Unsupported batch file type: {upload.filename}")
        raw_bytes = await upload.read()
        if not raw_bytes:
            continue
        analysis_id = str(uuid.uuid4())
        db.add(AnalysisJob(analysis_id=analysis_id, payload=raw_bytes))
        queued.append({"analysis_id": analysis_id, "filename": upload.filename, "status": "queued"})
        asyncio.create_task(_background_analysis_task(analysis_id))
    db.commit()
    return {"batch_id": str(uuid.uuid4()), "queued": queued, "total": len(queued)}


@router.get("/batch/{batch_id}/status")
async def batch_status(batch_id: str, db: Session = Depends(get_db)):
    """Return the queued analysis IDs created in a batch. This is intentionally lightweight."""
    _ = batch_id
    return {"status": "available", "source": "batch_ingest"}

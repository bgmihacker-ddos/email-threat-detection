import io
import zipfile

import pytest

from app.api.routes.batch_analysis import _expand_upload, batch_status
from app.models.analysis import AnalysisResult
from app.models.analysis_batch import AnalysisBatch


@pytest.mark.asyncio
async def test_batch_status_reports_persisted_progress(db_session):
    batch = AnalysisBatch(id="batch-1", status="queued", total=3)
    db_session.add(batch)
    db_session.add_all([
        AnalysisResult(id="analysis-1", batch_id="batch-1", status="completed", progress_percent=100),
        AnalysisResult(id="analysis-2", batch_id="batch-1", status="failed", progress_percent=0),
        AnalysisResult(id="analysis-3", batch_id="batch-1", status="processing", progress_percent=60),
    ])
    db_session.commit()

    result = await batch_status("batch-1", db_session)

    assert result["status"] == "processing"
    assert result["total"] == 3
    assert result["completed"] == 1
    assert result["failed"] == 1
    assert result["queued"] == 1
    assert set(result["analysis_ids"]) == {"analysis-1", "analysis-2", "analysis-3"}


def test_batch_zip_expansion_keeps_only_email_members():
    archive_buffer = io.BytesIO()
    with zipfile.ZipFile(archive_buffer, "w") as archive:
        archive.writestr("nested/message.eml", "From: sender@example.com\n\nHello")
        archive.writestr("notes.txt", "ignore")

    expanded = _expand_upload("sample.zip", archive_buffer.getvalue())

    assert expanded == [("message.eml", b"From: sender@example.com\n\nHello")]

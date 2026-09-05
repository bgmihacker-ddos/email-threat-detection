import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.detection.rule_engine import RuleEngine
from app.models.analysis import AnalysisResult
from app.schemas.analysis import EmailAnalysisSchema
from app.services.email_parser import EmailParser

router = APIRouter()


@router.post("/analyze", response_model=EmailAnalysisSchema)
async def analyze_email(
    raw_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    if not raw_content and not file:
        raise HTTPException(status_code=400, detail="No email content provided.")

    if file:
        raw_email = await file.read()
    else:
        raw_email = raw_content.encode("utf-8")

    try:
        parsed_email = EmailParser.parse_raw(raw_email)
        analysis_result = RuleEngine.analyze(parsed_email)

        analysis_id = str(uuid.uuid4())
        analysis = EmailAnalysisSchema(
            analysis_id=analysis_id,
            verdict=analysis_result.get("verdict", "unknown"),
            risk_score=analysis_result.get("risk_score", 0),
            severity=analysis_result.get("severity", "info"),
            confidence=analysis_result.get("confidence", 0),
            summary=analysis_result.get("summary", "Email analysis completed."),
            reasons=analysis_result.get("reasons", []),
            evidence=analysis_result.get("evidence", []),
            detections=analysis_result.get("detections", []),
            authentication=analysis_result.get("authentication", {}),
            forensic_findings=analysis_result.get("forensic_findings", []),
            threat_reasoning=analysis_result.get("threat_reasoning", []),
            attack_chain=analysis_result.get("attack_chain", []),
            iocs=analysis_result.get("iocs", {"urls": [], "domains": [], "ips": [], "attachments": []}),
            threat_intelligence=analysis_result.get("threat_intelligence", []),
            recommendations=analysis_result.get("recommendations", []),
            email=parsed_email,
        )

        db_result = AnalysisResult(
            id=analysis_id,
            verdict=analysis.verdict,
            risk_score=analysis.risk_score,
            severity=analysis.severity,
            confidence=analysis.confidence,
            summary=analysis.summary,
            result=analysis.model_dump(),
        )
        db.add(db_result)
        db.commit()

        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analyze/{analysis_id}", response_model=EmailAnalysisSchema)
async def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    db_result = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if db_result is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return EmailAnalysisSchema(**db_result.result)

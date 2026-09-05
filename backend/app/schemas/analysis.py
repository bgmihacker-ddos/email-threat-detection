from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EmailAnalysisSchema(BaseModel):
    analysis_id: str
    verdict: str
    risk_score: int
    severity: str
    confidence: int
    summary: str
    reasons: List[str] = []
    evidence: List[str] = []
    detections: List[str] = []
    forensic_findings: List[Dict[str, Any]] = []
    threat_reasoning: List[str] = []
    attack_chain: List[str] = []
    email: Dict[str, Any]
    authentication: Dict[str, str] = {}
    iocs: Dict[str, List[str]] = {"urls": [], "domains": [], "ips": [], "attachments": []}
    threat_intelligence: List[Dict[str, Any]] = []
    recommendations: List[str] = []

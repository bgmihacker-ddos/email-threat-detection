from typing import List, Optional, Dict, Any
from app.schemas.indicator import ThreatIndicator

class ThreatFusionService:
    @staticmethod
    def fuse(indicators: List[ThreatIndicator]) -> Dict[str, Any]:
        if not indicators:
            return {
                "severity": "safe",
                "confidence": 0,
                "sources": [],
                "evidence": ["No intelligence available"],
                "reasoning": "Insufficient data available"
            }

        # Rule-based fusion
        severity_map = {"critical": 4, "high": 3, "medium": 2, "low": 1, "safe": 0}

        # Aggregate evidence and sources
        sources = list(set([i.source for i in indicators]))
        evidence = []
        for i in indicators:
            evidence.append(f"{i.source} reports {i.indicator_type} as {i.severity} (confidence: {i.confidence})")

        # Determine highest severity
        max_severity_val = max([severity_map.get(i.severity.lower(), 0) for i in indicators])

        # Base confidence on source agreement and provider confidence
        confidence = sum([i.confidence for i in indicators]) // len(indicators)
        if len(indicators) > 1:
            confidence = min(100, confidence + 10)

        reasoning = f"Fusion of {len(indicators)} independent sources: {', '.join(sources)}."

        # Map back to severity string
        inv_severity_map = {v: k for k, v in severity_map.items()}
        severity = inv_severity_map.get(max_severity_val, "safe")

        return {
            "severity": severity,
            "confidence": confidence,
            "sources": sources,
            "evidence": evidence,
            "reasoning": reasoning
        }

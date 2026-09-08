"""Phase 6J/Phase 2: Hybrid Risk Scoring & Threat Fusion Engine.

Deduplicated, correlated evidence aggregation via EvidenceCorrelator.
"""

from typing import Any, Dict, List
from app.detection.evidence_correlation import EvidenceCorrelator


class RiskEngine:
    @staticmethod
    def calculate_risk(
        header_forensics: Dict[str, Any],
        authentication: Dict[str, Any],
        iocs: Dict[str, Any],
        url_intel: List[Dict[str, Any]],
        domain_intel: Dict[str, Any],
        threat_intel: List[Dict[str, Any]],
        attachments: Dict[str, Any],
        content: Dict[str, Any],
        ml_res: Dict[str, Any],
        rule_res: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Aggregate evidence via EvidenceCorrelator for consistent scoring."""

        # 1. Correlate all findings
        correlation = EvidenceCorrelator.correlate(
            header_forensics=header_forensics,
            authentication=authentication,
            extracted_iocs=iocs,
            url_intelligence={"urls": url_intel},
            domain_intelligence=domain_intel,
            threat_intelligence={f"ti_{ti.get('provider', 'unknown')}": ti for ti in threat_intel},
            attachment_analysis=attachments,
            content_analysis=content,
            ml_prediction=ml_res,
            rule_detections=rule_res.get("rules", []) if isinstance(rule_res, dict) else [],
        )

        score_breakdown: List[Dict[str, Any]] = []
        total_score = 0

        # 2. Translate correlated records into score_breakdown format
        source_labels = {
            "ml_classifier": "ML Classifier",
            "authentication_analyzer": "Authentication",
            "header_forensics": "Header Forensics",
            "url_intelligence": "URL Analysis",
            "domain_intelligence": "Domain Analysis",
            "attachment_analyzer": "Attachment Analysis",
            "content_analyzer": "Content Analysis",
        }

        for rec in correlation.scoring_records:
            total_score += rec.base_points
            reason = rec.title
            if rec.source_family == "model":
                reason = f"Model classified as {rec.title.split('(')[0].strip().lower()}"
            score_breakdown.append({
                "source": source_labels.get(rec.source, rec.source),
                "reason": reason,
                "points": rec.base_points,
                "confidence": rec.confidence,
                "signal": rec.finding_id,
                "evidence_class": rec.evidence_class,
                "evidence_refs": rec.evidence_refs
            })

        # 3. Handle Mitigating records (negative impact)
        for rec in correlation.mitigating_records:
            total_score += rec.base_points
            score_breakdown.append({
                "source": source_labels.get(rec.source, rec.source),
                "reason": rec.title,
                "points": rec.base_points,
                "confidence": rec.confidence,
                "signal": rec.finding_id,
                "evidence_class": rec.evidence_class,
                "evidence_refs": rec.evidence_refs
            })

        # Clamp total score
        final_score = min(100, max(0, total_score))

        # Determine verdict & severity
        if final_score >= 50:
            verdict = "malicious"
            severity = "critical" if final_score >= 80 else "high"
        elif final_score >= 25:
            verdict = "suspicious"
            severity = "medium"
        else:
            verdict = "benign"
            severity = "low" if final_score > 0 else "info"

        return {
            "verdict": verdict,
            "risk_score": final_score,
            "severity": severity,
            "confidence": correlation.confidence,
            "score_breakdown": score_breakdown,
            "correlation_summary": correlation.summary_notes,
            "correlation_clusters": correlation.clusters,
            "evidence_count": len(correlation.evidence_records),
            "suppressed_count": len(correlation.suppressed_records),
        }

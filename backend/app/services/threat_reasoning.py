"""Phase 6K: Threat Reasoning Engine.

Produces traceable, deterministic explanations for the final threat verdict.
"""

from typing import Any, Dict, List


class ThreatReasoningEngine:
    @staticmethod
    def generate_reasoning(
        verdict: str,
        risk_score: int,
        score_breakdown: List[Dict[str, Any]],
        all_findings: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Synthesize decision path and explanations from evidence."""
        primary_reasons = []
        decision_path = []

        decision_path.append(f"Forensic ingestion completed with initial risk assessment.")

        for item in score_breakdown:
            src = item.get("source")
            reason = item.get("reason")
            pts = item.get("points")
            if pts >= 15:
                primary_reasons.append(f"[{src}] {reason}")
                decision_path.append(f"Elevated risk (+{pts} pts): {reason}")
            else:
                decision_path.append(f"Minor indicator (+{pts} pts): {reason}")

        decision_path.append(
            f"Calculated aggregate risk score {risk_score}/100. Final verdict set to {verdict.upper()}."
        )

        summary = (
            f"Email classified as {verdict.upper()} with a risk score of {risk_score}/100 based on "
            f"{len(primary_reasons)} key threat indicator(s)."
            if primary_reasons else
            "Email appears BENIGN. Basic security and formatting checks passed cleanly."
        )

        return {
            "summary": summary,
            "primary_reasons": primary_reasons,
            "supporting_evidence": [item.get("reason") for item in score_breakdown],
            "decision_path": decision_path,
        }

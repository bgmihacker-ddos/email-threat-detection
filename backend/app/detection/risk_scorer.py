"""Phase 6J: Hybrid Risk Scoring & Threat Fusion Engine."""

from typing import Any, Dict, List


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
        """Aggregate evidence transparently without double-counting."""

        score_breakdown: List[Dict[str, Any]] = []
        total_score = 0
        seen_dedup_keys = set()

        def _add_item(source: str, reason: str, points: int, dedup_key: str, confidence: int = 100):
            nonlocal total_score
            if dedup_key in seen_dedup_keys:
                return
            seen_dedup_keys.add(dedup_key)
            total_score += points
            score_breakdown.append({
                "source": source,
                "reason": reason,
                "points": points,
                "confidence": confidence,
            })

        # 1. Header Forensics Findings
        for f in header_forensics.get("forensic_findings", []):
            sev = f.get("severity", "info")
            pts = 20 if sev == "high" else (10 if sev == "medium" else 5)
            _add_item("Header Forensics", f.get("title", ""), pts, f"header_{f.get('finding_id')}", f.get("confidence", 90))

        # 2. Authentication
        for f in authentication.get("findings", []):
            sev = f.get("severity", "info")
            pts = 25 if sev == "high" else (15 if sev == "medium" else 5)
            _add_item("Authentication", f.get("title", ""), pts, f"auth_{f.get('finding_id')}", f.get("confidence", 95))

        # 3. URL Analysis
        for u in url_intel:
            for ind in u.get("indicators", []):
                pts = 15 if ind in ("credential_url", "punycode_domain") else 10
                _add_item("URL Analysis", f"URL Indicator: {ind}", pts, f"url_{ind}_{u.get('normalized')}")

        # 4. Attachments
        for f in attachments.get("findings", []):
            sev = f.get("severity", "info")
            pts = 30 if sev == "high" else 15
            _add_item("Attachments", f.get("title", ""), pts, f"att_{f.get('finding_id')}")

        # 5. Content Analysis
        for f in content.get("findings", []):
            sev = f.get("severity", "info")
            pts = 25 if sev == "high" else (15 if sev == "medium" else 10)
            _add_item("Content Analysis", f.get("title", ""), pts, f"content_{f.get('finding_id')}")

        # 6. ML Classifier
        if ml_res.get("status") == "available":
            lbl = ml_res.get("label")
            prob = ml_res.get("probability", 0.0)
            if lbl in ("phishing", "malicious") and prob > 0.7:
                _add_item("ML Classifier", f"Model classified as {lbl} (p={prob:.2f})", int(prob * 30), "ml_prediction", int(prob * 100))

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

        confidence = 85 + min(15, len(score_breakdown) * 2)

        return {
            "verdict": verdict,
            "risk_score": final_score,
            "severity": severity,
            "confidence": min(100, confidence),
            "score_breakdown": score_breakdown,
        }

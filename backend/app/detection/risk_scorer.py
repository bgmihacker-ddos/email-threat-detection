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
            if sev == "info":
                continue
            pts = 20 if sev == "high" else (10 if sev == "medium" else 5)
            _add_item("Header Forensics", f.get("title", ""), pts, f"header_{f.get('finding_id')}", f.get("confidence", 90))

        # 2. Authentication
        for f in authentication.get("findings", []):
            sev = f.get("severity", "info")
            if sev == "info":
                continue
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
            if sev == "info":
                continue
            pts = 30 if sev == "high" else 15
            _add_item("Attachments", f.get("title", ""), pts, f"att_{f.get('finding_id')}")

        # 5. Threat Intelligence
        for ti in threat_intel:
            # ti should be a ProviderResult
            if ti.get("status") == "ok" and ti.get("reputation") == "malicious":
                pts = int(ti.get("confidence", 0) * 0.4) # up to 40 points
                _add_item("Threat Intel", f"Provider {ti.get('provider')} indicates {ti.get('indicator')}", pts, f"ti_{ti.get('provider')}_{ti.get('indicator')}", ti.get("confidence", 50))

        # 6. Content Analysis
        for f in content.get("findings", []):
            sev = f.get("severity", "info")
            if sev == "info":
                continue
            pts = 25 if sev == "high" else (15 if sev == "medium" else 10)
            _add_item("Content Analysis", f.get("title", ""), pts, f"content_{f.get('finding_id')}")

        # 7. ML Classifier (bounded evidence signal; cannot make email malicious alone)
        if ml_res.get("status") == "available":
            lbl = ml_res.get("label")
            prob = ml_res.get("confidence", ml_res.get("probability", 0.0))
            if lbl in ("phishing", "bec", "malicious") and prob >= 0.55:
                pts = min(15, max(5, int(prob * 15)))
                top_terms = [
                    str(item.get("feature"))
                    for item in ml_res.get("top_contributing_features", [])[:3]
                    if item.get("feature")
                ]
                reason = f"Model classified as {lbl} (p={prob:.2f})"
                if top_terms:
                    reason += f" [key cues: {', '.join(top_terms)}]"
                _add_item("ML Classifier", reason, pts, "ml_prediction", int(prob * 100))
            elif lbl == "suspicious" and prob >= 0.65:
                pts = min(10, max(5, int(prob * 10)))
                _add_item("ML Classifier", f"Model flagged suspicious patterns (p={prob:.2f})", pts, "ml_prediction", int(prob * 100))

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

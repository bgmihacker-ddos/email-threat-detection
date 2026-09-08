"""Phase 6J: Hybrid Risk Scoring & Threat Fusion Engine.

Deduplicated, correlated evidence aggregation without double-counting.
"""

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

        # We cap contextual anomalies to prevent minor issues from inflating risk
        contextual_score_acc = 0
        CONTEXTUAL_CAP = 30

        def _add_item(
            source: str,
            reason: str,
            points: int,
            dedup_key: str,
            confidence: int = 100,
            evidence_class: str = "informational",
            signal: str = "",
            evidence_refs: List[str] = None
        ):
            nonlocal total_score, contextual_score_acc
            if dedup_key in seen_dedup_keys:
                return
            seen_dedup_keys.add(dedup_key)

            applied_points = points
            if evidence_class == "contextual_anomaly":
                if contextual_score_acc + points > CONTEXTUAL_CAP:
                    applied_points = max(0, CONTEXTUAL_CAP - contextual_score_acc)
                contextual_score_acc += points

            total_score += applied_points
            score_breakdown.append({
                "source": source,
                "reason": reason,
                "points": applied_points,
                "confidence": confidence,
                "signal": signal or dedup_key,
                "evidence_class": evidence_class,
                "evidence_refs": evidence_refs or []
            })

        # Pre-process TI
        ti_malicious_iocs = set()
        for ti in threat_intel:
            if ti.get("status") == "ok" and ti.get("reputation") == "malicious":
                ioc_val = ti.get("indicator")
                ti_malicious_iocs.add(ioc_val)
                pts = int(ti.get("confidence", 80) * 0.5)  # up to 50 pts
                _add_item(
                    "Threat Intel",
                    f"{ti.get('provider')} confirmed malicious IOC: {ioc_val}",
                    pts,
                    f"ti_mal_{ioc_val}",
                    int(ti.get("confidence", 80)),
                    "confirmed_malicious",
                    "ti_match",
                    [ioc_val]
                )

        def _infer_evidence_class(f: Dict[str, Any]) -> str:
            ec = f.get("evidence_class")
            if ec:
                return ec
            sev = f.get("severity", "info").lower()
            if sev in ("critical", "high"):
                return "strong_risk_signal"
            if sev in ("medium", "low"):
                return "contextual_anomaly"
            return "informational"

        def _process_findings(source: str, findings: List[Dict[str, Any]], prefix: str):
            for f in findings:
                finding_id = f.get("finding_id", "")
                sev = f.get("severity", "info").lower()
                ec = _infer_evidence_class(f)
                if ec == "informational" and sev == "info":
                    continue

                pts = 0
                if ec == "confirmed_malicious":
                    pts = 50
                elif ec == "strong_risk_signal":
                    pts = 30 if sev == "high" else 20
                elif ec == "contextual_anomaly":
                    pts = 10 if sev == "medium" else 5

                if pts > 0:
                    _add_item(
                        source=source,
                        reason=f.get("title") or f.get("description")[:100],
                        points=pts,
                        dedup_key=f"{prefix}_{finding_id}",
                        confidence=f.get("confidence", 90),
                        evidence_class=ec,
                        signal=finding_id,
                        evidence_refs=f.get("evidence", [])
                    )

        # 1. Header Forensics
        _process_findings("Header Forensics", header_forensics.get("forensic_findings", []), "header")

        # 2. Authentication
        # Avoid double-counting DMARC failure if SPF/DKIM also exist. DMARC fail is sufficient.
        auth_findings = authentication.get("findings", [])
        dmarc_fail = any("auth.dmarc.fail" in f.get("finding_id", "") for f in auth_findings)
        for f in auth_findings:
            fid = f.get("finding_id", "")
            ec = _infer_evidence_class(f)
            sev = f.get("severity", "info").lower()
            if dmarc_fail and fid in ["auth.spf.fail", "auth.dkim.fail"]:
                continue

            pts = 0
            if ec == "confirmed_malicious":
                pts = 50
            elif ec == "strong_risk_signal":
                pts = 30 if sev == "high" else 20
            elif ec == "contextual_anomaly":
                pts = 10 if sev == "medium" else 5

            if pts > 0:
                _add_item(
                    "Authentication",
                    f.get("title") or f.get("description")[:50],
                    pts,
                    f"auth_{fid}",
                    f.get("confidence", 90),
                    ec,
                    fid,
                    f.get("evidence", [])
                )

        # 3. Content Analysis
        _process_findings("Content Analysis", content.get("findings", []), "content")

        # 4. Attachment Analysis
        for f in attachments.get("findings", []):
            iocs_found = f.get("related_iocs", [])
            overlap = any(ioc in ti_malicious_iocs for ioc in iocs_found)
            if overlap:
                continue
            _process_findings("Attachment Analysis", [f], "att")

        # 5. URL Analysis
        for u in url_intel:
            # Check structured findings
            for f in u.get("findings", []):
                iocs_found = f.get("related_iocs", [])
                overlap = any(ioc in ti_malicious_iocs for ioc in iocs_found)
                if overlap:
                    continue
                _process_findings("URL Analysis", [f], "url")
            # If finding list empty but indicators exist
            if not u.get("findings") and u.get("indicators"):
                for ind in u.get("indicators", []):
                    pts = 15 if ind in ("credential_url", "punycode_domain", "brand_impersonation") else 10
                    ec = "strong_risk_signal" if pts >= 15 else "contextual_anomaly"
                    _add_item("URL Analysis", f"URL Indicator: {ind}", pts, f"url_{ind}_{u.get('normalized')}", 90, ec, ind, [u.get("normalized", "")])

        # 6. Domain Analysis
        for dom, d_data in domain_intel.items():
            for f in d_data.get("findings", []):
                iocs_found = f.get("related_iocs", [dom])
                overlap = any(ioc in ti_malicious_iocs for ioc in iocs_found)
                if overlap:
                    continue
                _process_findings("Domain Analysis", [f], "dom")

        # 7. ML Classifier (Bounded so it never decides alone)
        if ml_res.get("status") == "available":
            lbl = ml_res.get("label")
            prob = float(ml_res.get("confidence", ml_res.get("probability", 0.0)))
            if lbl in ("phishing", "bec", "malicious") and prob >= 0.55:
                pts = min(15, max(5, int(prob * 15)))
                top_terms = [str(item.get("feature")) for item in ml_res.get("top_contributing_features", [])[:3] if item.get("feature")]
                reason = f"Model classified as {lbl} (p={prob:.2f})"
                _add_item("ML Classifier", reason, pts, "ml_prediction", int(prob * 100), "contextual_anomaly", "ml_pattern", top_terms)
            elif lbl == "suspicious" and prob >= 0.65:
                pts = min(10, max(5, int(prob * 5)))
                _add_item("ML Classifier", "ML model flagged suspicious linguistic cues", pts, "ml_prediction", int(prob * 100), "contextual_anomaly", "ml_pattern", [])

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
            "confidence": min(100, max(0, confidence)),
            "score_breakdown": score_breakdown,
        }

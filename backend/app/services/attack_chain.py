"""Phase 6L: Attack Chain Reconstruction Engine."""

from typing import Any, Dict, List


class AttackChainReconstruction:
    @staticmethod
    def reconstruct(
        header_forensics: Dict[str, Any],
        authentication: Dict[str, Any],
        url_intel: List[Dict[str, Any]],
        attachments: Dict[str, Any],
        content: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Reconstruct observable threat execution stages."""
        chain = []

        # Stage 1: Initial Delivery
        mail_flow = header_forensics.get("mail_flow", {})
        hops = mail_flow.get("hop_count", 0)
        chain.append({
            "stage": "initial_delivery",
            "title": "1. Email Delivery & Ingestion",
            "status": "observed",
            "evidence": [f"Processed {hops} Received hop(s). Origin IP: {mail_flow.get('origin_ip', 'unknown')}"],
        })

        # Stage 2: Sender Impersonation / Domain Mismatch
        domain_rel = header_forensics.get("domain_relationships", {}).get("relationships", {})
        if domain_rel.get("from_to_reply_to") == "different_domain":
            chain.append({
                "stage": "sender_impersonation",
                "title": "2. Sender Identity Divergence",
                "status": "observed",
                "evidence": ["Reply-To domain differs from From domain"],
            })

        # Stage 3: Authentication Anomaly
        auth_findings = authentication.get("findings", [])
        if auth_findings:
            chain.append({
                "stage": "authentication_anomaly",
                "title": "3. Security Policy / Auth Anomaly",
                "status": "observed",
                "evidence": [f["title"] for f in auth_findings],
            })

        # Stage 4: Social Engineering / Phishing Content
        urgency = content.get("urgency_keywords", [])
        if urgency:
            chain.append({
                "stage": "social_engineering",
                "title": "4. Social Engineering / Urgency Tactic",
                "status": "observed",
                "evidence": [f"Urgency keywords detected: {', '.join(urgency)}"],
            })

        # Stage 5: Malicious / Suspicious URL
        suspicious_urls = [u for u in url_intel if u.get("risk_indicators", 0) > 0]
        if suspicious_urls:
            chain.append({
                "stage": "suspicious_url",
                "title": "5. Malicious Infrastructure Link",
                "status": "observed",
                "evidence": [f"URL {u['normalized']} has indicators: {', '.join(u['indicators'])}" for u in suspicious_urls],
            })

        # Stage 6: Credential Harvesting
        if content.get("credential_keywords") or "embedded_form" in content.get("html_indicators", []):
            chain.append({
                "stage": "credential_harvesting",
                "title": "6. Credential Harvesting",
                "status": "observed",
                "evidence": ["Credential-harvesting keywords or embedded HTML form detected"],
            })

        # Stage 7: Malware Attachment
        att_findings = attachments.get("findings", [])
        if att_findings:
            chain.append({
                "stage": "malware_attachment",
                "title": "7. Dangerous Attachment Delivery",
                "status": "observed",
                "evidence": [f["title"] for f in att_findings],
            })

        return chain

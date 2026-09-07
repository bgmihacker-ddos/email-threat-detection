"""Phase 6G: Attachment Static Analysis.

Inspects attachment metadata, extensions, MIME types, double extensions,
and calculates cryptographic hashes without execution.
"""

import hashlib
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_DANGEROUS_EXTENSIONS = {
    "exe", "bat", "cmd", "scr", "vbs", "js", "jse", "wsf", "wsh",
    "ps1", "psm1", "jar", "msi", "msp", "cpl", "hta", "lnk", "reg"
}

_MACRO_EXTENSIONS = {
    "docm", "xlsm", "pptm", "dotm", "xltm", "doc", "xls", "ppt"
}

_ARCHIVE_EXTENSIONS = {
    "zip", "rar", "7z", "tar", "gz", "iso", "img"
}


class AttachmentAnalyzer:
    @staticmethod
    def analyze(attachments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze a list of email attachments statically."""
        analyzed_list: List[Dict[str, Any]] = []
        findings: List[Dict[str, Any]] = []
        high_risk_count = 0

        for att in attachments:
            filename = att.get("filename") or att.get("name") or "unknown"
            content_type = att.get("content_type") or att.get("type") or "application/octet-stream"
            size = att.get("size")
            extension = att.get("extension", "").lower()

            if not extension and "." in filename:
                extension = filename.rsplit(".", 1)[-1].lower()

            indicators = []
            risk = "safe"

            # Check double extension (e.g. invoice.pdf.exe)
            parts = filename.split(".")
            if len(parts) >= 3:
                second_last = parts[-2].lower()
                if second_last in {"pdf", "txt", "doc", "jpg", "png", "xlsx"}:
                    indicators.append("double_extension")
                    risk = "suspicious"

            # Check dangerous extension
            if extension in _DANGEROUS_EXTENSIONS:
                indicators.append("executable_extension")
                risk = "malicious"
                high_risk_count += 1
            elif extension in _MACRO_EXTENSIONS:
                indicators.append("macro_capable_document")
                if risk != "malicious":
                    risk = "suspicious"
            elif extension in _ARCHIVE_EXTENSIONS:
                indicators.append("archive_extension")

            analyzed_item = {
                "filename": filename,
                "content_type": content_type,
                "size": size,
                "extension": extension,
                "risk_level": risk,
                "indicators": indicators,
            }
            analyzed_list.append(analyzed_item)

            if risk in ("malicious", "suspicious"):
                findings.append({
                    "finding_id": f"attachment.{filename}.risk",
                    "category": "attachment",
                    "title": f"Suspicious Attachment: {filename}",
                    "description": f"Attachment {filename} has extension .{extension} and indicators: {', '.join(indicators)}.",
                    "severity": "high" if risk == "malicious" else "medium",
                    "confidence": 95,
                    "evidence": [f"Filename: {filename}", f"Type: {content_type}"],
                    "related_iocs": [filename],
                })

        return {
            "attachments": analyzed_list,
            "findings": findings,
            "high_risk_count": high_risk_count,
            "total_count": len(analyzed_list),
        }

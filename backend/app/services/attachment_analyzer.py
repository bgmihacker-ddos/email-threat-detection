"""Phase 6G: Attachment Static Analysis.

Inspects attachment metadata, extensions, MIME types, double extensions,
RTL character obfuscation, archive structures, and calculates cryptographic hashes
without execution.
"""

import hashlib
import io
import logging
import zipfile
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_DANGEROUS_EXTENSIONS = {
    "exe", "bat", "cmd", "scr", "vbs", "js", "jse", "wsf", "wsh",
    "ps1", "psm1", "jar", "msi", "msp", "cpl", "hta", "lnk", "reg",
    "iso", "img", "vhd"
}

_MACRO_EXTENSIONS = {
    "docm", "xlsm", "pptm", "dotm", "xltm"
}

_LEGACY_OFFICE_EXTENSIONS = {
    "doc", "xls", "ppt"
}

_ARCHIVE_EXTENSIONS = {
    "zip", "rar", "7z", "tar", "gz", "bz2"
}

_BIDI_CHARS = {"‮", "‭", "‬", "‎", "‏"}


class AttachmentAnalyzer:
    @staticmethod
    def analyze(attachments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze a list of email attachments statically and safely."""
        analyzed_list: List[Dict[str, Any]] = []
        findings: List[Dict[str, Any]] = []
        high_risk_count = 0

        for att in attachments:
            filename = str(att.get("filename") or att.get("name") or "unknown")
            content_type = str(att.get("content_type") or att.get("type") or "application/octet-stream")
            size = att.get("size")
            extension = str(att.get("extension") or "").lower()

            if not extension and "." in filename:
                extension = filename.rsplit(".", 1)[-1].lower()

            # Hash calculation if raw bytes available and hashes missing
            sha256 = att.get("sha256")
            md5 = att.get("md5")
            raw_bytes = att.get("raw_bytes")
            if raw_bytes and isinstance(raw_bytes, (bytes, bytearray)):
                if not sha256:
                    sha256 = hashlib.sha256(raw_bytes).hexdigest()
                if not md5:
                    md5 = hashlib.md5(raw_bytes).hexdigest()

            magic_bytes = str(att.get("magic_bytes") or "")

            indicators: List[str] = []
            risk = "safe"

            # 1. RTL / Bidirectional Override Spoofing
            has_bidi = any(c in filename for c in _BIDI_CHARS)
            if has_bidi:
                indicators.append("rtl_override_spoofing")
                risk = "malicious"

            # 2. Multi-extension obfuscation (e.g. invoice.pdf.exe)
            clean_filename = filename
            for bc in _BIDI_CHARS:
                clean_filename = clean_filename.replace(bc, "")

            parts = clean_filename.split(".")
            if len(parts) >= 3:
                second_last = parts[-2].lower()
                last_ext = parts[-1].lower()
                if second_last in {"pdf", "txt", "doc", "docx", "jpg", "png", "xlsx"} and last_ext in _DANGEROUS_EXTENSIONS:
                    indicators.append("double_extension")
                    risk = "malicious"

            # 3. Magic bytes vs Extension mismatch
            is_executable_magic = magic_bytes.lower().startswith("4d5a")  # MZ header
            if is_executable_magic and extension not in _DANGEROUS_EXTENSIONS:
                indicators.append("executable_magic_mismatch")
                risk = "malicious"

            # 4. Dangerous Executable or Script Extension
            if extension in _DANGEROUS_EXTENSIONS or is_executable_magic:
                if "executable_extension" not in indicators:
                    indicators.append("executable_extension")
                risk = "malicious"
            elif extension in _MACRO_EXTENSIONS:
                indicators.append("macro_capable_document")
                if risk == "safe":
                    risk = "suspicious"
            elif extension in _ARCHIVE_EXTENSIONS:
                indicators.append("archive_extension")
                # Inspect archive metadata if raw_bytes available safely
                if raw_bytes and extension == "zip":
                    try:
                        with zipfile.ZipFile(io.BytesIO(raw_bytes)) as zf:
                            nested_execs = [
                                n for n in zf.namelist()
                                if any(n.lower().endswith(f".{de}") for de in _DANGEROUS_EXTENSIONS)
                            ]
                            if nested_execs:
                                indicators.append("executable_in_archive")
                                risk = "malicious"
                    except Exception:
                        pass

            if risk == "malicious":
                high_risk_count += 1

            analyzed_item = {
                "filename": filename,
                "content_type": content_type,
                "size": size,
                "sha256": sha256,
                "md5": md5,
                "extension": extension,
                "risk_level": risk,
                "indicators": indicators,
            }
            analyzed_list.append(analyzed_item)

            if risk in ("malicious", "suspicious"):
                evidence = [f"Filename: {filename}", f"Type: {content_type}"]
                if sha256:
                    evidence.append(f"SHA256: {sha256}")
                if magic_bytes:
                    evidence.append(f"Magic: {magic_bytes}")
                if indicators:
                    evidence.append(f"Indicators: {', '.join(indicators)}")

                findings.append({
                    "finding_id": f"attachment.{filename}.risk",
                    "category": "attachment",
                    "title": f"Dangerous Attachment: {filename}" if risk == "malicious" else f"Suspicious Attachment: {filename}",
                    "description": f"Attachment '{filename}' (type: {content_type}, extension: .{extension}) exhibited security indicators: {', '.join(indicators)}.",
                    "severity": "high" if risk == "malicious" else "medium",
                    "confidence": 95,
                    "evidence": evidence,
                    "related_iocs": [filename] + ([sha256] if sha256 else []),
                    "evidence_class": "strong_risk_signal",
                    "risk_relevance": "risk_contributing",
                })

        return {
            "attachments": analyzed_list,
            "findings": findings,
            "high_risk_count": high_risk_count,
            "total_count": len(analyzed_list),
        }

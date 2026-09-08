"""Phase 6G & Phase 9: Safe Attachment Static & Forensic Analysis.

Inspects attachment metadata, extensions, MIME types, double extensions,
RTL character obfuscation, archive structures, PDF structures, OOXML/Office structures,
and calculates cryptographic hashes without execution.
"""

import hashlib
import io
import logging
import zipfile
import re
from typing import Any, Dict, List, Optional
from .ocr_service import OCRIntelligenceService

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

# PDF Static Suspicious Tokens
_PDF_SUSPICIOUS_TOKENS = [
    (re.compile(rb"/JavaScript|/JS\b", re.IGNORECASE), "pdf_embedded_javascript"),
    (re.compile(rb"/OpenAction\b", re.IGNORECASE), "pdf_open_action"),
    (re.compile(rb"/Launch\b", re.IGNORECASE), "pdf_launch_action"),
    (re.compile(rb"/EmbeddedFiles\b", re.IGNORECASE), "pdf_embedded_files"),
    (re.compile(rb"/URI\s*\([^)]+\)", re.IGNORECASE), "pdf_external_uri"),
]


class AttachmentAnalyzer:
    @staticmethod
    def _inspect_pdf_bytes(raw_bytes: bytes) -> List[str]:
        """Perform static token inspection on PDF byte streams."""
        pdf_indicators: List[str] = []
        for pattern, tag in _PDF_SUSPICIOUS_TOKENS:
            if pattern.search(raw_bytes):
                pdf_indicators.append(tag)
        return pdf_indicators

    @staticmethod
    def _inspect_ooxml_bytes(raw_bytes: bytes) -> List[str]:
        """Inspect OOXML (docx, xlsx, pptx, etc.) packages statically via zipfile."""
        ooxml_indicators: List[str] = []
        try:
            with zipfile.ZipFile(io.BytesIO(raw_bytes)) as zf:
                namelist = zf.namelist()
                for name in namelist:
                    lower_name = name.lower()
                    if "vbaproject.bin" in lower_name:
                        ooxml_indicators.append("ooxml_embedded_vba_macro")
                    if "_rels" in lower_name and lower_name.endswith(".rels"):
                        try:
                            rel_data = zf.read(name).decode("utf-8", errors="ignore")
                            if "TargetMode=\"External\"" in rel_data or "targetmode=\"external\"" in rel_data:
                                if "http" in rel_data:
                                    ooxml_indicators.append("ooxml_external_template_or_link")
                        except Exception:
                            pass
        except Exception:
            pass
        return list(dict.fromkeys(ooxml_indicators))

    @staticmethod
    def _inspect_archive_bytes(raw_bytes: bytes) -> List[str]:
        """Inspect archive safely bounded for decompression bombs and dangerous payloads."""
        archive_indicators: List[str] = []
        try:
            with zipfile.ZipFile(io.BytesIO(raw_bytes)) as zf:
                infolist = zf.infolist()
                total_uncompressed = sum(info.file_size for info in infolist)
                compressed_size = len(raw_bytes) or 1

                # Check for zip bomb ratio
                if compressed_size > 0 and (total_uncompressed / compressed_size) > 100 and total_uncompressed > 10_000_000:
                    archive_indicators.append("zip_bomb_ratio_detected")

                nested_execs = [
                    info.filename for info in infolist
                    if any(info.filename.lower().endswith(f".{de}") for de in _DANGEROUS_EXTENSIONS)
                ]
                if nested_execs:
                    archive_indicators.append("executable_in_archive")

                # Double extension inside archive
                for info in infolist:
                    parts = info.filename.split(".")
                    if len(parts) >= 3 and parts[-1].lower() in _DANGEROUS_EXTENSIONS:
                        archive_indicators.append("double_extension_in_archive")
                        break
        except Exception:
            pass
        return list(dict.fromkeys(archive_indicators))

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
                if raw_bytes and extension == "zip":
                    arch_inds = AttachmentAnalyzer._inspect_archive_bytes(raw_bytes)
                    indicators.extend(arch_inds)
                    if any(i in arch_inds for i in ("executable_in_archive", "zip_bomb_ratio_detected")):
                        risk = "malicious"

            # 5. Deep Format Inspection (PDF, OOXML)
            if raw_bytes and isinstance(raw_bytes, (bytes, bytearray)):
                if extension == "pdf" or content_type == "application/pdf":
                    pdf_inds = AttachmentAnalyzer._inspect_pdf_bytes(raw_bytes)
                    indicators.extend(pdf_inds)
                    if "pdf_embedded_javascript" in pdf_inds or "pdf_launch_action" in pdf_inds:
                        risk = "malicious"
                    elif pdf_inds and risk == "safe":
                        risk = "suspicious"
                elif extension in ("docx", "xlsx", "pptx", "docm", "xlsm", "pptm"):
                    ooxml_inds = AttachmentAnalyzer._inspect_ooxml_bytes(raw_bytes)
                    indicators.extend(ooxml_inds)
                    if "ooxml_embedded_vba_macro" in ooxml_inds or "ooxml_external_template_or_link" in ooxml_inds:
                        if risk == "safe":
                            risk = "suspicious"

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
                "indicators": list(dict.fromkeys(indicators)),
            }

            # --- START OCR INTEGRATION (Phase 14 & 15) ---
            if content_type.startswith("image/") and raw_bytes and isinstance(raw_bytes, (bytes, bytearray)):
                try:
                    from .ocr_service import OCRIntelligenceService
                    ocr_result = OCRIntelligenceService.analyze_image(raw_bytes, filename)
                    analyzed_item["ocr_status"] = ocr_result.get("status")
                    if ocr_result.get("has_qr_codes"):
                        analyzed_item["qr_codes"] = ocr_result.get("qr_codes")
                        if "qr_code_detected" not in indicators:
                            indicators.append("qr_code_detected")
                            analyzed_item["indicators"] = list(dict.fromkeys(indicators))
                            # Depending on the threat model, we could flag QR codes as suspicious
                            # Here we just mark it as an indicator, but if it has URLs it might be Quishing
                    if ocr_result.get("extracted_text"):
                        analyzed_item["extracted_text"] = ocr_result.get("extracted_text")
                except Exception as e:
                    logger.debug(f"OCR integration skipped or failed: {e}")
            # --- END OCR INTEGRATION ---

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

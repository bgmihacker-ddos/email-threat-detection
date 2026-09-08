import pytest
from app.services.attachment_analyzer import AttachmentAnalyzer

def test_attachment_archive_no_bomb():
    """Archive that shouldn't trigger bomb detected."""
    # A tiny valid zip file
    import base64
    # "hello.txt" containing "world"
    zip_bytes = base64.b64decode("UEsDBBQAAAAIAHR4e1dFz60HBwAAAAUAAAAJAAAAaGVsbG8udHh0K8vPKS0BAFBLAQI/ABQAAAAIAHR4e1dFz60HBwAAAAUAAAAJACQAAAAAAAAAIAAAAAAAAABoZWxsby50eHQKACAAAAAAAAEAGAB3R7Hk2rTZAQAAAAAAAAAARzGz5Nq02QEAAAAAAAAAAAAAAAAAAAAAWVBLBQYAAAAAAQABAFwAAAA7AAAAAAA=")
    
    attachments = [{
        "filename": "test.zip",
        "content_type": "application/zip",
        "size": len(zip_bytes),
        "raw_bytes": zip_bytes,
        "extension": "zip"
    }]
    
    result = AttachmentAnalyzer.analyze(attachments)
    assert result["high_risk_count"] == 0
    indicators = result["attachments"][0]["indicators"]
    assert "archive_extension" in indicators
    assert "zip_bomb_ratio_detected" not in indicators

def test_attachment_pdf_javascript():
    """PDF with javascript token triggers suspicious/malicious."""
    pdf_bytes = b"%PDF-1.4\n1 0 obj << /Type /Action /S /JavaScript /JS (app.alert('XSS');) >> endobj"
    
    attachments = [{
        "filename": "invoice.pdf",
        "content_type": "application/pdf",
        "size": len(pdf_bytes),
        "raw_bytes": pdf_bytes,
        "extension": "pdf"
    }]
    
    result = AttachmentAnalyzer.analyze(attachments)
    
    assert "pdf_embedded_javascript" in result["attachments"][0]["indicators"]
    assert result["attachments"][0]["risk_level"] == "malicious"

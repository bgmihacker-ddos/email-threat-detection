from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_email():
    response = client.post(
        "/api/analyze",
        data={"raw_content": "From: test@example.com\nSubject: Urgent\n\nUrgent action required."},
    )
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert data["verdict"] in ["malicious", "suspicious"]
    assert data["risk_score"] >= 35
    assert "Urgency/Social Engineering" in data["detections"]
    assert "test@example.com" in data["email"]["from"]
    assert "header_forensics" in data
    assert "mail_flow" in data["header_forensics"]
    assert "domain_relationships" in data["header_forensics"]
    assert "ip_classifications" in data["header_forensics"]
    assert "authentication_evidence" in data["header_forensics"]
    assert "forensic_findings" in data["header_forensics"]


def test_persisted_analysis_includes_header_forensics():
    response = client.post(
        "/api/analyze",
        data={
            "raw_content": (
                "Received: from relay.example.net (relay.example.net [8.8.8.8]) "
                "by inbox.example.com; Mon, 07 Sep 2026 12:00:00 +0000\n"
                "Authentication-Results: inbox.example.com; spf=pass smtp.mailfrom=example.com\n"
                "From: sender@example.com\n"
                "To: recipient@example.com\n"
                "Date: Mon, 07 Sep 2026 12:00:00 +0000\n"
                "Message-ID: <api@example.com>\n\nHello"
            )
        },
    )
    assert response.status_code == 200
    created = response.json()

    fetched = client.get(f"/api/analyze/{created['analysis_id']}")
    assert fetched.status_code == 200
    persisted = fetched.json()
    assert persisted["header_forensics"] == created["header_forensics"]
    assert persisted["header_forensics"]["mail_flow"]["hop_count"] == 1
    assert persisted["header_forensics"]["authentication_evidence"]["spf"]["status"] == "pass"


def test_persisted_analysis_explorer_dashboard_and_redacted_exports():
    created = client.post(
        "/api/analyze",
        data={
            "raw_content": (
                "From: sender@example.com\n"
                "To: recipient@example.com\n"
                "Subject: Export test\n\n"
                "Urgent: visit https://example.test/login"
            )
        },
    )
    assert created.status_code == 200
    analysis_id = created.json()["analysis_id"]

    listing = client.get("/api/analyses?verdict=malicious")
    assert listing.status_code == 200
    assert any(item["analysis_id"] == analysis_id for item in listing.json()["data"])
    assert "raw_email" not in listing.text

    iocs = client.get("/api/analyses/iocs/search?value=example.test")
    assert iocs.status_code == 200
    assert any(item["analysis_id"] == analysis_id for item in iocs.json()["data"])

    dashboard = client.get("/api/dashboard/summary")
    assert dashboard.status_code == 200
    assert dashboard.json()["metrics"]["total_analyses"] >= 1
    assert dashboard.json()["data_source"] == "persisted_local_analyses"

    json_report = client.get(f"/api/analyze/{analysis_id}/report.json")
    assert json_report.status_code == 200
    assert json_report.json()["email"]["raw_email"] == "[redacted from export]"
    assert "Urgent: visit" not in json_report.text

    html_report = client.get(f"/api/analyze/{analysis_id}/report.html")
    assert html_report.status_code == 200
    assert "Forensic Analysis Report" in html_report.text
    assert "[redacted from export]" in html_report.text


def test_async_analysis_and_status_polling():
    response = client.post(
        "/api/analyze",
        data={
            "raw_content": "From: sender@example.com\nTo: recipient@example.com\nSubject: Test\n\nAsync test",
            "async_mode": "true",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert data["status"] in ["queued", "processing", "completed"]

    status_resp = client.get(f"/api/analyze/{data['analysis_id']}/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "status" in status_data
    assert "stage" in status_data
    assert "progress_pct" in status_data


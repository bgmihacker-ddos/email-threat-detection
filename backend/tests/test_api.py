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
    assert data["risk_score"] >= 40
    assert "Urgency/Social Engineering" in data["detections"]
    assert "test@example.com" in data["email"]["from"]

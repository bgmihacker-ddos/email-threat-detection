from app.services.evidence_ledger import build_evidence_ledger, verify_evidence_ledger


def test_evidence_ledger_detects_tampering():
    ledger = build_evidence_ledger(b"raw email", {"assessment": {"verdict": "suspicious"}})

    assert verify_evidence_ledger(ledger)["valid"] is True

    ledger["entries"][2]["evidence_hash"] = "tampered"
    verification = verify_evidence_ledger(ledger)

    assert verification["valid"] is False
    assert "tampered entry" in verification["reason"]

"""Tamper-evident hashing for forensic analysis evidence."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Mapping


def _canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=str,
    ).encode("utf-8")


def _digest(value: Any) -> str:
    return hashlib.sha256(_canonical_json(value)).hexdigest()


def build_evidence_ledger(
    raw_email: bytes,
    evidence: Mapping[str, Any],
) -> dict[str, Any]:
    """Create a deterministic hash chain for the major investigation stages."""
    stages = [
        ("raw_email", hashlib.sha256(raw_email).hexdigest()),
        ("parsed_email", evidence.get("parsed_email", {})),
        ("header_forensics", evidence.get("header_forensics", {})),
        ("intelligence", evidence.get("intelligence", {})),
        ("assessment", evidence.get("assessment", {})),
    ]

    entries: list[dict[str, Any]] = []
    previous_hash = "0" * 64
    for stage, value in stages:
        evidence_hash = value if stage == "raw_email" else _digest(value)
        chain_hash = _digest(
            {"stage": stage, "evidence_hash": evidence_hash, "previous_hash": previous_hash}
        )
        entries.append(
            {
                "sequence": len(entries),
                "stage": stage,
                "evidence_hash": evidence_hash,
                "previous_hash": previous_hash,
                "chain_hash": chain_hash,
            }
        )
        previous_hash = chain_hash

    return {
        "algorithm": "SHA-256",
        "chain_version": "1",
        "root_hash": entries[0]["chain_hash"],
        "final_hash": previous_hash,
        "entries": entries,
    }


def verify_evidence_ledger(ledger: Mapping[str, Any]) -> dict[str, Any]:
    """Verify chain links without requiring access to the original email."""
    entries = ledger.get("entries")
    if not isinstance(entries, list) or not entries:
        return {"valid": False, "reason": "ledger has no entries"}

    previous_hash = "0" * 64
    for index, entry in enumerate(entries):
        if not isinstance(entry, Mapping):
            return {"valid": False, "reason": f"invalid entry at sequence {index}"}
        if entry.get("sequence") != index or entry.get("previous_hash") != previous_hash:
            return {"valid": False, "reason": f"broken link at sequence {index}"}
        expected = _digest(
            {
                "stage": entry.get("stage"),
                "evidence_hash": entry.get("evidence_hash"),
                "previous_hash": previous_hash,
            }
        )
        if entry.get("chain_hash") != expected:
            return {"valid": False, "reason": f"tampered entry at sequence {index}"}
        previous_hash = expected

    valid = ledger.get("final_hash") == previous_hash and ledger.get("root_hash") == entries[0].get("chain_hash")
    return {"valid": valid, "final_hash": previous_hash}

"""Optional DistilBERT inference wrapper for email threat classification.

The project keeps the existing TF-IDF pipeline as the default path, but this
module provides a Drop-in transformer path when the required runtime artifacts
are available. Missing dependencies degrade gracefully so the forensic pipeline
continues without breaking the product.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Mapping, Optional


_MODEL_ROOT = Path(__file__).resolve().parents[3] / "ml" / "models" / "distilbert_email_classifier"


def _unavailable(error: str = "missing_runtime") -> Dict[str, Any]:
    return {
        "status": "unavailable",
        "label": "unknown",
        "confidence": 0.0,
        "probability": 0.0,
        "probabilities": {},
        "model_version": "distilbert-email-classifier-v1",
        "features_used": [],
        "feature_families": ["transformer_classifier"],
        "top_contributing_features": [],
        "error": error,
    }


class BertEmailClassifier:
    """Load a DistilBERT model from the repository when dependencies are present."""

    def __init__(self, model_path: Optional[str | Path] = None):
        self.model_path = Path(model_path) if model_path else _MODEL_ROOT
        self._pipeline = None
        self._load_error: Optional[str] = None
        self._load_model()

    def _load_model(self) -> None:
        try:
            from transformers import pipeline  # type: ignore
        except Exception as exc:  # pragma: no cover - runtime optional dependency
            self._load_error = f"transformers_unavailable:{type(exc).__name__}"
            return

        if not self.model_path.exists():
            self._load_error = "model_artifact_missing"
            return

        try:
            self._pipeline = pipeline(
                "text-classification",
                model=str(self.model_path),
                tokenizer=str(self.model_path),
                device=-1,
                top_k=None,
            )
        except Exception as exc:  # pragma: no cover - loading failure is non-blocking
            self._load_error = f"load_error:{type(exc).__name__}"
            self._pipeline = None

    def predict(self, text: str) -> Dict[str, Any]:
        if self._pipeline is None:
            return _unavailable(self._load_error or "missing_runtime")
        try:
            result = self._pipeline(str(text or "")[:512])
            payload = result[0] if isinstance(result, list) else result
            if isinstance(payload, list):
                payload = payload[0]
            label = str(payload.get("label", "unknown"))
            score = float(payload.get("score", 0.0))
            return {
                "status": "available",
                "label": label,
                "confidence": score,
                "probability": score,
                "probabilities": {label: score},
                "model_version": "distilbert-email-classifier-v1",
                "features_used": ["distilbert_embedding"],
                "feature_families": ["transformer_classifier"],
                "top_contributing_features": [{"feature": "distilbert_context_window", "description": "Transformer attention over message text", "contribution": score}],
                "error": None,
            }
        except Exception as exc:  # pragma: no cover
            return _unavailable(f"inference_error:{type(exc).__name__}")

    def predict_email(self, email: Mapping[str, Any] | None) -> Dict[str, Any]:
        if not isinstance(email, Mapping):
            return _unavailable(self._load_error or "bad_payload")
        subject = str(email.get("subject") or "")
        body = str(email.get("plain_text") or email.get("html_body") or email.get("body") or "")
        text = " ".join(part for part in (subject, body) if part).strip()
        return self.predict(text)


_default_classifier: Optional[BertEmailClassifier] = None


def get_bert_classifier() -> BertEmailClassifier:
    global _default_classifier
    if _default_classifier is None:
        _default_classifier = BertEmailClassifier()
    return _default_classifier

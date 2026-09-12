"""Production ML inference for parsed emails.

Inference is deliberately optional: a missing or invalid artifact returns a
structured unavailable result and never prevents forensic scanning.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Mapping, Optional

import joblib
import numpy as np
from scipy.sparse import hstack

from app.detection.ml_features import email_to_features, text_to_features


_REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
_PUBLIC_MODEL_PATH = _REPOSITORY_ROOT / "ml" / "models" / "email_threat_tfidf_logreg_public.joblib"
_CONTROLLED_MODEL_PATH = _REPOSITORY_ROOT / "ml" / "models" / "email_threat_tfidf_logreg.joblib"
DEFAULT_MODEL_PATH = _PUBLIC_MODEL_PATH if _PUBLIC_MODEL_PATH.exists() else _CONTROLLED_MODEL_PATH
_MODEL_VERSION_FALLBACK = "tfidf-logreg-controlled-v1"


def _unavailable(model_version: str = _MODEL_VERSION_FALLBACK) -> Dict[str, Any]:
    return {
        "status": "unavailable",
        "label": "unknown",
        "confidence": 0.0,
        "probability": 0.0,
        "probabilities": {},
        "model_version": model_version,
        "features_used": [],
        "feature_families": [],
        "top_contributing_features": [],
    }


class MLClassifier:
    """Load and run a pre-trained TF-IDF/logistic-regression artifact."""

    def __init__(self, model_path: Optional[str | os.PathLike[str]] = None):
        configured = model_path or os.getenv("EMAIL_THREAT_ML_MODEL_PATH")
        self.model_path = Path(configured) if configured else DEFAULT_MODEL_PATH
        self.model: Optional[Mapping[str, Any]] = None
        self.load_error: Optional[str] = None
        self._load_model()

    def _load_model(self) -> None:
        if not self.model_path.exists():
            self.load_error = "artifact_missing"
            return
        try:
            loaded = joblib.load(self.model_path)
            if not isinstance(loaded, Mapping):
                raise ValueError("model artifact must be a mapping")
            required = {"text_vectorizer", "structural_scaler", "classifier", "structural_names"}
            if not required.issubset(loaded):
                raise ValueError("model artifact is missing required components")
            self.model = loaded
        except Exception as exc:  # artifact failures must not break scanning
            self.model = None
            self.load_error = type(exc).__name__

    def predict(self, text: str) -> Dict[str, Any]:
        """Backward-compatible text prediction without inferred structure."""
        return self._predict_features(text_to_features(text))

    def predict_email(self, email: Mapping[str, Any] | None) -> Dict[str, Any]:
        """Predict from parser output while retaining structural message signals."""
        return self._predict_features(email_to_features(email))

    def _predict_features(self, features: Mapping[str, Any]) -> Dict[str, Any]:
        if self.model is None or not str(features.get("text", "")).strip():
            return _unavailable(str(self.model.get("model_version", _MODEL_VERSION_FALLBACK)) if self.model else _MODEL_VERSION_FALLBACK)

        try:
            vectorizer = self.model["text_vectorizer"]
            scaler = self.model["structural_scaler"]
            classifier = self.model["classifier"]
            structural_names = list(self.model["structural_names"])
            text_vector = vectorizer.transform([str(features["text"])])
            structural_values = np.asarray([[features["structure"].get(name, 0) for name in structural_names]], dtype=float)
            structural_vector = scaler.transform(structural_values)
            vector = hstack([text_vector, structural_vector], format="csr")

            probabilities_array = classifier.predict_proba(vector)[0]
            classes = [str(value) for value in classifier.classes_]
            probabilities = {label: round(float(value), 6) for label, value in zip(classes, probabilities_array)}
            index = int(np.argmax(probabilities_array))
            label = classes[index]
            confidence = float(probabilities_array[index])
            contributions = self._contributions(vector, classifier, vectorizer, structural_names, index)
            return {
                "status": "available",
                "label": label,
                "confidence": confidence,
                "probability": confidence,
                "probabilities": probabilities,
                "model_version": str(self.model.get("model_version", _MODEL_VERSION_FALLBACK)),
                "features_used": ["tf-idf", *structural_names],
                "feature_families": list(self.model.get("feature_families", ["subject_body_tfidf", "email_structure"])),
                "top_contributing_features": contributions,
            }
        except Exception:
            return _unavailable(str(self.model.get("model_version", _MODEL_VERSION_FALLBACK)))

    @staticmethod
    def _contributions(vector: Any, classifier: Any, vectorizer: Any, structural_names: list[str], class_index: int) -> list[Dict[str, Any]]:
        coefficients = np.asarray(classifier.coef_)
        if len(classifier.classes_) == 2 and coefficients.shape[0] == 1:
            coefficient_row = coefficients[0] if class_index == 1 else -coefficients[0]
        else:
            coefficient_row = coefficients[class_index]
        values = vector.toarray()[0]
        names = list(vectorizer.get_feature_names_out()) + structural_names
        scored = [(name, float(value * weight)) for name, value, weight in zip(names, values, coefficient_row) if value and value * weight > 0]
        scored.sort(key=lambda item: item[1], reverse=True)

        # Mappings for explainability
        explanation_map = {
            "has_urgency": "Suspicious urgency/action language",
            "has_cred": "Credential/account verification language",
            "has_financial": "Financial or payment-related language",
            "reply_to_mismatch": "Mismatched sender and Reply-To addresses",
            "html_text_ratio": "Anomalous HTML-to-text ratio",
            "url_count": "Presence of URLs",
            "unique_url_count": "Multiple unique URLs",
            "attachment_count": "Presence of attachments",
            "has_html": "HTML content formatting",
        }

        results = []
        for name, score in scored[:10]:
            if name in explanation_map:
                desc = explanation_map[name]
            elif name in structural_names:
                desc = f"Structural anomaly ({name.replace('_', ' ')})"
            else:
                desc = f"Content keyword matching threat profile: '{name}'"

            results.append({
                "feature": name,
                "description": desc,
                "contribution": round(score, 6)
            })

        return results[:8]



_DEFAULT_CLASSIFIER: Optional[MLClassifier] = None


def get_ml_classifier() -> MLClassifier:
    """Return the process-local classifier instance; never trains on request."""
    global _DEFAULT_CLASSIFIER
    if _DEFAULT_CLASSIFIER is None:
        _DEFAULT_CLASSIFIER = MLClassifier()
    return _DEFAULT_CLASSIFIER

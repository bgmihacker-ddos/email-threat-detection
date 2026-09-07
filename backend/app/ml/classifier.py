"""Phase 6I: Machine Learning Classifier Service."""

from typing import Any, Dict, Optional
import os
import joblib


class MLClassifier:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(
            os.path.dirname(__file__), "model.joblib"
        )
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception:
                self.model = None

    def predict(self, text: str) -> Dict[str, Any]:
        """Predict email class using trained ML model if available."""
        if not self.model or not text.strip():
            return {
                "status": "unavailable",
                "label": "unknown",
                "probability": 0.0,
                "model_version": "v1.0-cpu",
                "features_used": ["tf-idf"],
            }

        try:
            proba = self.model.predict_proba([text])[0]
            pred_idx = proba.argmax()
            label = self.model.classes_[pred_idx]
            return {
                "status": "available",
                "label": str(label),
                "probability": float(proba[pred_idx]),
                "model_version": "v1.0-cpu",
                "features_used": ["tf-idf"],
            }
        except Exception:
            return {
                "status": "unavailable",
                "label": "unknown",
                "probability": 0.0,
                "model_version": "v1.0-cpu",
                "features_used": [],
            }

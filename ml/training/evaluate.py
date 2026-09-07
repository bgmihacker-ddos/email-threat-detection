"""Evaluation helpers for the controlled email ML corpus."""

from __future__ import annotations

from typing import Any, Dict, Iterable, Sequence

from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score


def evaluate_classifier(classifier: Any, features: Any, labels: Sequence[str]) -> Dict[str, Any]:
    """Return deterministic, JSON-serializable held-out classification metrics."""
    predicted = classifier.predict(features)
    classes = [str(value) for value in classifier.classes_]
    matrix = confusion_matrix(labels, predicted, labels=classes)
    return {
        "sample_count": len(labels),
        "accuracy": float(accuracy_score(labels, predicted)),
        "precision_macro": float(precision_score(labels, predicted, labels=classes, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(labels, predicted, labels=classes, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(labels, predicted, labels=classes, average="macro", zero_division=0)),
        "labels": classes,
        "confusion_matrix": matrix.tolist(),
    }

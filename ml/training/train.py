"""Train the local explainable email classifier.

Usage from the repository root::

    python ml/training/train.py

The command reads only the controlled JSONL corpus and writes an ignored model
artifact. It never contacts external services and never runs during inference.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Mapping, Tuple

import joblib
import numpy as np
from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

try:
    from ml.training.evaluate import evaluate_classifier
    from ml.training.features import STRUCTURAL_NAMES, record_to_features
except ImportError:
    from evaluate import evaluate_classifier
    from features import STRUCTURAL_NAMES, record_to_features

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATASET = ROOT / "ml" / "datasets" / "controlled" / "emails.jsonl"
DEFAULT_ARTIFACT = ROOT / "ml" / "models" / "email_threat_tfidf_logreg.joblib"


def load_records(path: Path) -> List[Mapping[str, Any]]:
    records = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                records.append(json.loads(line))
    if not records:
        raise ValueError("The controlled training corpus is empty")
    return records


def _matrix(records: List[Mapping[str, Any]], vectorizer: TfidfVectorizer, scaler: StandardScaler, fit: bool = False):
    prepared = [record_to_features(record) for record in records]
    texts = [item["text"] for item in prepared]
    structures = np.asarray([
        [item["structure"][name] for name in STRUCTURAL_NAMES]
        for item in prepared
    ], dtype=float)
    text_matrix = vectorizer.fit_transform(texts) if fit else vectorizer.transform(texts)
    structural_matrix = scaler.fit_transform(structures) if fit else scaler.transform(structures)
    return hstack([text_matrix, structural_matrix], format="csr")


def train_model(dataset_path: Path = DEFAULT_DATASET, artifact_path: Path = DEFAULT_ARTIFACT) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    records = load_records(dataset_path)
    labels = np.asarray([str(record["label"]) for record in records])
    indices = np.arange(len(records))
    train_indices, test_indices = train_test_split(
        indices, test_size=0.25, random_state=20260907, stratify=labels
    )
    train_records = [records[index] for index in train_indices]
    test_records = [records[index] for index in test_indices]

    vectorizer = TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=1, sublinear_tf=True)
    scaler = StandardScaler()

    # Evaluate on split
    train_features = _matrix(train_records, vectorizer, scaler, fit=True)
    test_features = _matrix(test_records, vectorizer, scaler, fit=False)
    classifier_eval = LogisticRegression(C=0.5, max_iter=1000, random_state=20260907, solver="lbfgs")
    classifier_eval.fit(train_features, [str(record["label"]) for record in train_records])
    metrics = evaluate_classifier(classifier_eval, test_features, [str(record["label"]) for record in test_records])

    # Train production model on full dataset
    full_features = _matrix(records, vectorizer, scaler, fit=True)
    classifier = LogisticRegression(C=0.5, max_iter=1000, random_state=20260907, solver="lbfgs")
    classifier.fit(full_features, labels)

    import datetime

    artifact = {
        "artifact_version": 2,
        "model_version": "tfidf-logreg-controlled-v2",
        "text_vectorizer": vectorizer,
        "structural_scaler": scaler,
        "classifier": classifier,
        "structural_names": list(STRUCTURAL_NAMES),
        "feature_families": ["subject_body_tfidf", "email_structure", "content_lexical"],
        "training_metadata": {
            "dataset": str(dataset_path.relative_to(ROOT)),
            "sample_count": len(records),
            "classes": list(classifier.classes_),
            "random_state": 20260907,
            "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "feature_version": 2,
            "metrics": metrics,
        },
    }
    artifact_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, artifact_path, compress=3)
    metrics_path = artifact_path.with_suffix(".metrics.json")
    metrics_path.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    return artifact, metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the controlled local email threat classifier")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--artifact", type=Path, default=DEFAULT_ARTIFACT)
    args = parser.parse_args()
    _, metrics = train_model(args.dataset, args.artifact)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()

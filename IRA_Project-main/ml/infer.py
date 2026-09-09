"""JSON-in / JSON-out inference using saved sklearn pipelines. Not used for training."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd

ARTIFACTS = Path(__file__).resolve().parent / "artifacts"
CLASS_FEATURES = [
    "attendance",
    "current_test_score",
    "current_assignment_score",
    "previous_test_score",
    "previous_assignment_score",
    "fees",
    "gender",
]
REG_FEATURES = [
    "attendance",
    "previous_test_score",
    "previous_assignment_score",
    "fees",
    "gender",
]

_clf = None
_reg = None


def load_models():
    global _clf, _reg
    if _clf is None:
        _clf = joblib.load(ARTIFACTS / "dropout_pipeline.joblib")
    if _reg is None:
        _reg = joblib.load(ARTIFACTS / "performance_pipeline.joblib")
    return _clf, _reg


def predict(payload: dict) -> dict:
    clf, reg = load_models()
    row = {k: payload[k] for k in CLASS_FEATURES}
    Xc = pd.DataFrame([row])
    risk = clf.predict(Xc)[0]
    proba = clf.predict_proba(Xc)[0]
    classes = list(clf.classes_)
    probabilities = {str(c): float(p) for c, p in zip(classes, proba)}
    Xr = pd.DataFrame([{k: payload[k] for k in REG_FEATURES}])
    performance = float(reg.predict(Xr)[0])
    performance = max(0.0, min(100.0, performance))
    return {
        "dropout_risk": str(risk),
        "probabilities": probabilities,
        "predicted_academic_performance": round(performance, 2),
    }


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw)
    print(json.dumps(predict(payload)))


if __name__ == "__main__":
    main()

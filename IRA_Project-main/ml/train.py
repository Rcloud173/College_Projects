"""Train dropout-risk classifier and academic-performance regressor.

Leakage-safe: duplicates dropped, split before encoding/scaling, pipelines saved.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "4")

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    HistGradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

RANDOM_STATE = 42
ROOT = Path(__file__).resolve().parents[1]
RAW_CSV = ROOT / "synthetic_student_data_with_risk_30_40_30.csv"
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
NUMERIC_CLASS = [
    "attendance",
    "current_test_score",
    "current_assignment_score",
    "previous_test_score",
    "previous_assignment_score",
]
NUMERIC_REG = ["attendance", "previous_test_score", "previous_assignment_score"]
CATEGORICAL = ["fees", "gender"]
RISK_ORDER = ["Low Risk", "Medium Risk", "High Risk"]


def _numeric_pipe():
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", RobustScaler()),
        ]
    )


def _categorical_pipe():
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )


def make_preprocessor(numeric_cols):
    return ColumnTransformer(
        transformers=[
            ("num", _numeric_pipe(), numeric_cols),
            ("cat", _categorical_pipe(), CATEGORICAL),
        ]
    )


def rmse(y_true, y_pred):
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    df_raw = pd.read_csv(RAW_CSV)
    n_raw = len(df_raw)
    n_dups = int(df_raw.duplicated().sum())
    df = df_raw.drop_duplicates().reset_index(drop=True)

    df["academic_performance"] = (
        df["current_test_score"] + df["current_assignment_score"]
    ) / 2.0

    Xc = df[CLASS_FEATURES]
    yc = df["dropout_target"]
    Xc_train, Xc_test, yc_train, yc_test = train_test_split(
        Xc, yc, test_size=0.20, random_state=RANDOM_STATE, stratify=yc
    )

    class_candidates = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "DecisionTree": DecisionTreeClassifier(
            max_depth=12,
            min_samples_leaf=20,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=80,
            max_depth=14,
            min_samples_leaf=10,
            n_jobs=-1,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "HistGradientBoosting": HistGradientBoostingClassifier(
            max_depth=8,
            learning_rate=0.08,
            max_iter=120,
            random_state=RANDOM_STATE,
            class_weight="balanced",
        ),
    }

    class_results = []
    best_name, best_f1, best_pipe = None, -1.0, None
    for name, model in class_candidates.items():
        pipe = Pipeline(
            steps=[
                ("preprocess", make_preprocessor(NUMERIC_CLASS)),
                ("model", model),
            ]
        )
        pipe.fit(Xc_train, yc_train)
        pred = pipe.predict(Xc_test)
        metrics = {
            "model": name,
            "accuracy": float(accuracy_score(yc_test, pred)),
            "f1_macro": float(f1_score(yc_test, pred, average="macro")),
            "precision_macro": float(precision_score(yc_test, pred, average="macro")),
            "recall_macro": float(recall_score(yc_test, pred, average="macro")),
        }
        class_results.append(metrics)
        if metrics["f1_macro"] > best_f1:
            best_f1 = metrics["f1_macro"]
            best_name = name
            best_pipe = pipe

    yc_pred = best_pipe.predict(Xc_test)
    class_report = classification_report(yc_test, yc_pred, output_dict=True)
    cm = confusion_matrix(yc_test, yc_pred, labels=RISK_ORDER).tolist()
    joblib.dump(best_pipe, ARTIFACTS / "dropout_pipeline.joblib")

    Xr = df[REG_FEATURES]
    yr = df["academic_performance"]
    Xr_train, Xr_test, yr_train, yr_test = train_test_split(
        Xr, yr, test_size=0.20, random_state=RANDOM_STATE
    )

    reg_candidates = {
        "LinearRegression": LinearRegression(),
        "Ridge": Ridge(alpha=1.0, random_state=RANDOM_STATE),
        "DecisionTree": DecisionTreeRegressor(
            max_depth=12, min_samples_leaf=20, random_state=RANDOM_STATE
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=80,
            max_depth=14,
            min_samples_leaf=10,
            n_jobs=-1,
            random_state=RANDOM_STATE,
        ),
        "HistGradientBoosting": HistGradientBoostingRegressor(
            max_depth=8, learning_rate=0.08, max_iter=120, random_state=RANDOM_STATE
        ),
    }

    reg_results = []
    best_reg_name, best_r2, best_reg = None, -np.inf, None
    for name, model in reg_candidates.items():
        pipe = Pipeline(
            steps=[
                ("preprocess", make_preprocessor(NUMERIC_REG)),
                ("model", model),
            ]
        )
        pipe.fit(Xr_train, yr_train)
        pred = pipe.predict(Xr_test)
        metrics = {
            "model": name,
            "r2": float(r2_score(yr_test, pred)),
            "mae": float(mean_absolute_error(yr_test, pred)),
            "mse": float(mean_squared_error(yr_test, pred)),
            "rmse": rmse(yr_test, pred),
        }
        reg_results.append(metrics)
        if metrics["r2"] > best_r2:
            best_r2 = metrics["r2"]
            best_reg_name = name
            best_reg = pipe

    joblib.dump(best_reg, ARTIFACTS / "performance_pipeline.joblib")

    risk_counts = df["dropout_target"].value_counts().reindex(RISK_ORDER).fillna(0)
    fees_counts = df["fees"].value_counts().to_dict()
    gender_counts = df["gender"].value_counts().to_dict()
    risk_by_fees = (
        df.groupby(["fees", "dropout_target"]).size().unstack(fill_value=0).to_dict()
    )
    risk_by_gender = (
        df.groupby(["gender", "dropout_target"]).size().unstack(fill_value=0).to_dict()
    )

    numeric_summary = {}
    for col in NUMERIC_CLASS:
        numeric_summary[col] = {
            "mean": float(df[col].mean()),
            "median": float(df[col].median()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "max": float(df[col].max()),
        }

    attendance_bins = pd.cut(
        df["attendance"], bins=[0, 40, 55, 70, 100], include_lowest=True
    )
    risk_by_attendance = (
        df.groupby(attendance_bins, observed=False)["dropout_target"]
        .value_counts()
        .unstack(fill_value=0)
    )
    risk_by_attendance.index = risk_by_attendance.index.astype(str)

    analytics = {
        "n_raw": n_raw,
        "n_duplicates_removed": n_dups,
        "n_clean": int(len(df)),
        "risk_distribution": {k: int(v) for k, v in risk_counts.items()},
        "fees_distribution": {k: int(v) for k, v in fees_counts.items()},
        "gender_distribution": {k: int(v) for k, v in gender_counts.items()},
        "risk_by_fees": {
            str(k): {str(kk): int(vv) for kk, vv in v.items()}
            if isinstance(v, dict)
            else v
            for k, v in pd.DataFrame(risk_by_fees).to_dict().items()
        },
        "risk_by_gender": {
            str(k): {str(kk): int(vv) for kk, vv in v.items()}
            if isinstance(v, dict)
            else v
            for k, v in pd.DataFrame(risk_by_gender).to_dict().items()
        },
        "numeric_summary": numeric_summary,
        "risk_by_attendance_band": {
            idx: {str(k): int(v) for k, v in row.items()}
            for idx, row in risk_by_attendance.iterrows()
        },
        "mean_academic_performance": float(df["academic_performance"].mean()),
        "mean_performance_by_risk": {
            k: float(v)
            for k, v in df.groupby("dropout_target")["academic_performance"]
            .mean()
            .items()
        },
    }
    with open(ARTIFACTS / "analytics.json", "w") as f:
        json.dump(analytics, f, indent=2)

    model_info = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "random_state": RANDOM_STATE,
        "n_raw_rows": n_raw,
        "n_duplicates_removed": n_dups,
        "n_train_class": int(len(Xc_train)),
        "n_test_class": int(len(Xc_test)),
        "classification": {
            "task": "Dropout risk (Low / Medium / High)",
            "target": "dropout_target",
            "features": CLASS_FEATURES,
            "best_model": best_name,
            "selection_metric": "f1_macro",
            "candidates": class_results,
            "test_metrics": next(r for r in class_results if r["model"] == best_name),
            "per_class": {
                k: {
                    "precision": float(v["precision"]),
                    "recall": float(v["recall"]),
                    "f1": float(v["f1-score"]),
                    "support": float(v["support"]),
                }
                for k, v in class_report.items()
                if k in RISK_ORDER
            },
            "confusion_matrix_labels": RISK_ORDER,
            "confusion_matrix": cm,
        },
        "regression": {
            "task": "Academic performance (mean of current test and assignment scores)",
            "target": "academic_performance",
            "features": REG_FEATURES,
            "best_model": best_reg_name,
            "selection_metric": "r2",
            "candidates": reg_results,
            "test_metrics": next(r for r in reg_results if r["model"] == best_reg_name),
        },
        "preprocessing": {
            "numeric": "median impute + RobustScaler (outlier-robust)",
            "categorical": "mode impute + OneHotEncoder",
            "split": "80/20, stratified for classification, random_state=42",
            "class_imbalance": "class_weight=balanced (30/40/30 is mild)",
        },
    }
    with open(ARTIFACTS / "model_info.json", "w") as f:
        json.dump(model_info, f, indent=2)

    print(json.dumps({"classification": class_results, "regression": reg_results, "best_clf": best_name, "best_reg": best_reg_name}, indent=2))


if __name__ == "__main__":
    main()

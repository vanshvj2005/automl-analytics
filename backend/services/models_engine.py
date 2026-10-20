import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import (
    train_test_split,
    cross_val_score,
    KFold,
    StratifiedKFold
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    StandardScaler,
    OrdinalEncoder,
    LabelEncoder
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    RandomForestClassifier,
    GradientBoostingRegressor,
    GradientBoostingClassifier
)
from sklearn.svm import SVR, SVC
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from xgboost import XGBRegressor, XGBClassifier
from services.optuna_engine import tune_random_forest, tune_xgboost
from services.meta_learning_engine import recommend_models
from services.preprocessing import (
    match_target_column,
    detect_identifier_columns
)


def normalize_columns(df):
    df.columns = (
        df.columns
        .astype(str)
        .str.replace("\ufeff", "", regex=False)
        .str.strip()
    )
    return df


def detect_problem_type(y):
    if not pd.api.types.is_numeric_dtype(y) or pd.api.types.is_bool_dtype(y):
        return "classification"

    y_clean = y.dropna()
    if len(y_clean) == 0:
        return "regression"

    n_unique = y_clean.nunique()

    # Binary targets (0/1) are classification
    if n_unique <= 2:
        return "classification"

    # If float with non-integers, it is regression
    if pd.api.types.is_float_dtype(y_clean):
        is_all_int = (y_clean == y_clean.round()).all()
        if not is_all_int:
            return "regression"

    val_min = y_clean.min()
    val_max = y_clean.max()
    val_range = val_max - val_min

    # Standard classification targets use a small set of contiguous small labels (e.g. 0, 1, 2)
    if n_unique <= 10 and val_range <= 15 and val_min >= 0:
        return "classification"

    # Large values, wide ranges, or more than 10 unique values indicate continuous regression
    if n_unique > 10 or val_range > 20 or val_max > 100:
        return "regression"

    return "classification"


def load_csv_safely(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(path, encoding="latin-1")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="utf-8", errors="ignore")


def _get_cv_splitter(y, problem_type, random_state=42):
    n_samples = len(y)
    if problem_type == "regression":
        cv_splits = max(2, min(5, n_samples // 2))
        return KFold(n_splits=cv_splits, shuffle=True, random_state=random_state), cv_splits

    min_class = y.value_counts().min() if len(y) > 0 else 1
    if min_class >= 2:
        cv_splits = max(2, min(5, int(min_class)))
        return StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=random_state), cv_splits
    else:
        cv_splits = max(2, min(5, n_samples // 2))
        return KFold(n_splits=cv_splits, shuffle=True, random_state=random_state), cv_splits


def train_models(processed_path, models_dir, target):
    meta_path = os.path.join(os.path.dirname(processed_path), "meta_features.json")
    meta_features = None

    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r") as f:
                meta_features = json.load(f)
        except Exception:
            meta_features = None

    df = load_csv_safely(processed_path)
    df = normalize_columns(df)

    # Robust target matching
    target_col = match_target_column(df.columns, target)
    if not target_col:
        raise ValueError(
            f"Target column '{target}' not found. "
            f"Available columns: {list(df.columns)}"
        )

    # Conservatively drop any remaining identifier columns from predictors
    id_cols = detect_identifier_columns(df, target_col=target_col)
    if id_cols:
        df = df.drop(columns=id_cols)

    X = df.drop(columns=[target_col])
    y = df[target_col]

    problem_type = detect_problem_type(y)

    # Encode string/object classification target for compatibility with XGBoost and other models
    target_classes = None
    if problem_type == "classification" and (not pd.api.types.is_numeric_dtype(y) or y.dtype == object):
        target_encoder = LabelEncoder()
        y = pd.Series(target_encoder.fit_transform(y.astype(str)), index=y.index, name=target_col)
        target_classes = [str(cls) for cls in target_encoder.classes_]

    recommended_models = None
    if meta_features:
        try:
            recommended_models = recommend_models(meta_features, problem_type=problem_type)
            print(f"Recommended models from meta-learning ({problem_type}):", recommended_models)
        except Exception as e:
            print("Meta-learning recommendation error:", e)

    # TRAIN / TEST SPLIT BEFORE ANY LEARNED PREPROCESSING (ZERO DATA LEAKAGE)
    stratify = None
    if problem_type == "classification":
        class_counts = y.value_counts()
        if class_counts.min() >= 2:
            stratify = y

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    os.makedirs(models_dir, exist_ok=True)

    # Persist the exact untouched held-out test partition for evaluation_engine
    test_data_path = os.path.join(models_dir, "test_data.joblib")
    joblib.dump({
        "X_test": X_test,
        "y_test": y_test,
        "target_col": target_col,
        "target_classes": target_classes,
        "problem_type": problem_type
    }, test_data_path)

    # Build leak-free ColumnTransformer for Scikit-learn Pipeline
    numeric_cols = list(X_train.select_dtypes(include=[np.number]).columns)
    categorical_cols = list(X_train.select_dtypes(exclude=[np.number]).columns)

    transformers = []
    if numeric_cols:
        num_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        transformers.append(("num", num_pipeline, numeric_cols))

    if categorical_cols:
        cat_pipeline = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
        ])
        transformers.append(("cat", cat_pipeline, categorical_cols))

    preprocessor = ColumnTransformer(transformers=transformers)

    # Standardized reproducible CV splitter
    cv_splitter, cv_splits = _get_cv_splitter(y_train, problem_type, random_state=42)

    if problem_type == "regression":
        models = {
            "LinearRegression": LinearRegression(),
            "RandomForestRegressor": RandomForestRegressor(random_state=42),
            "GradientBoostingRegressor": GradientBoostingRegressor(random_state=42),
            "SVR": SVR(),
            "KNNRegressor": KNeighborsRegressor(),
            "XGBRegressor": XGBRegressor(objective="reg:squarederror", random_state=42)
        }
        scoring = "r2"

        if recommended_models:
            filtered = {k: v for k, v in models.items() if k in recommended_models}
            if len(filtered) > 0:
                models = filtered

    else:
        models = {
            "LogisticRegression": LogisticRegression(max_iter=500, random_state=42),
            "RandomForestClassifier": RandomForestClassifier(random_state=42),
            "GradientBoostingClassifier": GradientBoostingClassifier(random_state=42),
            "SVC": SVC(probability=True, random_state=42),
            "KNNClassifier": KNeighborsClassifier(),
            "XGBClassifier": XGBClassifier(eval_metric="logloss", random_state=42)
        }
        scoring = "accuracy"

        if recommended_models:
            filtered = {k: v for k, v in models.items() if k in recommended_models}
            if len(filtered) > 0:
                models = filtered

    best_score = -float("inf")
    best_score_std = float("inf")
    best_pipeline = None
    best_model_name = None
    results = {}

    for name, base_estimator in models.items():
        print(f"Training model: {name}")
        try:
            # Optuna Bayesian hyperparameter optimization on training split
            if name in ("RandomForestClassifier", "RandomForestRegressor"):
                tuned_model, _ = tune_random_forest(
                    X_train, y_train, problem_type=problem_type,
                    preprocessor=preprocessor, cv_splitter=cv_splitter
                )
                estimator = tuned_model
            elif name in ("XGBClassifier", "XGBRegressor"):
                tuned_model, _ = tune_xgboost(
                    X_train, y_train, problem_type=problem_type,
                    preprocessor=preprocessor, cv_splitter=cv_splitter
                )
                estimator = tuned_model
            else:
                estimator = base_estimator

            # Full pipeline encapsulates preprocessing and estimator
            pipeline = Pipeline([
                ("preprocessor", clone(preprocessor)),
                ("model", estimator)
            ])

            # Cross-validation evaluated strictly on X_train (X_test remains pure untouched holdout)
            cv_scores = cross_val_score(
                pipeline, X_train, y_train, cv=cv_splitter, scoring=scoring
            )
            cv_mean = float(np.mean(cv_scores))
            cv_std = float(np.std(cv_scores))

            # Fit pipeline on full training partition
            pipeline.fit(X_train, y_train)

            model_path = os.path.join(models_dir, f"{name}.pkl")
            joblib.dump(pipeline, model_path)

            results[name] = {
                "cv_score": cv_mean,
                "cv_std": cv_std,
                "model_path": model_path
            }

            # Explicit champion selection: highest mean CV score (tie-breaker: lowest std)
            if cv_mean > best_score or (cv_mean == best_score and cv_std < best_score_std):
                best_score = cv_mean
                best_score_std = cv_std
                best_pipeline = pipeline
                best_model_name = name

        except Exception as e:
            print(f"Model {name} training failed: {e}")
            results[name] = {"error": str(e)}

    # Save champion model pipeline
    best_path = os.path.join(models_dir, "best_model.pkl")

    if best_pipeline is None:
        raise RuntimeError("No models were successfully trained.")

    joblib.dump(best_pipeline, best_path)

    # Leaderboard strictly reflects validation (CV) scores computed on X_train
    leaderboard = []
    for name, info in results.items():
        if "cv_score" in info:
            leaderboard.append({
                "model": name,
                "cv_score": round(info["cv_score"], 4),
                "cv_std": round(info["cv_std"], 4),
                "metric": scoring
            })

    leaderboard = sorted(
        leaderboard,
        key=lambda x: (x["cv_score"], -x["cv_std"]),
        reverse=True
    )

    summary = {
        "leaderboard": leaderboard,
        "problem_type": problem_type,
        "scoring_metric": scoring,
        "scoring_direction": "maximize",
        "selection_rule": "highest_mean_cv_score_on_training_fold",
        "target_column_original_arg": target,
        "target_column_matched": target_col,
        "best_model": best_model_name,
        "best_score": float(best_score),
        "best_score_std": float(best_score_std),
        "best_model_path": best_path,
        "target_classes": target_classes,
        "random_seed": 42,
        "cv_folds": cv_splits,
        "all_models": results
    }

    with open(os.path.join(models_dir, "models_summary.json"), "w") as f:
        json.dump(summary, f, indent=4)

    return summary

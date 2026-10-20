import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder


META_DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    "../experiments/meta_dataset.csv"
)


def load_meta_dataset():
    if not os.path.exists(META_DATA_PATH):
        return None
    try:
        return pd.read_csv(META_DATA_PATH)
    except Exception:
        return None


def train_meta_model(meta_df):
    if meta_df is None or len(meta_df) < 5:
        return None, None

    if "best_model" not in meta_df.columns:
        return None, None

    X = meta_df.drop(columns=["best_model"])
    # Drop non-numeric columns if any exist
    X = X.select_dtypes(include=[np.number])
    y = meta_df["best_model"]

    if len(y.unique()) < 2:
        return None, None

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y_encoded)

    return model, encoder


def recommend_models(meta_features, problem_type="classification", top_k=3):
    if problem_type == "regression":
        fallback = [
            "RandomForestRegressor",
            "XGBRegressor",
            "GradientBoostingRegressor",
            "LinearRegression"
        ]
    else:
        fallback = [
            "RandomForestClassifier",
            "XGBClassifier",
            "LogisticRegression",
            "GradientBoostingClassifier"
        ]

    meta_df = load_meta_dataset()

    if meta_df is None or len(meta_df) < 5:
        return fallback[:top_k]

    model, encoder = train_meta_model(meta_df)

    if model is None:
        return fallback[:top_k]

    try:
        X_new = pd.DataFrame([meta_features])
        # Ensure only numeric features matching training
        X_new = X_new.select_dtypes(include=[np.number])
        probs = model.predict_proba(X_new)[0]
        top_indices = np.argsort(probs)[::-1][:top_k]
        recommended = list(encoder.inverse_transform(top_indices))
        # Ensure recommended models match problem type
        valid_models = [m for m in recommended if (
            ("Regressor" in m or "Linear" in m or "SVR" in m) if problem_type == "regression"
            else ("Classifier" in m or "Logistic" in m or "SVC" in m)
        )]
        return valid_models if len(valid_models) > 0 else fallback[:top_k]
    except Exception:
        return fallback[:top_k]

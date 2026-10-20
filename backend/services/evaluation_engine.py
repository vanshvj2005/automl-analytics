import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error,
    accuracy_score,
    classification_report,
    confusion_matrix
)
from services.shap_engine import generate_shap_plots
from services.preprocessing import match_target_column, detect_identifier_columns
from services.eda_engine import to_json_serializable
from services.models_engine import detect_problem_type


def load_csv_safely(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(path, encoding="latin-1")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="utf-8", errors="ignore")


def evaluate_model(processed_path, models_dir, target, eval_dir):
    os.makedirs(eval_dir, exist_ok=True)

    test_data_path = os.path.join(models_dir, "test_data.joblib")
    models_summary_path = os.path.join(models_dir, "models_summary.json")

    model_summary = {}
    if os.path.exists(models_summary_path):
        try:
            with open(models_summary_path, "r") as f:
                model_summary = json.load(f)
        except Exception:
            model_summary = {}

    # Prefer the exact held-out test partition preserved during train_models
    if os.path.exists(test_data_path):
        test_data = joblib.load(test_data_path)
        X_test = test_data["X_test"]
        y_test = test_data["y_test"]
        problem_type = test_data.get("problem_type") or model_summary.get("problem_type", "regression")
    else:
        df = load_csv_safely(processed_path)
        df.columns = [str(c).replace("\ufeff", "").strip() for c in df.columns]

        target_col = match_target_column(df.columns, target)
        if not target_col:
            raise ValueError(f"Target column '{target}' not found in processed dataset. Available: {list(df.columns)}")

        # Drop identifier columns if present
        id_cols = detect_identifier_columns(df, target_col=target_col)
        if id_cols:
            df = df.drop(columns=id_cols)

        X = df.drop(columns=[target_col])
        y = df[target_col]

        problem_type = detect_problem_type(y)

        if problem_type == "classification" and (not pd.api.types.is_numeric_dtype(y) or y.dtype == object):
            from sklearn.preprocessing import LabelEncoder
            target_encoder = LabelEncoder()
            y = pd.Series(target_encoder.fit_transform(y.astype(str)), index=y.index, name=target_col)

        stratify = y if (problem_type == "classification" and y.value_counts().min() >= 2) else None
        _, X_test, _, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=stratify
        )

    model_path = os.path.join(models_dir, "best_model.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    model = joblib.load(model_path)

    # Evaluate the fitted champion pipeline on the untouched held-out test split
    y_pred = model.predict(X_test)

    run_id = os.path.basename(os.path.dirname(eval_dir))

    # SHAP Explanations
    shap_dir = os.path.join(eval_dir, "shap")
    shap_plots = None

    try:
        # Extract underlying estimator and transformed features if wrapped in a Pipeline
        if hasattr(model, "named_steps"):
            estimator = model.named_steps["model"]
            if "preprocessor" in model.named_steps:
                preprocessor = model.named_steps["preprocessor"]
                X_arr = preprocessor.transform(X_test)
                try:
                    feature_names = [c.split("__")[-1] for c in preprocessor.get_feature_names_out()]
                    X_transformed = pd.DataFrame(X_arr, columns=feature_names)
                except Exception:
                    X_transformed = pd.DataFrame(X_arr)
            elif "scaler" in model.named_steps:
                X_transformed = pd.DataFrame(
                    model.named_steps["scaler"].transform(X_test),
                    columns=X_test.columns
                )
            else:
                X_transformed = X_test
        else:
            estimator = model
            X_transformed = X_test

        raw_shap_plots = generate_shap_plots(
            estimator,
            X_transformed,
            shap_dir
        )
        if raw_shap_plots:
            shap_plots = {
                k: f"/runs/{run_id}/evaluation/shap/{os.path.basename(v)}"
                for k, v in raw_shap_plots.items()
            }
    except Exception as e:
        print("SHAP generation error:", str(e))

    results = {
        "problem_type": problem_type,
        "best_model": model_summary.get("best_model"),
        "best_cv_score": model_summary.get("best_score"),
        "best_cv_std": model_summary.get("best_score_std"),
        "cv_scoring_metric": model_summary.get("scoring_metric", "r2" if problem_type == "regression" else "accuracy")
    }

    if shap_plots:
        results["shap_explanations"] = shap_plots

    # REGRESSION HELD-OUT EVALUATION
    if problem_type == "regression":
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = float(np.sqrt(mse))

        results.update({
            "r2_score": float(r2),
            "mae": float(mae),
            "mse": float(mse),
            "rmse": float(rmse)
        })

        # Actual vs Predicted
        fig1 = None
        try:
            fig1 = plt.figure(figsize=(8, 6))
            sns.scatterplot(x=y_test, y=y_pred, color="orange")
            plt.xlabel("Actual")
            plt.ylabel("Predicted")
            plt.title("Actual vs Predicted")
            path1 = os.path.join(eval_dir, "actual_vs_predicted.png")
            plt.savefig(path1, bbox_inches="tight")
        finally:
            if fig1:
                plt.close(fig1)

        # Plot: Residuals
        residuals = y_test - y_pred
        fig2 = None
        try:
            fig2 = plt.figure(figsize=(8, 6))
            sns.scatterplot(x=y_pred, y=residuals, color="orange")
            plt.axhline(0, color="red")
            plt.xlabel("Predicted")
            plt.ylabel("Residuals")
            plt.title("Residual Plot")
            path2 = os.path.join(eval_dir, "residuals.png")
            plt.savefig(path2, bbox_inches="tight")
        finally:
            if fig2:
                plt.close(fig2)

        # Plot: Error Distribution
        fig3 = None
        try:
            fig3 = plt.figure(figsize=(8, 6))
            sns.histplot(residuals, kde=True, color="orange")
            plt.title("Error Distribution")
            path3 = os.path.join(eval_dir, "error_distribution.png")
            plt.savefig(path3, bbox_inches="tight")
        finally:
            if fig3:
                plt.close(fig3)

        results["plots"] = {
            "actual_vs_predicted": f"/runs/{run_id}/evaluation/actual_vs_predicted.png",
            "residuals": f"/runs/{run_id}/evaluation/residuals.png",
            "error_distribution": f"/runs/{run_id}/evaluation/error_distribution.png"
        }

    # CLASSIFICATION HELD-OUT EVALUATION
    else:
        accuracy = accuracy_score(y_test, y_pred)
        cls_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        results.update({
            "accuracy": float(accuracy),
            "classification_report": cls_report,
            "confusion_matrix": cm
        })

        # Confusion Matrix Plot
        fig = None
        try:
            fig = plt.figure(figsize=(8, 6))
            sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt="d", cmap="Oranges")
            plt.title("Confusion Matrix")
            plt.xlabel("Predicted")
            plt.ylabel("Actual")
            path_cm = os.path.join(eval_dir, "confusion_matrix.png")
            plt.savefig(path_cm, bbox_inches="tight")
        finally:
            if fig:
                plt.close(fig)

        results["plots"] = {
            "confusion_matrix": f"/runs/{run_id}/evaluation/confusion_matrix.png"
        }

    # Safely serialize results to avoid NumPy type errors
    serialized_results = to_json_serializable(results)

    with open(os.path.join(eval_dir, "evaluation_results.json"), "w") as f:
        json.dump(serialized_results, f, indent=4)

    return serialized_results

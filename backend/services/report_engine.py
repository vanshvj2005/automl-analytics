import os
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import inch

def safe_load_json(path):
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return None

def add_heading(story, text, styles):
    story.append(Paragraph(f"<b>{text}</b>", styles["Heading2"]))
    story.append(Spacer(1, 10))

def add_paragraph(story, text, styles):
    story.append(Paragraph(str(text), styles["BodyText"]))
    story.append(Spacer(1, 8))

def resolve_image_path(path, run_path):
    if not path:
        return None
    if os.path.isabs(path) and os.path.exists(path):
        return path

    # Try resolving within run_path
    basename = os.path.basename(path)
    candidates = [
        os.path.join(run_path, basename),
        os.path.join(run_path, "eda_plots", basename),
        os.path.join(run_path, "evaluation", basename),
        os.path.join(run_path, "evaluation", "shap", basename),
        path.lstrip("/")
    ]
    for c in candidates:
        if os.path.exists(c):
            return os.path.abspath(c)
    return None

def add_image_if_exists(story, path, run_path=None, width=400):
    resolved = resolve_image_path(path, run_path) if run_path else (path if path and os.path.exists(path) else None)
    if resolved and os.path.exists(resolved):
        try:
            story.append(Image(resolved, width=width, height=width * 0.6))
            story.append(Spacer(1, 10))
        except Exception as e:
            print(f"Failed to embed image {resolved}: {e}")

def generate_report(run_id, run_path, output_file):
    styles = getSampleStyleSheet()
    story = []

    preprocessing = safe_load_json(os.path.join(run_path, "preprocessing_summary.json"))
    eda = safe_load_json(os.path.join(run_path, "eda_summary.json"))
    models = safe_load_json(os.path.join(run_path, "models", "models_summary.json"))
    evaluation = safe_load_json(os.path.join(run_path, "evaluation", "evaluation_results.json"))

    # TITLE
    story.append(Paragraph("<b>Intelligent ML Analytics Report</b>", styles["Title"]))
    add_paragraph(story, f"Run ID: {run_id}", styles)

    # Preprocessing
    add_heading(story, "Dataset & Preprocessing", styles)

    if preprocessing:
        add_paragraph(story, f"Total Columns: {len(preprocessing.get('original_columns', []))}", styles)
        add_paragraph(story, f"Numeric Features: {len(preprocessing.get('numeric_columns', []))}", styles)
        add_paragraph(story, f"Categorical Features: {len(preprocessing.get('categorical_columns', []))}", styles)
        add_paragraph(story, f"Datetime Columns: {len(preprocessing.get('datetime_columns', []))}", styles)
        excluded = preprocessing.get("excluded_columns", [])
        if excluded:
            add_paragraph(story, f"Excluded Identifiers: {', '.join(excluded)}", styles)
    else:
        add_paragraph(story, "Preprocessing summary not available.", styles)

    # EDA
    add_heading(story, "Exploratory Data Analysis", styles)

    if eda:
        hist_list = eda.get("histograms", [])
        sample_hist = None
        target_col = preprocessing.get("target_column") if preprocessing else None
        excluded = preprocessing.get("excluded_columns", []) if preprocessing else []

        if hist_list:
            # 1. Prefer target column histogram
            if target_col:
                for h in hist_list:
                    if f"hist_{target_col}" in os.path.basename(h):
                        sample_hist = h
                        break
            # 2. Prefer first non-ID predictor
            if not sample_hist:
                for h in hist_list:
                    bname = os.path.basename(h).lower()
                    if not any(ex.lower() in bname for ex in excluded) and not bname.startswith("hist_id"):
                        sample_hist = h
                        break
            # 3. Fallback to first available
            if not sample_hist:
                sample_hist = hist_list[0]

        if sample_hist:
            add_paragraph(story, f"Sample Distribution ({os.path.basename(sample_hist).replace('hist_', '').replace('.png', '')}):", styles)
            add_image_if_exists(story, sample_hist, run_path=run_path)

        if eda.get("correlation_heatmap"):
            add_paragraph(story, "Correlation Heatmap:", styles)
            add_image_if_exists(story, eda.get("correlation_heatmap"), run_path=run_path)
    else:
        add_paragraph(story, "EDA summary not available.", styles)

    # Model Training
    add_heading(story, "Model Selection & Cross-Validation", styles)

    if models:
        add_paragraph(story, f"Problem Type: {models.get('problem_type', 'N/A')}", styles)
        add_paragraph(story, f"Target Column: {models.get('target_column_matched', models.get('target_column', 'N/A'))}", styles)
        metric_name = str(models.get('scoring_metric', 'CV Score')).upper()
        cv_folds = models.get('cv_folds', 5)
        add_paragraph(story, f"Model Selection Metric: {cv_folds}-Fold Cross-Validation {metric_name} (Higher is better)", styles)
        add_paragraph(story, f"Selection Rule: Highest mean cross-validation score across training folds", styles)
        add_paragraph(story, f"Champion Model: {models.get('best_model', 'N/A')}", styles)

        best_score = models.get('best_score')
        best_std = models.get('best_score_std')
        if best_score is not None:
            score_str = f"{float(best_score):.4f}"
            if best_std is not None:
                score_str += f" (±{float(best_std):.4f})"
            add_paragraph(story, f"Champion Validation Score (Mean CV): {score_str}", styles)
    else:
        add_paragraph(story, "Model summary not available.", styles)

    # Evaluation
    add_heading(story, "Champion Evaluation on Held-Out Test Set (20% Split)", styles)

    if evaluation:
        if evaluation.get("problem_type") == "regression":
            add_paragraph(story, f"Held-Out Test R² Score: {evaluation.get('r2_score', 'N/A')}", styles)
            add_paragraph(story, f"Root Mean Squared Error (RMSE): {evaluation.get('rmse', 'N/A')}", styles)
            add_paragraph(story, f"Mean Absolute Error (MAE): {evaluation.get('mae', 'N/A')}", styles)
            add_paragraph(story, f"Mean Squared Error (MSE): {evaluation.get('mse', 'N/A')}", styles)

            plots = evaluation.get("plots", {})
            if plots.get("actual_vs_predicted"):
                add_paragraph(story, "Actual vs Predicted (Held-Out Test):", styles)
                add_image_if_exists(story, plots.get("actual_vs_predicted"), run_path=run_path)

            if plots.get("residuals"):
                add_paragraph(story, "Residuals Plot:", styles)
                add_image_if_exists(story, plots.get("residuals"), run_path=run_path)

            if plots.get("error_distribution"):
                add_paragraph(story, "Error Distribution:", styles)
                add_image_if_exists(story, plots.get("error_distribution"), run_path=run_path)

        else:
            add_paragraph(story, f"Held-Out Test Accuracy: {evaluation.get('accuracy', 'N/A')}", styles)

            plots = evaluation.get("plots", {})
            if plots.get("confusion_matrix"):
                add_paragraph(story, "Confusion Matrix (Held-Out Test):", styles)
                add_image_if_exists(story, plots.get("confusion_matrix"), run_path=run_path)

        # Embedded SHAP plot
        shap_explanations = evaluation.get("shap_explanations", {})
        if shap_explanations and shap_explanations.get("shap_summary"):
            add_paragraph(story, "SHAP Feature Importance (Model Interpretability):", styles)
            add_image_if_exists(story, shap_explanations["shap_summary"], run_path=run_path)
    else:
        add_paragraph(story, "Evaluation results not available.", styles)

    # BUILD PDF
    doc = SimpleDocTemplate(output_file, pagesize=A4)
    doc.build(story)

    return output_file

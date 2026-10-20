import os
import re
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns


def load_csv_safely(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(path, encoding="latin-1")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="utf-8", errors="ignore")


def sanitize_filename(name):
    """
    Replace any unsafe filename character with underscore
    """
    return re.sub(r'[^A-Za-z0-9_.-]+', '_', str(name))


def to_json_serializable(val):
    """
    Recursively converts NumPy, Pandas, and non-finite types into JSON-serializable primitives.
    Avoids boolean evaluation ambiguity on NumPy arrays and Pandas Series.
    """
    if val is None:
        return None
    if isinstance(val, np.ndarray):
        return [to_json_serializable(v) for v in val.tolist()]
    if isinstance(val, (list, tuple, set)):
        return [to_json_serializable(v) for v in val]
    if isinstance(val, dict):
        return {str(k): to_json_serializable(v) for k, v in val.items()}
    if isinstance(val, (pd.Series, pd.Index)):
        return [to_json_serializable(v) for v in val.tolist()]
    if isinstance(val, pd.DataFrame):
        return to_json_serializable(val.to_dict())
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        if np.isnan(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, pd.Timedelta)):
        return str(val)
    try:
        if pd.isna(val):
            return None
    except (ValueError, TypeError):
        pass
    return str(val) if not isinstance(val, (str, type(None))) else val


def generate_eda(df, save_dir, summary_path):
    if not os.path.exists(save_dir):
        os.makedirs(save_dir, exist_ok=True)

    eda_summary = {}

    # Missing values
    missing_dict = df.isnull().sum().to_dict()
    eda_summary["missing_values"] = {str(k): int(v) for k, v in missing_dict.items()}

    # Describe stats
    describe_df = df.describe(include="all").transpose()
    eda_summary["describe"] = to_json_serializable(describe_df.to_dict())

    numeric_cols = [str(c) for c in df.select_dtypes(include=[np.number]).columns]
    categorical_cols = [str(c) for c in df.select_dtypes(exclude=[np.number]).columns]

    eda_summary["numeric_columns"] = numeric_cols
    eda_summary["categorical_cols"] = categorical_cols  # keep existing key compatibility
    eda_summary["categorical_columns"] = categorical_cols

    # Histograms
    hist_paths = []

    for col in numeric_cols:
        fig = None
        try:
            fig = plt.figure(figsize=(7, 5))
            series = df[col].dropna()
            if len(series) > 0:
                sns.histplot(series, kde=True, color="orange")
                plt.title(f"Histogram - {col}")

                safe_name = sanitize_filename(col)
                path = os.path.join(save_dir, f"hist_{safe_name}.png")

                plt.savefig(path, bbox_inches="tight")
                hist_paths.append(path)
        except Exception as e:
            print(f"Histogram failed for {col}: {e}")
        finally:
            if fig is not None:
                plt.close(fig)
            else:
                plt.close()

    eda_summary["histograms"] = hist_paths

    # Correlation Heatmap
    if len(numeric_cols) > 1:
        fig = None
        try:
            fig = plt.figure(figsize=(10, 8))
            corr = df[numeric_cols].corr()
            sns.heatmap(corr, annot=False, cmap="Oranges")
            heatmap_path = os.path.join(save_dir, "correlation_heatmap.png")
            plt.savefig(heatmap_path, bbox_inches="tight")
            eda_summary["correlation_heatmap"] = heatmap_path
        except Exception as e:
            eda_summary["correlation_heatmap"] = None
            print("Heatmap failed:", e)
        finally:
            if fig is not None:
                plt.close(fig)
            else:
                plt.close()
    else:
        eda_summary["correlation_heatmap"] = None

    # Sanitize entire summary object before serializing
    eda_summary = to_json_serializable(eda_summary)

    with open(summary_path, "w") as f:
        json.dump(eda_summary, f, indent=4)

    return eda_summary

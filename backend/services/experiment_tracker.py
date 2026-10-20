import os
import json
import threading
import pandas as pd
from datetime import datetime

EXPERIMENT_DB = os.path.join(
    os.path.dirname(__file__),
    "../experiments/experiment_history.csv"
)

_tracker_lock = threading.Lock()


def log_experiment(run_id, meta_features, model_summary, evaluation_results):
    row = {}

    row["run_id"] = str(run_id)
    row["timestamp"] = datetime.now().isoformat()

    if meta_features and isinstance(meta_features, dict):
        # Exclude non-scalar meta features
        for k, v in meta_features.items():
            if isinstance(v, (int, float, str, bool)):
                row[k] = v

    if model_summary and isinstance(model_summary, dict):
        row["best_model"] = model_summary.get("best_model")

    if evaluation_results and isinstance(evaluation_results, dict):
        if evaluation_results.get("problem_type") == "classification":
            row["score"] = evaluation_results.get("accuracy")
        else:
            row["score"] = evaluation_results.get("r2_score")

    df = pd.DataFrame([row])

    os.makedirs(os.path.dirname(EXPERIMENT_DB), exist_ok=True)

    with _tracker_lock:
        try:
            if os.path.exists(EXPERIMENT_DB):
                df_existing = pd.read_csv(EXPERIMENT_DB)
                df = pd.concat([df_existing, df], ignore_index=True)
            df.to_csv(EXPERIMENT_DB, index=False)
        except Exception as e:
            print(f"Failed to log experiment: {e}")

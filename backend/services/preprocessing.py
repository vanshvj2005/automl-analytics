import os
import re
import json
import pandas as pd
import numpy as np


def normalize_string(s):
    return (
        str(s)
        .replace("\ufeff", "")
        .strip()
        .lower()
    )


def match_target_column(df_columns, target):
    if not target:
        return None
    target_norm = normalize_string(target)
    # Exact match after normalization
    for c in df_columns:
        if normalize_string(c) == target_norm:
            return c
    # Match with spaces and underscores interchangeable
    target_norm_alt = target_norm.replace(" ", "_")
    for c in df_columns:
        if normalize_string(c).replace(" ", "_") == target_norm_alt:
            return c
    return None


def detect_identifier_columns(df, target_col=None):
    """
    Conservatively identify columns that act as unique record identifiers,
    row indexes, or transaction IDs rather than generalizable predictive features.

    Safety Rules:
    - Never exclude the target column.
    - Check column names: matches pattern like 'id', 'identifier', 'index',
      or ends/starts with 'id' with word boundary/underscore.
      Explicitly protect words like 'paid', 'valid', 'mid', 'guide', 'residential'.
    - Uniqueness condition:
      Must have near 100% uniqueness in non-trivial sample sizes, or be a sequential index.
    """
    id_candidates = []
    n_rows = len(df)
    if n_rows < 5:
        return id_candidates

    for col in df.columns:
        if target_col and col == target_col:
            continue

        col_lower = str(col).lower().strip()
        series = df[col].dropna()
        n_unique = series.nunique()

        # Check for obvious index / ID name patterns
        is_id_name = (
            col_lower in {"id", "index", "row_id", "rowid", "record_id", "recordid", "uid", "uuid", "unnamed: 0"}
            or bool(re.search(r"(?:^|[_\W])(id|index|record_id|row_id)(?:$|[_\W])", col_lower))
        )

        # Protect common legitimate domain words that contain 'id'
        non_id_words = {
            "paid", "valid", "mid", "width", "guide", "residential", "liquid",
            "solid", "rapid", "humid", "hybrid", "grid", "pyramid", "acid", "arid"
        }
        if any(w == col_lower or f"_{w}" in col_lower or f"{w}_" in col_lower for w in non_id_words):
            is_id_name = False

        if is_id_name:
            if n_rows >= 10 and n_unique >= 0.95 * len(series):
                id_candidates.append(col)
                continue
            if n_unique == len(series) and len(series) >= 5:
                id_candidates.append(col)
                continue

        # Strict 100% unique sequential integers with an ID-like name
        if pd.api.types.is_integer_dtype(series) or (pd.api.types.is_float_dtype(series) and (series == series.round()).all()):
            if n_unique == n_rows and n_rows >= 20 and is_id_name:
                id_candidates.append(col)

    return id_candidates


def load_csv_safely(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return pd.read_csv(path, encoding="latin-1")
        except UnicodeDecodeError:
            return pd.read_csv(path, encoding="utf-8", errors="ignore")


def detect_datetime_columns(df, target_name):
    datetime_cols = []

    for col in df.columns:
        if col == target_name:
            continue

        if df[col].dtype == "object":
            try:
                # Sample non-null values to test datetime format quickly
                sample = df[col].dropna().head(30)
                if len(sample) > 0 and pd.to_datetime(sample, errors="coerce").notnull().all():
                    datetime_cols.append(col)
            except Exception:
                continue

    return datetime_cols


def extract_datetime_features(df, datetime_cols):
    for col in datetime_cols:
        parsed = pd.to_datetime(df[col], errors="coerce")

        df[f"{col}_year"] = parsed.dt.year.fillna(0).astype(int)
        df[f"{col}_month"] = parsed.dt.month.fillna(0).astype(int)
        df[f"{col}_day"] = parsed.dt.day.fillna(0).astype(int)
        df[f"{col}_dayofweek"] = parsed.dt.dayofweek.fillna(0).astype(int)
        df[f"{col}_hour"] = parsed.dt.hour.fillna(0).astype(int)

        df.drop(columns=[col], inplace=True)

    return df


def preprocess_dataset(input_path, output_path, summary_path=None, target_name=None):
    df = load_csv_safely(input_path)

    # Normalize column names: strip whitespace and remove BOM
    df.columns = [str(c).replace("\ufeff", "").strip() for c in df.columns]

    if target_name:
        matched_target = match_target_column(df.columns, target_name)
        if not matched_target:
            raise ValueError(
                f"Target column '{target_name}' not found in dataset. "
                f"Available columns: {list(df.columns)}"
            )
        target_name = matched_target

    original_columns = list(df.columns)

    # Detect identifier columns
    identifier_cols = detect_identifier_columns(df, target_col=target_name)

    # Datetime Feature Handling (stateless row-wise extraction)
    datetime_cols = detect_datetime_columns(df, target_name)
    df = extract_datetime_features(df, datetime_cols)

    # Exclude identifier columns from the modeling dataset
    if identifier_cols:
        df = df.drop(columns=identifier_cols)

    # Categorize remaining features (excluding target)
    numeric_cols = [
        c for c in df.select_dtypes(include=[np.number]).columns
        if c != target_name
    ]
    categorical_cols = [
        c for c in df.select_dtypes(exclude=[np.number]).columns
        if c != target_name
    ]

    # Save Processed Data WITHOUT global data leakage (no global median/mode imputation or global scaling).
    # All learned transformations (imputation, scaling, categorical encoding) are strictly
    # encapsulated inside scikit-learn Pipelines per-fold during training and CV, eliminating
    # test and validation leakage.
    df.to_csv(output_path, index=False)

    # Save Summary
    if summary_path:
        summary = {
            "original_columns": original_columns,
            "numeric_columns": list(numeric_cols),
            "categorical_columns": list(categorical_cols),
            "datetime_columns": list(datetime_cols),
            "excluded_columns": list(identifier_cols),
            "target_column": target_name
        }

        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=4)

    return True

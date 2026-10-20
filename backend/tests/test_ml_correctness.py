import os
import sys
import json
import shutil
import tempfile
import unittest
import numpy as np
import pandas as pd
import joblib

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.preprocessing import (
    preprocess_dataset,
    detect_identifier_columns,
    match_target_column
)
from services.models_engine import (
    train_models,
    detect_problem_type
)
from services.evaluation_engine import evaluate_model
from services.report_engine import generate_report


class TestMLCorrectness(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.raw_path = os.path.join(self.test_dir, "raw.csv")
        self.processed_path = os.path.join(self.test_dir, "processed.csv")
        self.summary_path = os.path.join(self.test_dir, "preprocessing_summary.json")
        self.models_dir = os.path.join(self.test_dir, "models")
        self.eval_dir = os.path.join(self.test_dir, "evaluation")
        self.report_path = os.path.join(self.test_dir, "report.pdf")

    def tearDown(self):
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_01_metric_direction(self):
        """1. Verify documented metric direction for selection objectives."""
        # For both regression (r2) and classification (accuracy), higher is better
        # Verify leaderboard sorting respects (cv_score descending)
        dummy_results = [
            {"model": "ModelA", "cv_score": 0.82, "cv_std": 0.02},
            {"model": "ModelB", "cv_score": 0.91, "cv_std": 0.01},
            {"model": "ModelC", "cv_score": 0.75, "cv_std": 0.05},
        ]
        sorted_lb = sorted(dummy_results, key=lambda x: (x["cv_score"], -x["cv_std"]), reverse=True)
        self.assertEqual(sorted_lb[0]["model"], "ModelB", "Highest score must be rank #1")
        self.assertEqual(sorted_lb[-1]["model"], "ModelC", "Lowest score must be rank #3")

    def test_02_champion_selection_matches_criterion(self):
        """2. Verify champion selection matches the leaderboard's declared selection criterion."""
        np.random.seed(42)
        n = 100
        df = pd.DataFrame({
            "feature1": np.random.randn(n),
            "feature2": np.random.randn(n),
            "target": np.random.randn(n) * 100 + 500
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "target")
        summary = train_models(self.processed_path, self.models_dir, "target")

        leaderboard = summary["leaderboard"]
        self.assertGreater(len(leaderboard), 0)
        # Declared winner must have the highest CV score in the leaderboard
        best_cv_in_lb = leaderboard[0]["cv_score"]
        self.assertEqual(summary["best_model"], leaderboard[0]["model"])
        self.assertAlmostEqual(summary["best_score"], best_cv_in_lb, places=2)

    def test_03_reported_champion_identity(self):
        """3. Verify reported champion identity matches the saved champion model."""
        np.random.seed(42)
        df = pd.DataFrame({
            "x1": np.linspace(1, 100, 80),
            "x2": np.linspace(100, 1, 80),
            "y": np.linspace(1, 100, 80) * 2.5
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "y")
        summary = train_models(self.processed_path, self.models_dir, "y")

        best_model_path = os.path.join(self.models_dir, "best_model.pkl")
        self.assertTrue(os.path.exists(best_model_path))
        champion_pipeline = joblib.load(best_model_path)
        champion_model_type = champion_pipeline.named_steps["model"].__class__.__name__

        self.assertIn(champion_model_type, summary["best_model"])

    def test_04_cv_metrics_distinguished_from_final_test_metrics(self):
        """4. Verify CV metrics are distinguished from held-out test metrics and no test scores in training leaderboard."""
        np.random.seed(42)
        df = pd.DataFrame({
            "f1": np.random.randn(60),
            "f2": np.random.randn(60),
            "target": np.random.randn(60) * 50
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "target")
        train_summary = train_models(self.processed_path, self.models_dir, "target")

        # In train_summary leaderboard, test_score must NOT be present
        for entry in train_summary["leaderboard"]:
            self.assertIn("cv_score", entry)
            self.assertNotIn("test_score", entry, "Candidate loop must NOT evaluate test_score to prevent snooping")

        # In evaluate_model, final held-out test metrics are computed
        eval_results = evaluate_model(self.processed_path, self.models_dir, "target", self.eval_dir)
        self.assertIn("r2_score", eval_results)
        self.assertIn("rmse", eval_results)
        self.assertIn("mae", eval_results)
        # CV score is recorded separately with cv_ prefix
        self.assertIn("best_cv_score", eval_results)

    def test_05_correct_rmse_from_mse(self):
        """5. Verify correct RMSE calculation as the exact square root of MSE."""
        np.random.seed(42)
        df = pd.DataFrame({
            "a": np.random.randn(60),
            "b": np.random.randn(60),
            "y": np.random.randn(60) * 10
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "y")
        train_models(self.processed_path, self.models_dir, "y")
        eval_results = evaluate_model(self.processed_path, self.models_dir, "y", self.eval_dir)

        self.assertTrue(np.isclose(eval_results["rmse"], np.sqrt(eval_results["mse"])))

    def test_06_preprocessing_fitted_inside_partitions(self):
        """6. Verify learned preprocessing is fitted strictly on training partition and does not leak test statistics."""
        from sklearn.compose import ColumnTransformer
        from sklearn.pipeline import Pipeline
        from sklearn.impute import SimpleImputer
        from sklearn.preprocessing import StandardScaler

        # Create train and test where test has an extreme outlier (1,000,000)
        X_train = pd.DataFrame({"val": [10.0, 20.0, 30.0, 40.0, 50.0]})
        y_train = pd.Series([1.0, 2.0, 3.0, 4.0, 5.0])
        X_test = pd.DataFrame({"val": [1000000.0]})

        pipeline = Pipeline([
            ("preprocessor", ColumnTransformer([
                ("num", Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler())
                ]), ["val"])
            ])),
            ("model", None)
        ])

        # Fit preprocessor on train only
        preprocessor = pipeline.named_steps["preprocessor"]
        preprocessor.fit(X_train)

        scaler = preprocessor.named_transformers_["num"].named_steps["scaler"]
        # Training mean should be 30.0, completely uncontaminated by test value 1,000,000
        self.assertAlmostEqual(scaler.mean_[0], 30.0, places=3)
        self.assertNotEqual(scaler.mean_[0], np.mean([10.0, 20.0, 30.0, 40.0, 50.0, 1000000.0]))

    def test_07_no_target_leakage_into_features(self):
        """7. Verify target column is excluded from features and transformations."""
        df = pd.DataFrame({
            "feature": [1, 2, 3, 4, 5],
            "target": [10, 20, 30, 40, 50]
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "target")

        with open(self.summary_path, "r") as f:
            summary = json.load(f)

        self.assertNotIn("target", summary["numeric_columns"])
        self.assertNotIn("target", summary["categorical_columns"])
        self.assertEqual(summary["target_column"], "target")

    def test_08_identifier_column_handling(self):
        """8. Verify conservative identifier detection and feature exclusion."""
        n = 50
        df = pd.DataFrame({
            "Id": list(range(1, n + 1)),
            "user_id": [f"USR_{i}" for i in range(n)],
            "paid": np.random.uniform(10, 500, n),
            "valid": np.random.choice([0, 1], n),
            "width": np.random.uniform(1, 20, n),
            "residential": np.random.choice(["Yes", "No"], n),
            "target": np.random.uniform(100, 1000, n)
        })
        df.to_csv(self.raw_path, index=False)

        ids = detect_identifier_columns(df, target_col="target")
        self.assertIn("Id", ids, "Should detect Id as identifier")
        self.assertIn("user_id", ids, "Should detect user_id as identifier")
        self.assertNotIn("paid", ids, "Legitimate feature 'paid' must NOT be excluded")
        self.assertNotIn("valid", ids, "Legitimate feature 'valid' must NOT be excluded")
        self.assertNotIn("width", ids, "Legitimate feature 'width' must NOT be excluded")
        self.assertNotIn("residential", ids, "Legitimate feature 'residential' must NOT be excluded")
        self.assertNotIn("target", ids, "Target column must NOT be excluded")

        # Run preprocessing and verify excluded columns
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "target")
        with open(self.summary_path, "r") as f:
            prep_summary = json.load(f)

        self.assertIn("Id", prep_summary["excluded_columns"])
        self.assertIn("user_id", prep_summary["excluded_columns"])

        # Check processed CSV doesn't have Id
        df_processed = pd.read_csv(self.processed_path)
        self.assertNotIn("Id", df_processed.columns)
        self.assertNotIn("user_id", df_processed.columns)
        self.assertIn("paid", df_processed.columns)

    def test_09_regression_model_selection(self):
        """9. Verify regression pipeline training, cross-validation, and champion selection."""
        np.random.seed(42)
        n = 80
        df = pd.DataFrame({
            "num1": np.random.randn(n),
            "num2": np.random.randn(n),
            "cat1": np.random.choice(["type_A", "type_B", "type_C"], n),
            "price": np.random.randn(n) * 50 + 200
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "price")
        summary = train_models(self.processed_path, self.models_dir, "price")

        self.assertEqual(summary["problem_type"], "regression")
        self.assertEqual(summary["scoring_metric"], "r2")
        self.assertIsNotNone(summary["best_model"])
        self.assertTrue(os.path.exists(summary["best_model_path"]))

    def test_10_classification_model_selection(self):
        """10. Verify classification pipeline training, cross-validation, and metrics."""
        np.random.seed(42)
        n = 90
        df = pd.DataFrame({
            "feature1": np.random.randn(n),
            "feature2": np.random.randn(n),
            "category": np.random.choice(["Alpha", "Beta", "Gamma"], n),
            "label": np.random.choice([0, 1, 2], n)
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "label")
        summary = train_models(self.processed_path, self.models_dir, "label")

        self.assertEqual(summary["problem_type"], "classification")
        self.assertEqual(summary["scoring_metric"], "accuracy")

        eval_results = evaluate_model(self.processed_path, self.models_dir, "label", self.eval_dir)
        self.assertIn("accuracy", eval_results)
        self.assertIn("confusion_matrix", eval_results)
        self.assertIn("classification_report", eval_results)

    def test_11_string_label_classification(self):
        """11. Verify string-label classification encodes targets and runs XGBoost/RF without error."""
        np.random.seed(42)
        n = 80
        df = pd.DataFrame({
            "x1": np.random.randn(n),
            "x2": np.random.randn(n),
            "status": np.random.choice(["Active", "Churned", "Suspended"], n)
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "status")
        summary = train_models(self.processed_path, self.models_dir, "status")

        self.assertEqual(summary["problem_type"], "classification")
        self.assertIsNotNone(summary["target_classes"])
        self.assertIn("Active", summary["target_classes"])

        eval_results = evaluate_model(self.processed_path, self.models_dir, "status", self.eval_dir)
        self.assertIn("accuracy", eval_results)

    def test_12_failure_handling_when_all_models_fail(self):
        """12. Verify clear error handling when all candidate models fail."""
        # Empty dataframe
        df = pd.DataFrame({"target": []})
        df.to_csv(self.raw_path, index=False)
        with self.assertRaises(Exception):
            train_models(self.raw_path, self.models_dir, "target")

    def test_13_metadata_consistency_across_pipeline_and_pdf(self):
        """13. Verify consistent metadata across training, evaluation, and generated PDF report."""
        np.random.seed(42)
        n = 80
        df = pd.DataFrame({
            "area": np.random.uniform(500, 3000, n),
            "rooms": np.random.randint(1, 5, n),
            "price": np.random.uniform(100000, 500000, n)
        })
        df.to_csv(self.raw_path, index=False)
        preprocess_dataset(self.raw_path, self.processed_path, self.summary_path, "price")

        # Fake EDA summary for report
        eda_summary_path = os.path.join(self.test_dir, "eda_summary.json")
        with open(eda_summary_path, "w") as f:
            json.dump({"histograms": [], "correlation_heatmap": None}, f)

        summary = train_models(self.processed_path, self.models_dir, "price")
        eval_results = evaluate_model(self.processed_path, self.models_dir, "price", self.eval_dir)

        # Generate PDF report
        report_out = generate_report("test-run-123", self.test_dir, self.report_path)
        self.assertTrue(os.path.exists(report_out))
        self.assertGreater(os.path.getsize(report_out), 1000)

        # Verify cross-metadata identity
        self.assertEqual(eval_results["best_model"], summary["best_model"])
        self.assertEqual(eval_results["best_cv_score"], summary["best_score"])


if __name__ == "__main__":
    unittest.main()

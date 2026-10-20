def analyze_dataset_complexity(meta_features):
    complexity = {}

    n_samples = meta_features.get("n_samples", 0)
    n_features = meta_features.get("n_features", 0)
    missing_ratio = meta_features.get("missing_ratio", 0)
    sparsity = meta_features.get("sparsity", 0)

    # Dataset size
    if n_samples < 500:
        complexity["dataset_size"] = "small"
    elif n_samples < 5000:
        complexity["dataset_size"] = "medium"
    else:
        complexity["dataset_size"] = "large"

    # Dimensionality
    if n_features > 100:
        complexity["dimensionality"] = "high"
    else:
        complexity["dimensionality"] = "low"

    # Missing data
    if missing_ratio > 0.2:
        complexity["missing_data"] = "high"
    else:
        complexity["missing_data"] = "low"

    # Sparsity
    if sparsity > 0.5:
        complexity["sparse"] = True
    else:
        complexity["sparse"] = False

    return complexity


def recommend_pipeline(complexity, problem_type="classification"):
    pipeline = {}

    if problem_type == "regression":
        if complexity.get("dataset_size") == "small":
            pipeline["recommended_models"] = ["LinearRegression", "RandomForestRegressor"]
        elif complexity.get("dataset_size") == "medium":
            pipeline["recommended_models"] = ["RandomForestRegressor", "GradientBoostingRegressor"]
        else:
            pipeline["recommended_models"] = ["XGBRegressor", "RandomForestRegressor"]
    else:
        if complexity.get("dataset_size") == "small":
            pipeline["recommended_models"] = ["SVC", "LogisticRegression"]
        elif complexity.get("dataset_size") == "medium":
            pipeline["recommended_models"] = ["RandomForestClassifier", "GradientBoostingClassifier"]
        else:
            pipeline["recommended_models"] = ["XGBClassifier", "RandomForestClassifier"]

    if complexity.get("dimensionality") == "high":
        pipeline["feature_selection"] = True
    else:
        pipeline["feature_selection"] = False

    return pipeline

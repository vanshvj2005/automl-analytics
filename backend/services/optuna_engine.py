import optuna
from sklearn.base import clone
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor

# Keep optuna quiet during pipeline runs
optuna.logging.set_verbosity(optuna.logging.WARNING)


def _get_safe_cv(y, problem_type="classification"):
    n_samples = len(y)
    if n_samples < 4:
        return 2
    if problem_type == "classification":
        try:
            min_class = y.value_counts().min()
            return max(2, min(5, int(min_class)))
        except Exception:
            return max(2, min(5, n_samples // 2))
    return max(2, min(5, n_samples // 2))


def tune_random_forest(X, y, problem_type="classification", preprocessor=None, cv_splitter=None):
    cv = cv_splitter if cv_splitter is not None else _get_safe_cv(y, problem_type)
    scoring = "r2" if problem_type == "regression" else "accuracy"

    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 30, 150),
            "max_depth": trial.suggest_int("max_depth", 3, 15),
            "min_samples_split": trial.suggest_int("min_samples_split", 2, 8),
            "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 4),
            "random_state": 42
        }

        if problem_type == "regression":
            model = RandomForestRegressor(**params)
        else:
            model = RandomForestClassifier(**params)

        if preprocessor is not None:
            pipeline = Pipeline([
                ("preprocessor", clone(preprocessor)),
                ("model", model)
            ])
        else:
            pipeline = model

        try:
            score = cross_val_score(
                pipeline,
                X,
                y,
                cv=cv,
                scoring=scoring
            ).mean()
        except Exception:
            score = -999.0

        return score

    sampler = optuna.samplers.TPESampler(seed=42)
    study = optuna.create_study(direction="maximize", sampler=sampler)
    study.optimize(objective, n_trials=10, timeout=15)

    best_params = study.best_params
    best_params["random_state"] = 42

    if problem_type == "regression":
        best_model = RandomForestRegressor(**best_params)
    else:
        best_model = RandomForestClassifier(**best_params)

    return best_model, best_params


def tune_xgboost(X, y, problem_type="classification", preprocessor=None, cv_splitter=None):
    cv = cv_splitter if cv_splitter is not None else _get_safe_cv(y, problem_type)
    scoring = "r2" if problem_type == "regression" else "accuracy"

    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 30, 150),
            "max_depth": trial.suggest_int("max_depth", 3, 8),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2),
            "subsample": trial.suggest_float("subsample", 0.7, 1.0),
            "random_state": 42
        }

        if problem_type == "regression":
            model = XGBRegressor(objective="reg:squarederror", **params)
        else:
            model = XGBClassifier(eval_metric="logloss", **params)

        if preprocessor is not None:
            pipeline = Pipeline([
                ("preprocessor", clone(preprocessor)),
                ("model", model)
            ])
        else:
            pipeline = model

        try:
            score = cross_val_score(
                pipeline,
                X,
                y,
                cv=cv,
                scoring=scoring
            ).mean()
        except Exception:
            score = -999.0

        return score

    sampler = optuna.samplers.TPESampler(seed=42)
    study = optuna.create_study(direction="maximize", sampler=sampler)
    study.optimize(objective, n_trials=10, timeout=15)

    best_params = study.best_params
    best_params["random_state"] = 42

    if problem_type == "regression":
        best_model = XGBRegressor(objective="reg:squarederror", **best_params)
    else:
        best_model = XGBClassifier(eval_metric="logloss", **best_params)

    return best_model, best_params

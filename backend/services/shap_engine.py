import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap


def generate_shap_plots(model, X, save_dir):
    os.makedirs(save_dir, exist_ok=True)

    # For performance on larger datasets, sample up to 100 instances
    if len(X) > 100:
        X_sample = X.sample(100, random_state=42)
    else:
        X_sample = X

    # Create SHAP explainer
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer(X_sample)
    except Exception:
        try:
            explainer = shap.Explainer(model, X_sample)
            shap_values = explainer(X_sample)
        except Exception as e:
            print(f"SHAP explainer failed: {e}")
            return {}

    plots = {}

    # Summary plot
    summary_path = os.path.join(save_dir, "shap_summary.png")
    fig = None
    try:
        fig = plt.figure()
        shap.summary_plot(shap_values, X_sample, show=False)
        plt.tight_layout()
        plt.savefig(summary_path, bbox_inches="tight")
        plots["shap_summary"] = summary_path
    except Exception as e:
        print(f"SHAP summary plot failed: {e}")
    finally:
        plt.close("all")

    # Feature importance (bar)
    bar_path = os.path.join(save_dir, "shap_feature_importance.png")
    fig = None
    try:
        fig = plt.figure()
        shap.plots.bar(shap_values, show=False)
        plt.tight_layout()
        plt.savefig(bar_path, bbox_inches="tight")
        plots["shap_importance"] = bar_path
    except Exception as e:
        print(f"SHAP bar plot failed: {e}")
    finally:
        plt.close("all")

    return plots

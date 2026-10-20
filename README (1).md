# AutoML — Intelligent ML Analytics Engine

<p align="center">
  <strong>Turn raw CSV data into trained machine-learning models, explainable insights, and downloadable reports.</strong>
  <br />
  An end-to-end AutoML platform for data preprocessing, exploratory analysis, model selection, optimization, evaluation, and explainability.
</p>

<p align="center">
  <a href="https://automl-analytics-frontend-hcsogppi3-vanshvj2005s-projects.vercel.app/"><strong>Live Demo</strong></a>
  ·
  <a href="https://github.com/vanshvj2005/automl-analytics"><strong>Source Code</strong></a>
  ·
  <a href="https://automl-analytics-api.onrender.com/"><strong>Backend API</strong></a>
</p>

---

## Overview

**AutoML** is a web-based machine-learning analytics engine that automates much of the workflow between raw tabular data and model evaluation. Upload a CSV dataset and use the platform to preprocess data, explore patterns, train candidate models, tune hyperparameters, compare results, inspect feature importance, and generate a PDF report.

The project combines a Flask REST API with a browser-based dashboard. The frontend is deployed on Vercel, while the backend is deployed on Render.

> **Deployment note:** Render's free web services can spin down after inactivity, so the first request after a quiet period may take longer than usual. The service also has resource limits that can affect larger datasets and compute-heavy models.

## Live Deployment

| Component | Link | Hosting |
|---|---|---|
| Web application | [Open AutoML](https://automl-analytics-frontend-hcsogppi3-vanshvj2005s-projects.vercel.app/) | Vercel |
| Flask backend | [Open backend URL](https://automl-analytics-api.onrender.com/) | Render |
| Source repository | [GitHub repository](https://github.com/vanshvj2005/automl-analytics) | GitHub |

## Screenshots

These screenshots illustrate the dashboard, analytics, results, and reporting workflow.

### 1. Dashboard / Overview
![AutoML dashboard](https://github.com/user-attachments/assets/c56c6789-ee5f-471c-afa9-bbf4f7ee078f)

### 2. Data analysis
![AutoML data analysis](https://github.com/user-attachments/assets/75dcd026-80fc-45a1-97ef-2061c5788dcb)

### 3. Model training and evaluation
![AutoML model evaluation](https://github.com/user-attachments/assets/bc79ff44-c8b0-4b18-980e-6c5e82c72b36)

### 4. Results and reports
![AutoML results and reports](https://github.com/user-attachments/assets/9636e199-bb8b-4437-9f18-366387ad2411)

### Architecture
![AutoML high-level architecture](https://github.com/user-attachments/assets/951991b3-b7b1-437b-a304-9e19fccc31a5)

## Key Features

### Automated data analysis
- **Data preprocessing:** Handle missing values, encode categorical columns, and engineer date/time features where supported.
- **Exploratory data analysis (EDA):** Generate summary statistics, missing-value profiles, correlation heatmaps, and distribution plots.
- **Processed datasets:** Produce a standardized `processed.csv` output for downstream modeling.

### Automated machine learning
- **Problem-type detection:** Identify classification or regression tasks based on the selected target and data.
- **Model comparison:** Train candidate estimators and compare their evaluation metrics.
- **Hyperparameter optimization:** Use Optuna to search for stronger model configurations where supported.
- **Champion model:** Persist the best-performing model as `best_model.pkl` where the pipeline supports artifact persistence.

### Evaluation and explainability
- **Regression metrics:** R², RMSE, MAE, and MSE.
- **Classification evaluation:** Accuracy, confusion matrices, and precision-recall analysis where supported.
- **Feature insights:** Model feature importance and SHAP-based explanations where supported.

### Experiment history and reporting
- Track experiment metadata and model results using unique run identifiers.
- Organize generated artifacts under `runs/<run_id>/` in local or persistent storage.
- Review model comparisons through the dashboard and export PDF reports.

## Technology Stack

| Layer | Technologies |
|---|---|
| Backend/API | Python, Flask, Flask-CORS |
| Machine learning | scikit-learn, XGBoost |
| Hyperparameter optimization | Optuna |
| Explainable AI | SHAP |
| Data processing | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn |
| Model/artifact persistence | Joblib, Pickle |
| Reporting | ReportLab |
| Frontend | HTML, CSS/Tailwind, JavaScript, Fetch API |
| Deployment | Vercel (frontend), Render (backend) |

## High-Level Workflow

1. **Upload:** Submit a CSV dataset through the web interface.
2. **Preprocess:** Prepare columns, handle missing values, and transform features.
3. **Explore:** Review dataset summaries and visual analysis.
4. **Train:** Run candidate models for the selected prediction task.
5. **Optimize:** Tune supported models with Optuna.
6. **Evaluate:** Compare model performance with relevant metrics.
7. **Explain:** Inspect feature importance and supported SHAP explanations.
8. **Export:** Review run artifacts and download reports.

## Run Locally

### Prerequisites
- Python 3.12 recommended for the pinned dependency versions in this repository.
- Node.js and npm if you want to run or build the frontend separately.

### 1. Clone the repository

```bash
git clone https://github.com/vanshvj2005/automl-analytics.git
cd automl-analytics
```

### 2. Create and activate a virtual environment

macOS/Linux:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Start the Flask backend

From the repository root:

```bash
python -m backend.app
```

By default, the local backend is expected at:

```text
http://localhost:5000
```

### 5. Run the frontend

The frontend lives in `frontend/`. Install its dependencies and start the development server:

```bash
cd frontend
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

The frontend reads the backend base URL from `VITE_API_URL`. For local development, the code falls back to `http://localhost:5000` when that variable is not set.

For a deployed frontend, configure the Vercel environment variable:

```text
VITE_API_URL=https://automl-analytics-api.onrender.com
```

After changing a Vercel environment variable, redeploy the frontend so the new value is included in the build.

## Deployment

### Frontend — Vercel
- Import the GitHub repository into Vercel.
- Set **Root Directory** to `frontend`.
- Use the Vite framework preset if detected.
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` with the Render backend URL.

### Backend — Render
- Create a **Python Web Service** from the GitHub repository.
- Keep the **Root Directory** empty because `requirements.txt` is in the repository root.
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn backend.app:app`
- The repository's `.python-version` file specifies Python `3.12.4`.

Ensure Flask-CORS permits requests from the deployed Vercel domain. If API calls fail in production, check the browser console and Render logs, then verify CORS and `VITE_API_URL`.

## Project Structure

```text
automl-analytics/
├── backend/
│   ├── app.py
│   ├── services/
│   ├── experiments/
│   ├── static/
│   └── tests/
├── frontend/
│   └── src/
├── runs/
├── requirements.txt
└── .python-version
```

Some generated folders or files may be created at runtime depending on which pipeline stages are executed.

## Roadmap

- [ ] Improve meta-learning recommendations with richer dataset meta-features.
- [ ] Explore transformer-based recommendation models.
- [ ] Add optional deep-learning workflows and neural architecture search.
- [ ] Strengthen production deployment with Docker and cloud storage for artifacts.
- [ ] Add authentication and multi-user experiment isolation.
- [ ] Expand automated tests and deployment monitoring.

## Notes and Limitations

- Model quality depends on the dataset, target selection, feature quality, and class balance.
- Large CSV files and computationally expensive training or SHAP explanations may exceed free-host resource limits.
- On Render's free tier, the service may sleep after inactivity and take time to wake.
- Local files on ephemeral hosting may not persist across restarts or redeployments. Use persistent storage or external object storage if experiment artifacts must be retained.
- Feature availability can vary by selected model and dataset.

## Contributing

Issues and pull requests are welcome. When reporting a bug, include the steps to reproduce it, the relevant error message, and a small sample dataset when it is safe to share.

## License

Add the license that applies to this project before distributing or accepting contributions. If no license has been selected, the repository's default copyright terms apply.

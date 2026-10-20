// src/hooks/useAutoMl.js

import { useState } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export function useAutoML() {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [runId, setRunId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalStatus, setGlobalStatus] = useState("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [failedStage, setFailedStage] = useState(null);

  const [selectedFile, setSelectedFileState] = useState(null);
  const [fileName, setFileName] = useState("Drag or drop CSV file");
  const [target, setTarget] = useState("");

  const [activeTab, setActiveTab] = useState("eda");
  const [logs, setLogs] = useState(["System ready..."]);

  const [metrics, setMetrics] = useState({
    r2: null,
    accuracy: null,
    rmse: null,
    mae: null,
    problemType: "regression",
  });

  const [edaPlots, setEdaPlots] = useState([]);

  const [evaluationPlots, setEvaluationPlots] = useState({});

  const [leaderboard, setLeaderboard] = useState([]);
  const [pdfLink, setPdfLink] = useState("");

  // --------------------------------------------------------------------------
  // Utility Functions
  // --------------------------------------------------------------------------

  function normalizePath(path) {
    if (!path) return "";

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API}${path.startsWith("/") ? path : "/" + path}`;
  }

  function addLog(message, type = "info") {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const prefix = type === "error" ? "ERROR" : "INFO";
    const formatted = `[${time}] ${prefix}: ${message}`;

    setLogs((prev) => [...prev, formatted]);
  }

  function setSelectedFile(file) {
    setSelectedFileState(file);
    setFileName(file ? file.name : "Drag or drop CSV file");
  }

  function resetResults() {
    setMetrics({
      r2: null,
      accuracy: null,
      rmse: null,
      mae: null,
      problemType: "regression",
    });

    setEdaPlots([]);
    setEvaluationPlots({});
    setLeaderboard([]);
    setPdfLink("");
    setErrorMessage("");
    setFailedStage(null);
  }

  function safeNumber(value) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  // --------------------------------------------------------------------------
  // Rendering Helpers
  // --------------------------------------------------------------------------

  function renderEDA(data) {
    if (!data || !data.eda_overview) return;

    const plots = [];

    if (data.eda_overview.correlation_heatmap) {
      plots.push(
        normalizePath(
          data.eda_overview.correlation_heatmap
        )
      );
    }

    if (
      Array.isArray(data.eda_overview.histograms) &&
      data.eda_overview.histograms.length > 0
    ) {
      data.eda_overview.histograms.forEach((plotPath) => {
        plots.push(normalizePath(plotPath));
      });
    }

    setEdaPlots(plots);
  }

  function renderResults(data) {
    const results = data?.results || {};

    // Metrics (supports both regression and classification)
    setMetrics({
      r2: safeNumber(results.r2_score),
      accuracy: safeNumber(results.accuracy),
      rmse: safeNumber(results.rmse),
      mae: safeNumber(results.mae),
      problemType: results.problem_type || (results.accuracy != null ? "classification" : "regression"),
    });

    // Evaluation plots (supports regression, classification confusion matrix, and SHAP)
    const plots = {};

    if (results.plots) {
      if (results.plots.actual_vs_predicted) {
        plots.actual_vs_predicted = normalizePath(results.plots.actual_vs_predicted);
      }
      if (results.plots.residuals) {
        plots.residuals = normalizePath(results.plots.residuals);
      }
      if (results.plots.error_distribution) {
        plots.error_distribution = normalizePath(results.plots.error_distribution);
      }
      if (results.plots.confusion_matrix) {
        plots.confusion_matrix = normalizePath(results.plots.confusion_matrix);
      }
    }

    // Optional SHAP plots
    if (results.shap_explanations) {
      if (results.shap_explanations.shap_summary) {
        plots.shap_summary = normalizePath(results.shap_explanations.shap_summary);
      }
      if (results.shap_explanations.shap_importance) {
        plots.shap_importance = normalizePath(results.shap_explanations.shap_importance);
      }
    }

    setEvaluationPlots(plots);

    // Leaderboard
    if (
      data &&
      data.model_summary &&
      Array.isArray(data.model_summary.leaderboard)
    ) {
      setLeaderboard(data.model_summary.leaderboard);
    } else {
      setLeaderboard([]);
    }
  }

  // --------------------------------------------------------------------------
  // API Helper
  // --------------------------------------------------------------------------

  async function postJSON(endpoint, payload) {
    let response;
    try {
      response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      throw new Error(
        `Unable to reach backend at ${API}. ${networkErr.message}`,
        { cause: networkErr }
      );
    }

    if (!response.ok) {
      let errorMessage = `Request failed: ${endpoint} (HTTP ${response.status})`;

      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error ||
          errorData.message ||
          errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // ignore
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --------------------------------------------------------------------------
  // Main Pipeline
  // --------------------------------------------------------------------------

  async function runPipeline() {
    if (!selectedFile) {
      alert("Please upload a CSV file first.");
      return;
    }

    if (!target.trim()) {
      alert("Please enter the target column name.");
      return;
    }

    setIsProcessing(true);
    setGlobalStatus("STARTING");
    setLogs([]);
    resetResults();

    try {
      // ----------------------------------------------------------------------
      // 1. Upload
      // ----------------------------------------------------------------------
      setFailedStage("Upload");
      addLog("Starting upload...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      let uploadResponse;
      try {
        uploadResponse = await fetch(`${API}/upload`, {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        throw new Error(
          `Failed to connect to backend at ${API}/upload. Check that the backend server is running and CORS/network settings allow this request.`,
          { cause: err }
        );
      }

      if (!uploadResponse.ok) {
        let errorMessage = `Upload failed with status ${uploadResponse.status}`;
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          try {
            const rawText = await uploadResponse.text();
            if (rawText) errorMessage = rawText;
          } catch {
            // ignore
          }
        }
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      const currentRunId = uploadData.run_id;

      setRunId(currentRunId);
      addLog(`Upload successful. Run ID: ${currentRunId.substring(0, 8)}...`);

      // ----------------------------------------------------------------------
      // 2. Preprocess
      // ----------------------------------------------------------------------
      setFailedStage("Preprocessing");
      setGlobalStatus("PREPROCESSING");
      addLog("Preprocessing dataset...");

      await postJSON("/preprocess", {
        run_id: currentRunId,
        target: target.trim(),
      });

      addLog("Preprocessing complete.");

      // ----------------------------------------------------------------------
      // 3. EDA
      // ----------------------------------------------------------------------
      setFailedStage("Exploratory Data Analysis");
      setGlobalStatus("EDA");
      addLog("Generating exploratory visualizations...");

      const edaData = await postJSON("/eda", {
        run_id: currentRunId,
      });

      renderEDA(edaData);
      addLog("EDA generation complete.");

      // ----------------------------------------------------------------------
      // 4. Training
      // ----------------------------------------------------------------------
      setFailedStage("Model Training");
      setGlobalStatus("TRAINING");
      addLog("Initializing model training...");

      await postJSON("/train", {
        run_id: currentRunId,
        target: target.trim(),
      });

      let trainingComplete = false;
      let pollCount = 0;
      const MAX_POLLS = 120; // 4 minutes max

      while (!trainingComplete && pollCount < MAX_POLLS) {
        pollCount++;
        let statusResponse;
        try {
          statusResponse = await fetch(`${API}/status/${currentRunId}`);
        } catch (pollErr) {
          throw new Error(
            `Status check lost connection: ${pollErr.message}`,
            { cause: pollErr }
          );
        }

        if (!statusResponse.ok) {
          throw new Error(`Unable to fetch training status (HTTP ${statusResponse.status}).`);
        }

        const statusData = await statusResponse.json();
        let statusText =
          statusData.status ||
          statusData.Status ||
          statusData.stage ||
          "processing";

        if (typeof statusText === "string" && statusText.includes("{")) {
          try {
            const parsed = JSON.parse(statusText);
            statusText = parsed.Status || parsed.status || "processing";
          } catch {
            // Ignore
          }
        }

        const statusString = String(statusText);
        const statusLower = statusString.toLowerCase();

        setGlobalStatus(statusString.toUpperCase());

        if (statusLower.includes("failed")) {
          throw new Error(statusString);
        }

        if (
          statusLower.includes("training_complete") ||
          statusLower.includes("training complete")
        ) {
          trainingComplete = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!trainingComplete) {
        throw new Error("Model training timed out.");
      }

      addLog("Model training complete.");

      // ----------------------------------------------------------------------
      // 5. Evaluation
      // ----------------------------------------------------------------------
      setFailedStage("Model Evaluation");
      setGlobalStatus("EVALUATING");
      addLog("Evaluating best model...");

      const evalData = await postJSON("/evaluate", {
        run_id: currentRunId,
        target: target.trim(),
      });

      renderResults(evalData);
      addLog("Evaluation complete.");

      // ----------------------------------------------------------------------
      // 6. Report Generation
      // ----------------------------------------------------------------------
      setFailedStage("Report Generation");
      setGlobalStatus("REPORTING");
      addLog("Generating PDF report...");

      try {
        const reportData = await postJSON("/report", {
          run_id: currentRunId,
        });

        if (reportData.report_path) {
          setPdfLink(normalizePath(reportData.report_path));
          addLog("Report ready.");
        }
      } catch (repErr) {
        // Non-fatal: if report generation fails, don't kill whole completed pipeline
        addLog(`PDF report generation warning: ${repErr.message}`, "error");
      }

      // ----------------------------------------------------------------------
      // Done
      // ----------------------------------------------------------------------
      setFailedStage(null);
      setGlobalStatus("COMPLETED");
      setActiveTab("metrics");
    } catch (error) {
      console.error("Pipeline failure:", error);
      setGlobalStatus("FAILED");
      const errText = error?.message || "Pipeline failed.";
      setErrorMessage(errText);
      addLog(errText, "error");
    } finally {
      setIsProcessing(false);
    }
  }

  // --------------------------------------------------------------------------
  // Return Hook API
  // --------------------------------------------------------------------------

  return {
    runId,
    isProcessing,
    globalStatus,
    errorMessage,
    failedStage,

    selectedFile,
    fileName,
    target,

    activeTab,
    logs,

    metrics,
    edaPlots,
    evaluationPlots,
    leaderboard,
    pdfLink,

    setSelectedFile,
    setTarget,
    setActiveTab,
    setGlobalStatus,
    setErrorMessage,
    addLog,
    runPipeline,
    resetResults,
  };
}

export default useAutoML;

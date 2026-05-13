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

  const [selectedFile, setSelectedFileState] = useState(null);
  const [fileName, setFileName] = useState("Drag or drop CSV file");
  const [target, setTarget] = useState("");

  const [activeTab, setActiveTab] = useState("eda");
  const [logs, setLogs] = useState(["System ready..."]);

  const [metrics, setMetrics] = useState({
    r2: null,
    rmse: null,
    mae: null,
  });

  const [edaPlots, setEdaPlots] = useState([]);

  const [evaluationPlots, setEvaluationPlots] = useState({
    actual_vs_predicted: "",
    residuals: "",
    error_distribution: "",
  });

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
      rmse: null,
      mae: null,
    });

    setEdaPlots([]);

    setEvaluationPlots({
      actual_vs_predicted: "",
      residuals: "",
      error_distribution: "",
    });

    setLeaderboard([]);
    setPdfLink("");
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

    // Metrics
    setMetrics({
      r2:
        safeNumber(results.r2_score) ??
        safeNumber(results.accuracy),
      rmse: safeNumber(results.rmse),
      mae: safeNumber(results.mae),
    });

    // Evaluation plots
    if (results.plots) {
      setEvaluationPlots({
        actual_vs_predicted: normalizePath(
          results.plots.actual_vs_predicted
        ),
        residuals: normalizePath(
          results.plots.residuals
        ),
        error_distribution: normalizePath(
          results.plots.error_distribution
        ),
      });
    }

    // Leaderboard
    if (
      data &&
      data.model_summary &&
      data.model_summary.leaderboard
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
    const response = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${endpoint}`;

      try {
        const errorData = await response.json();

        errorMessage =
          errorData.error ||
          errorData.message ||
          errorMessage;
      } catch {
        // Ignore JSON parse errors
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
addLog("Starting upload...");

const formData = new FormData();
formData.append("file", selectedFile); // Flask expects request.files["file"]

const uploadResponse = await fetch(`${API}/upload`, {
  method: "POST",
  body: formData,
});

if (!uploadResponse.ok) {
  let errorMessage = "Upload failed.";

  try {
    const errorData = await uploadResponse.json();
    errorMessage =
      errorData.error ||
      errorData.message ||
      errorMessage;
  } catch {
    try {
      errorMessage = await uploadResponse.text();
    } catch {
      // ignore
    }
  }

  throw new Error(errorMessage);
}

const uploadData = await uploadResponse.json();
const currentRunId = uploadData.run_id;

setRunId(currentRunId);

addLog(
  `Upload successful. Run ID: ${currentRunId.substring(0, 8)}...`
);

      setRunId(currentRunId);

      addLog(
        `Upload successful. Run ID: ${currentRunId.substring(
          0,
          8
        )}...`
      );

      // ----------------------------------------------------------------------
      // 2. Preprocess
      // ----------------------------------------------------------------------
      setGlobalStatus("PREPROCESSING");
      addLog("Preprocessing dataset...");

      await postJSON("/preprocess", {
        run_id: currentRunId,
        target,
      });

      addLog("Preprocessing complete.");

      // ----------------------------------------------------------------------
      // 3. EDA
      // ----------------------------------------------------------------------
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
      setGlobalStatus("TRAINING");
      addLog("Initializing model training...");

      await postJSON("/train", {
        run_id: currentRunId,
        target,
      });

      let trainingComplete = false;

      while (!trainingComplete) {
        const statusResponse = await fetch(
          `${API}/status/${currentRunId}`
        );

        if (!statusResponse.ok) {
          throw new Error(
            "Unable to fetch training status."
          );
        }

        const statusData =
          await statusResponse.json();

        let statusText =
          statusData.status ||
          statusData.Status ||
          statusData.stage ||
          "processing";

        // Handle nested JSON strings
        if (
          typeof statusText === "string" &&
          statusText.includes("{")
        ) {
          try {
            const parsed = JSON.parse(statusText);

            statusText =
              parsed.Status ||
              parsed.status ||
              "processing";
          } catch {
            // Ignore parsing errors
          }
        }

        const statusString = String(statusText);
        const statusLower =
          statusString.toLowerCase();

        setGlobalStatus(
          statusString.toUpperCase()
        );

        if (statusLower.includes("failed")) {
          throw new Error(statusString);
        }

        if (
          statusLower.includes(
            "training_complete"
          ) ||
          statusLower.includes(
            "training complete"
          )
        ) {
          trainingComplete = true;
          break;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      }

      addLog("Model training complete.");

      // ----------------------------------------------------------------------
      // 5. Evaluation
      // ----------------------------------------------------------------------
      setGlobalStatus("EVALUATING");
      addLog("Evaluating best model...");

      const evalData = await postJSON(
        "/evaluate",
        {
          run_id: currentRunId,
          target,
        }
      );

      renderResults(evalData);

      addLog("Evaluation complete.");

      // ----------------------------------------------------------------------
      // 6. Report Generation
      // ----------------------------------------------------------------------
      setGlobalStatus("REPORTING");
      addLog("Generating PDF report...");

      const reportData = await postJSON(
        "/report",
        {
          run_id: currentRunId,
        }
      );

      if (reportData.report_path) {
        setPdfLink(
          normalizePath(
            reportData.report_path
          )
        );
      }

      addLog("Report ready.");

      // ----------------------------------------------------------------------
      // Done
      // ----------------------------------------------------------------------
      setGlobalStatus("COMPLETED");
      setActiveTab("metrics");
    } catch (error) {
      console.error(error);

      setGlobalStatus("FAILED");

      addLog(
        error?.message ||
          "Pipeline failed.",
        "error"
      );
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
    addLog,
    runPipeline,
  };
}

export default useAutoML;
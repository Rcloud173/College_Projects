const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const ROOT = path.resolve(__dirname, "../../..");
const ARTIFACTS = path.join(ROOT, "ml", "artifacts");
const INFER_SCRIPT = path.join(ROOT, "ml", "infer.py");

function readJson(name) {
  const file = path.join(ARTIFACTS, name);
  if (!fs.existsSync(file)) {
    const err = new Error(`Artifact missing: ${name}. Run python3 ml/train.py first.`);
    err.status = 503;
    throw err;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function getModelInfo() {
  return readJson("model_info.json");
}

function getAnalytics() {
  return readJson("analytics.json");
}

function getMetadata() {
  const info = getModelInfo();
  return {
    project: "IRA Student Dropout Risk",
    classification_target: "dropout_target",
    regression_target: "academic_performance",
    risk_labels: ["Low Risk", "Medium Risk", "High Risk"],
    features: {
      classification: info.classification.features,
      regression: info.regression.features,
    },
    allowed_values: {
      fees: ["Paid", "Unpaid"],
      gender: ["Male", "Female"],
      numeric_range: { min: 0, max: 100 },
    },
    best_models: {
      classification: info.classification.best_model,
      regression: info.regression.best_model,
    },
  };
}

function predict(payload) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(ARTIFACTS, "dropout_pipeline.joblib"))) {
      const err = new Error("Model pipeline not found. Train the notebook or run python3 ml/train.py.");
      err.status = 503;
      return reject(err);
    }
    const child = spawn(env.pythonBin, [INFER_SCRIPT], { cwd: ROOT });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => {
      err.status = 500;
      reject(err);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        const err = new Error(stderr.trim() || "Inference failed");
        err.status = 500;
        return reject(err);
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        const err = new Error("Invalid inference output");
        err.status = 500;
        reject(err);
      }
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

module.exports = { getModelInfo, getAnalytics, getMetadata, predict };

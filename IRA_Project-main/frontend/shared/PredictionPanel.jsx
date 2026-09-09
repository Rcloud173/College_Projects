import { useState } from "react";
import { predict } from "./api.js";

const EMPTY = {
  attendance: 72,
  current_test_score: 68,
  current_assignment_score: 70,
  previous_test_score: 64,
  previous_assignment_score: 66,
  fees: "Paid",
  gender: "Female",
};

export default function PredictionPanel() {
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        ...form,
        attendance: Number(form.attendance),
        current_test_score: Number(form.current_test_score),
        current_assignment_score: Number(form.current_assignment_score),
        previous_test_score: Number(form.previous_test_score),
        previous_assignment_score: Number(form.previous_assignment_score),
      };
      const data = await predict(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setBusy(false);
    }
  }

  const risk = result?.prediction?.dropout_risk || "";
  const riskClass = risk.toLowerCase().replace(" ", "-");

  return (
    <section className="panel" aria-labelledby="predict-title">
      <h2 id="predict-title">Dropout risk prediction</h2>
      <form className="predict-form" onSubmit={onSubmit}>
        {[
          ["attendance", "Attendance %"],
          ["current_test_score", "Current test"],
          ["current_assignment_score", "Current assignment"],
          ["previous_test_score", "Previous test"],
          ["previous_assignment_score", "Previous assignment"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={form[name]}
              onChange={(e) => update(name, e.target.value)}
              required
            />
          </label>
        ))}
        <label>
          Fees
          <select value={form.fees} onChange={(e) => update("fees", e.target.value)}>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </label>
        <label>
          Gender
          <select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Scoring…" : "Predict risk"}
        </button>
      </form>
      {error ? <p className="state state-error" role="alert">{error}</p> : null}
      {result ? (
        <div className={`result-card risk-${riskClass}`}>
          <p className="result-label">Predicted dropout risk</p>
          <p className="result-risk">{result.prediction.dropout_risk}</p>
          <p className="result-perf">
            Predicted academic performance:{" "}
            <strong>{result.prediction.predicted_academic_performance}</strong>
          </p>
          <ul className="proba-list">
            {Object.entries(result.prediction.probabilities).map(([label, value]) => (
              <li key={label}>
                <span>{label}</span>
                <span>{(value * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

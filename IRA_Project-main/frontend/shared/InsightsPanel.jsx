export default function InsightsPanel({ analytics }) {
  if (!analytics) return null;
  const perf = analytics.mean_performance_by_risk || {};
  const unpaidHigh = analytics.risk_by_fees?.["High Risk"]?.Unpaid || 0;
  return (
    <section className="panel" aria-labelledby="insights-title">
      <h2 id="insights-title">Student / risk insights</h2>
      <ul className="insight-list">
        <li>
          Mean academic performance is{" "}
          <strong>{analytics.mean_academic_performance?.toFixed(1)}</strong> / 100.
        </li>
        <li>
          High-risk students average{" "}
          <strong>{perf["High Risk"]?.toFixed(1) ?? "—"}</strong> vs low-risk{" "}
          <strong>{perf["Low Risk"]?.toFixed(1) ?? "—"}</strong>.
        </li>
        <li>
          Unpaid fees appear often with high risk ({unpaidHigh.toLocaleString()} high-risk unpaid
          records).
        </li>
        <li>
          Gender split is nearly even (Female {analytics.gender_distribution?.Female?.toLocaleString()}{" "}
          / Male {analytics.gender_distribution?.Male?.toLocaleString()}).
        </li>
      </ul>
    </section>
  );
}

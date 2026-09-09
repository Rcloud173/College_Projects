export default function KpiRow({ analytics, modelInfo }) {
  if (!analytics || !modelInfo) return null;
  const dist = analytics.risk_distribution || {};
  const clf = modelInfo.classification?.test_metrics || {};
  const reg = modelInfo.regression?.test_metrics || {};
  const items = [
    { label: "Students (clean)", value: analytics.n_clean?.toLocaleString?.() || "—" },
    { label: "High risk", value: dist["High Risk"]?.toLocaleString?.() || "—" },
    { label: "Classifier F1", value: clf.f1_macro != null ? clf.f1_macro.toFixed(3) : "—" },
    { label: "Performance R²", value: reg.r2 != null ? reg.r2.toFixed(3) : "—" },
  ];
  return (
    <div className="kpi-row">
      {items.map((item) => (
        <article key={item.label} className="kpi-card">
          <p className="kpi-label">{item.label}</p>
          <p className="kpi-value">{item.value}</p>
        </article>
      ))}
    </div>
  );
}

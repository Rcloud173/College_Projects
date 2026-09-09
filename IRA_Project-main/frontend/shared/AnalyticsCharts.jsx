import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RISK_COLORS = {
  "Low Risk": "#2ecc71",
  "Medium Risk": "#f1c40f",
  "High Risk": "#e74c3c",
};

export default function AnalyticsCharts({ analytics }) {
  if (!analytics) return null;
  const dist = Object.entries(analytics.risk_distribution || {}).map(([name, value]) => ({
    name,
    students: value,
  }));
  const byFees = ["Paid", "Unpaid"].map((fees) => ({
    fees,
    "Low Risk": analytics.risk_by_fees?.["Low Risk"]?.[fees] || 0,
    "Medium Risk": analytics.risk_by_fees?.["Medium Risk"]?.[fees] || 0,
    "High Risk": analytics.risk_by_fees?.["High Risk"]?.[fees] || 0,
  }));
  const byAttend = Object.entries(analytics.risk_by_attendance_band || {}).map(
    ([band, counts]) => ({
      band,
      "Low Risk": counts["Low Risk"] || 0,
      "Medium Risk": counts["Medium Risk"] || 0,
      "High Risk": counts["High Risk"] || 0,
    })
  );

  return (
    <section className="panel" aria-labelledby="analytics-title">
      <h2 id="analytics-title">Risk analytics</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Risk mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Risk by fee status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byFees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fees" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Low Risk" fill={RISK_COLORS["Low Risk"]} />
              <Bar dataKey="Medium Risk" fill={RISK_COLORS["Medium Risk"]} />
              <Bar dataKey="High Risk" fill={RISK_COLORS["High Risk"]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card chart-wide">
          <h3>Risk by attendance band</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byAttend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="band" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Low Risk" stackId="a" fill={RISK_COLORS["Low Risk"]} />
              <Bar dataKey="Medium Risk" stackId="a" fill={RISK_COLORS["Medium Risk"]} />
              <Bar dataKey="High Risk" stackId="a" fill={RISK_COLORS["High Risk"]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

import { getAnalytics, getHealth, getModelInfo } from "@shared/api.js";
import { StatusBlock, useApi } from "@shared/hooks.jsx";
import KpiRow from "@shared/KpiRow.jsx";
import PredictionPanel from "@shared/PredictionPanel.jsx";
import MetricsPanel from "@shared/MetricsPanel.jsx";
import AnalyticsCharts from "@shared/AnalyticsCharts.jsx";
import InsightsPanel from "@shared/InsightsPanel.jsx";

export default function App() {
  const health = useApi(getHealth);
  const analytics = useApi(getAnalytics);
  const modelInfo = useApi(getModelInfo);

  return (
    <div className="lab">
      <header className="mast">
        <strong>AMIR</strong>
        <h1>Insights lab</h1>
        <p>Compact analytics for the same IRA model stack.</p>
        <small>{health.error ? health.error : "Live API"}</small>
      </header>
      <StatusBlock loading={analytics.loading || modelInfo.loading} error={analytics.error || modelInfo.error}>
        <KpiRow analytics={analytics.data} modelInfo={modelInfo.data} />
        <div className="stack">
          <AnalyticsCharts analytics={analytics.data} />
          <InsightsPanel analytics={analytics.data} />
          <PredictionPanel />
          <MetricsPanel modelInfo={modelInfo.data} />
        </div>
      </StatusBlock>
    </div>
  );
}

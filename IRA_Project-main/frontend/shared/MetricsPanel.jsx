export default function MetricsPanel({ modelInfo }) {
  if (!modelInfo) return null;
  const clf = modelInfo.classification || {};
  const reg = modelInfo.regression || {};
  return (
    <section className="panel" aria-labelledby="metrics-title">
      <h2 id="metrics-title">Model metrics</h2>
      <div className="metrics-grid">
        <div>
          <h3>Dropout classification</h3>
          <p>Best model: <strong>{clf.best_model}</strong> ({clf.selection_metric})</p>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>F1-macro</th>
              </tr>
            </thead>
            <tbody>
              {(clf.candidates || []).map((row) => (
                <tr key={row.model}>
                  <td>{row.model}</td>
                  <td>{row.accuracy.toFixed(3)}</td>
                  <td>{row.f1_macro.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Academic performance regression</h3>
          <p>Best model: <strong>{reg.best_model}</strong> ({reg.selection_metric})</p>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>R²</th>
                <th>MAE</th>
                <th>RMSE</th>
              </tr>
            </thead>
            <tbody>
              {(reg.candidates || []).map((row) => (
                <tr key={row.model}>
                  <td>{row.model}</td>
                  <td>{row.r2.toFixed(3)}</td>
                  <td>{row.mae.toFixed(2)}</td>
                  <td>{row.rmse.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

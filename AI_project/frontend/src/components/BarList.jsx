function BarList({ items, labelKey, valueKey }) {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item[labelKey]}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate pr-2">{item[labelKey]}</span>
            <span className="shrink-0 text-muted">{item[valueKey]}</span>
          </div>
          <div className="h-1.5 overflow-hidden bg-paper">
            <div
              className="h-full bg-accent"
              style={{ width: `${Math.round(((item[valueKey] || 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
    </div>
  );
}

export default BarList;

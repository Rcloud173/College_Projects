import { useEffect, useState } from "react";

export function useApi(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loader()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

export function StatusBlock({ loading, error, empty, children }) {
  if (loading) return <p className="state state-loading" role="status">Loading…</p>;
  if (error) return <p className="state state-error" role="alert">{error}</p>;
  if (empty) return <p className="state state-empty">No data yet.</p>;
  return children;
}

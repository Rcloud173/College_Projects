const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8040";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export function getHealth() {
  return request("/health");
}
export function getMetadata() {
  return request("/metadata");
}
export function getModelInfo() {
  return request("/model-info");
}
export function getAnalytics() {
  return request("/analytics");
}
export function predict(payload) {
  return request("/predict", { method: "POST", body: JSON.stringify(payload) });
}

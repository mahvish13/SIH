const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  predictRisk: (payload) => request("/risk/predict", { method: "POST", body: JSON.stringify(payload) }),
  getActivity: () => request("/risk/activity"),
  getReports: () => request("/reports"),
  submitReport: (payload) => request("/reports", { method: "POST", body: JSON.stringify(payload) }),
  getWeather: (region) => request(`/weather/${encodeURIComponent(region)}`),
  getSatelliteData: (region) => request(`/satellite/${encodeURIComponent(region)}`),
  getZones: () => request("/zones"),
  getRoads: () => request("/zones/roads"),
  getStatesLive: () => request("/states-live"),
  getStateDetail: (region) => request(`/states-live/${encodeURIComponent(region)}`),
  getStateCharts: (region) => request(`/states-live/${encodeURIComponent(region)}/charts`),
  getHistory: () => request("/history"),
  getDistrictRisk: ({ lat, lng, name, state }) =>
    request(`/district-risk?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&state=${encodeURIComponent(state || "")}`),
  getNews: () => request("/news"),
  getNewsHistory: () => request("/news/history"),
  getSafePlaces: ({ lat, lng, radius }) => request(`/safe-places?lat=${lat}&lng=${lng}&radius=${radius || 20000}`),
  getReverseGeocode: ({ lat, lng }) => request(`/reverse-geocode?lat=${lat}&lng=${lng}`),
  getDiagnostics: () => request("/diagnostics")
};

const SEVERITY_CLASS = { High: "risk-badge-high", Medium: "risk-badge-medium", Low: "risk-badge-low" };

const NER_REGIONS = [
  "Meghalaya",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim"
];

export default function WeatherForecast({ region, hours, onRegionChange, loading, source, live }) {
  return (
    <section className="card">
      <h2>🌦️ Weather &amp; Risk Forecast</h2>

      <div className="region-picker region-picker-sm">
        {NER_REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`region-chip ${region === r ? "region-chip-active" : ""}`}
            onClick={() => onRegionChange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <p className="muted">{region} · Next 24 hours</p>
      <p className="data-disclaimer muted">
        {live ? (
          <>🛰️ Live rainfall forecast from {source || "Open-Meteo"} — the risk % per hour is still our own model, not part of the feed.</>
        ) : (
          <>⚠️ Live forecast unreachable right now — showing a simulated fallback, not a real weather feed.</>
        )}
      </p>

      {loading && <p className="muted">Loading…</p>}

      <ul className="forecast-list">
        {hours.map((h) => (
          <li key={h.time}>
            <span className="forecast-time">{h.time}</span>
            <span className="forecast-rain">🌧️ {h.rainfall} mm</span>
            <span className={`risk-badge ${SEVERITY_CLASS[h.severity]}`}>{h.risk}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

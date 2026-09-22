import { useState } from "react";
import WeatherCharts from "./WeatherCharts.jsx";

const CONDITION_ICON = {
  "Clear sky": "☀️", "Mainly clear": "🌤️", "Partly cloudy": "⛅", "Overcast": "☁️",
  Fog: "🌫️", "Depositing rime fog": "🌫️",
  "Light drizzle": "🌦️", "Moderate drizzle": "🌦️", "Dense drizzle": "🌧️",
  "Slight rain": "🌧️", "Moderate rain": "🌧️", "Heavy rain": "🌧️",
  "Slight rain showers": "🌦️", "Moderate rain showers": "🌧️", "Violent rain showers": "⛈️",
  Thunderstorm: "⛈️", "Thunderstorm with hail": "⛈️", "Thunderstorm with heavy hail": "⛈️"
};

const ALERT_CLASS = { LOW: "alert-low", MEDIUM: "alert-medium", HIGH: "alert-high", CRITICAL: "alert-critical" };

// Presentational only — data/polling now lives in App.jsx so the Dashboard
// and Insights page share the exact same live-state data instead of each
// fetching it independently.
export default function StatesLiveGrid({ states, loading, error, lastFetched, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const handleRefresh = async () => {
    setJustUpdated(false);
    await onRefresh();
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  };

  return (
    <section className="card">
      <div className="live-header">
        <h2>🌏 State-wise Live Monitoring — Current Risk (real-time)</h2>
        <div className="live-status">
          <span className="live-dot" /> LIVE
          {lastFetched && <span className="muted"> · Last updated {lastFetched.toLocaleTimeString()}</span>}
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner" /> Refreshing data…
              </>
            ) : (
              "↻ Refresh"
            )}
          </button>
          {justUpdated && !loading && <span className="refresh-confirm">✓ Data updated</span>}
        </div>
      </div>
      <p className="muted">
        Real data, fetched automatically for all 8 North Eastern states — no manual entry. This is{" "}
        <strong>current, real-time risk</strong> based on today's actual rainfall/soil/slope readings — not the
        same as the long-term geographic susceptibility shown on the Risk Map page. Click a state for details and
        charts.
      </p>
      {error && <div className="form-error">{error}</div>}
      {loading && states.length === 0 && <p className="muted">Loading real data for all 8 states…</p>}

      <div className="state-grid">
        {states.map((s) => (
          <button key={s.region} className="state-card" onClick={() => setExpanded(expanded === s.region ? null : s.region)}>
            <div className="state-card-head">
              <strong>{s.region}</strong>
              {s.alertLevel && <span className={`alert-badge ${ALERT_CLASS[s.alertLevel]}`}>{s.alertLevel}</span>}
            </div>
            {s.dataInsufficient ? (
              <>
                <p className="muted state-insufficient">⚠️ Data Insufficient</p>
                {s.warnings?.length > 0 && (
                  <p className="muted state-warnings-inline">{s.warnings[0]}</p>
                )}
              </>
            ) : (
              <>
                <div className="state-condition">
                  {CONDITION_ICON[s.current?.condition] || "🌡️"} {s.current?.condition}
                </div>
                <div className="state-metrics">
                  <span>🌡️ {s.current?.temperature}°C</span>
                  <span>💧 {s.current?.humidity}%</span>
                  <span>💨 {s.current?.windSpeed} km/h</span>
                  <span>🌧️ {s.current?.rainfall} mm</span>
                </div>
                <div className="state-risk">
                  Current Risk: <strong>{s.risk}%</strong> ({s.severity})
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {expanded && (
        <StateDetail region={expanded} snapshot={states.find((s) => s.region === expanded)} />
      )}
    </section>
  );
}

function StateDetail({ region, snapshot }) {
  return (
    <div className="state-detail">
      <h3>📍 {region} — Full Detail</h3>
      {snapshot?.dataInsufficient ? (
        <p className="muted">
          ⚠️ Data Insufficient — one or more real data sources didn't respond for this state right now.
          {snapshot.warnings?.length > 0 && (
            <span className="state-warnings"> ({snapshot.warnings.join("; ")})</span>
          )}
        </p>
      ) : (
        <>
          <div className="state-detail-grid">
            <DetailStat label="Temperature" value={`${snapshot.current?.temperature}°C`} />
            <DetailStat label="Humidity" value={`${snapshot.current?.humidity}%`} />
            <DetailStat label="Wind Speed" value={`${snapshot.current?.windSpeed} km/h`} />
            <DetailStat label="Rainfall" value={`${snapshot.current?.rainfall} mm`} />
            <DetailStat label="Current Risk" value={`${snapshot.risk}% (${snapshot.severity})`} />
            <DetailStat label="Last Updated" value={new Date(snapshot.lastUpdated).toLocaleTimeString()} />
          </div>
          {snapshot.recommendations && (
            <ul className="recommendation-list">
              {snapshot.recommendations.map((r) => (
                <li key={r}>🚧 {r}</li>
              ))}
            </ul>
          )}
        </>
      )}
      <WeatherCharts region={region} />
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="detail-stat">
      <div className="detail-stat-label">{label}</div>
      <div className="detail-stat-value">{value}</div>
    </div>
  );
}

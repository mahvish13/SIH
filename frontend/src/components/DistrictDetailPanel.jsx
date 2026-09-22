import { useState } from "react";
import { api } from "../api.js";

export default function DistrictDetailPanel({ selection, onClose }) {
  const [liveRisk, setLiveRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!selection) return null;
  const { distName, stateName, match, events, layer } = selection;

  const fetchLiveRisk = async () => {
    setLoading(true);
    setError("");
    try {
      const center = layer.getBounds().getCenter();
      const result = await api.getDistrictRisk({
        lat: center.lat,
        lng: center.lng,
        name: distName,
        state: stateName
      });
      setLiveRisk(result);
    } catch (err) {
      console.error("Failed to fetch district risk:", err);
      setError("Couldn't fetch real-time risk for this district right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="district-panel">
      <div className="district-panel-head">
        <div>
          <p className="breadcrumb muted">NER &gt; {stateName} &gt; {distName}</p>
          <h3>
            {distName}, {stateName}
          </h3>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="district-panel-section">
        <h4>Long-Term Susceptibility</h4>
        {match ? (
          <p>
            <span className={`alert-badge alert-${match.severity.toLowerCase()}`}>{match.severity}</span> — based on
            our own classification for the "{match.name}" zone in this district (reference rainfall {match.rainfall}
            mm, soil moisture {match.soilMoisture}%, slope {match.slope}°).
          </p>
        ) : (
          <p className="muted">⚠️ Data Unavailable — no susceptibility classification connected for this district yet.</p>
        )}
      </div>

      <div className="district-panel-section">
        <h4>Recent Landslides (verified real events)</h4>
        {events.length > 0 ? (
          <ul className="district-events-list">
            {events.map((e) => (
              <li key={e.id}>
                <strong>{e.title}</strong> — {new Date(e.date).toLocaleDateString()} — 💀 {e.deaths} deaths
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No verified recent landslide events recorded for this district in our data.</p>
        )}
      </div>

      <div className="district-panel-section">
        <h4>Current Risk (real-time)</h4>
        <p className="muted">
          Not pre-computed for every district (that would mean ~100 simultaneous free-API calls) — fetched live,
          on demand, only for the district you're actually looking at.
        </p>
        <button className="btn btn-live btn-sm" onClick={fetchLiveRisk} disabled={loading}>
          🌦️ {loading ? "Fetching…" : "Fetch Real Current Risk for This District"}
        </button>
        {error && <div className="form-error">{error}</div>}
        {liveRisk && (
          <div className="district-live-result">
            {liveRisk.dataInsufficient ? (
              <p className="muted">⚠️ Data Insufficient right now for this exact point.</p>
            ) : (
              <>
                <p>
                  <strong>{liveRisk.risk}% risk</strong> ({liveRisk.severity}) — 🌧️ {liveRisk.inputs.rainfall}mm · 💧{" "}
                  {liveRisk.inputs.soilMoisture}% · 🏔️ {liveRisk.inputs.slope}°
                </p>
                <p className="muted">Last updated {new Date(liveRisk.lastUpdated).toLocaleTimeString()}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

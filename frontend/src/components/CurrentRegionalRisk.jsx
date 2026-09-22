import { useState } from "react";
import { Link } from "react-router-dom";
import Risk3DBars from "./Risk3DBars.jsx";

export default function CurrentRegionalRisk({ liveStates, lastFetched }) {
  const [expandedLevel, setExpandedLevel] = useState(null);

  const valid = liveStates.filter((s) => !s.dataInsufficient);
  const byLevel = {
    CRITICAL: valid.filter((s) => s.alertLevel === "CRITICAL"),
    HIGH: valid.filter((s) => s.alertLevel === "HIGH"),
    MEDIUM: valid.filter((s) => s.alertLevel === "MEDIUM"),
    LOW: valid.filter((s) => s.alertLevel === "LOW")
  };
  const elevated = [...byLevel.CRITICAL, ...byLevel.HIGH];

  return (
    <section className="card regional-risk-card">
      <div className="live-header">
        <h2>📊 Current Regional Risk</h2>
        {lastFetched && <span className="muted">🕐 Last updated {lastFetched.toLocaleTimeString()}</span>}
      </div>
      <p className="muted">
        Live counts for all 8 North East states, computed from today's real rainfall/soil/slope/weather readings.
        Source: Open-Meteo (see Data Sources page). Click a count to see which states, or click a
        state to open it on the Map.
      </p>

      {liveStates.length === 0 ? (
        <p className="muted">Loading real-time data…</p>
      ) : (
        <div className="regional-risk-grid">
          <div className="regional-risk-counts">
            <RiskCountRow
              level="CRITICAL"
              icon="🔴"
              label="Critical"
              count={byLevel.CRITICAL.length}
              active={expandedLevel === "CRITICAL"}
              onClick={() => setExpandedLevel(expandedLevel === "CRITICAL" ? null : "CRITICAL")}
            />
            <RiskCountRow
              level="HIGH"
              icon="🟠"
              label="High"
              count={byLevel.HIGH.length}
              active={expandedLevel === "HIGH"}
              onClick={() => setExpandedLevel(expandedLevel === "HIGH" ? null : "HIGH")}
            />
            <RiskCountRow
              level="MEDIUM"
              icon="🟡"
              label="Moderate"
              count={byLevel.MEDIUM.length}
              active={expandedLevel === "MEDIUM"}
              onClick={() => setExpandedLevel(expandedLevel === "MEDIUM" ? null : "MEDIUM")}
            />
            <RiskCountRow
              level="LOW"
              icon="🟢"
              label="Low"
              count={byLevel.LOW.length}
              active={expandedLevel === "LOW"}
              onClick={() => setExpandedLevel(expandedLevel === "LOW" ? null : "LOW")}
            />

            {expandedLevel && (
              <div className="risk-drilldown">
                {byLevel[expandedLevel].length === 0 ? (
                  <p className="muted">No states currently at {expandedLevel}.</p>
                ) : (
                  <ul>
                    {byLevel[expandedLevel].map((s) => (
                      <li key={s.region}>
                        <Link to={`/map?state=${encodeURIComponent(s.region)}`}>
                          {s.region} — {s.risk}% risk →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="regional-risk-graph">
            <Risk3DBars liveStates={liveStates} />
          </div>
        </div>
      )}

      <div className="risk-description-box">
        <h4>Risk Description</h4>
        {elevated.length === 0 ? (
          <p className="muted">No states are currently at High or Critical risk based on today's live readings.</p>
        ) : (
          <ul className="risk-description-list">
            {elevated.map((s) => (
              <li key={s.region}>
                <Link to={`/map?state=${encodeURIComponent(s.region)}`}>{s.region}</Link> — {s.alertLevel} risk (
                {s.risk}%), driven by {s.current?.rainfall}mm rainfall in today's reading
                {s.current?.condition ? `, ${s.current.condition.toLowerCase()}` : ""}.
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RiskCountRow({ icon, label, count, active, onClick }) {
  return (
    <button className={`risk-count-row ${active ? "risk-count-row-active" : ""}`} onClick={onClick}>
      <span className="risk-count-icon">{icon}</span>
      <span className="risk-count-label">{label}</span>
      <span className="risk-count-value">{count}</span>
    </button>
  );
}

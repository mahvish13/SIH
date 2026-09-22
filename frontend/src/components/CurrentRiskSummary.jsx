import { useState } from "react";
import { Link } from "react-router-dom";

export default function CurrentRiskSummary({ liveStates, lastFetched }) {
  const [expandedLevel, setExpandedLevel] = useState(null);

  const valid = liveStates.filter((s) => !s.dataInsufficient);
  const byLevel = {
    CRITICAL: valid.filter((s) => s.alertLevel === "CRITICAL"),
    HIGH: valid.filter((s) => s.alertLevel === "HIGH"),
    MEDIUM: valid.filter((s) => s.alertLevel === "MEDIUM"),
    LOW: valid.filter((s) => s.alertLevel === "LOW")
  };

  return (
    <section className="card">
      <h2>📡 Current Risk — Real-Time</h2>
      <p className="muted">
        Live, computed from today's actual rainfall/soil/slope/weather readings for all 8 states.
        {lastFetched && ` Last updated ${lastFetched.toLocaleTimeString()}.`} Click a count to see which states —
        clicking a state jumps to and highlights it on the Map. This is not the same as the static Long-Term
        Susceptibility panel below.
      </p>
      {liveStates.length === 0 ? (
        <p className="muted">Loading real-time data…</p>
      ) : (
        <>
          <div className="severity-grid">
            <SeverityStat
              value={byLevel.CRITICAL.length}
              label="Critical Now"
              color="#b91c1c"
              onClick={() => setExpandedLevel(expandedLevel === "CRITICAL" ? null : "CRITICAL")}
            />
            <SeverityStat
              value={byLevel.HIGH.length}
              label="High Now"
              color="#ea580c"
              onClick={() => setExpandedLevel(expandedLevel === "HIGH" ? null : "HIGH")}
            />
            <SeverityStat
              value={byLevel.MEDIUM.length}
              label="Medium Now"
              color="#d97706"
              onClick={() => setExpandedLevel(expandedLevel === "MEDIUM" ? null : "MEDIUM")}
            />
            <SeverityStat
              value={byLevel.LOW.length}
              label="Low Now"
              color="#16a34a"
              onClick={() => setExpandedLevel(expandedLevel === "LOW" ? null : "LOW")}
            />
          </div>

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
        </>
      )}
    </section>
  );
}

function SeverityStat({ value, label, color, onClick }) {
  return (
    <button className="severity-stat severity-stat-clickable" style={{ borderLeftColor: color }} onClick={onClick}>
      <div className="severity-value" style={{ color }}>
        {value}
      </div>
      <div className="severity-label">{label}</div>
    </button>
  );
}

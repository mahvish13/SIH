import { Link } from "react-router-dom";

const LEVEL_COLOR = { CRITICAL: "#b91c1c", HIGH: "#ea580c", MEDIUM: "#d97706", LOW: "#16a34a" };
const LEVEL_HEIGHT = { CRITICAL: 100, HIGH: 78, MEDIUM: 56, LOW: 34 };

export default function Terrain3D({ liveStates }) {
  const valid = liveStates.filter((s) => !s.dataInsufficient);

  return (
    <section className="card terrain3d-card">
      <h2>🏔️ NER Risk Terrain — Current Risk (real-time)</h2>
      <p className="muted">
        Each peak is a real state, height and colour driven by its actual current risk reading right now — taller
        and redder means higher real risk, not decoration. Click a peak to open it on the Map.
      </p>

      {liveStates.length === 0 ? (
        <p className="muted">Loading real-time data…</p>
      ) : (
        <div className="terrain3d-scene">
          <div className="terrain3d-ground" />
          {valid.map((s) => (
            <Link
              key={s.region}
              to={`/map?state=${encodeURIComponent(s.region)}`}
              className="terrain3d-peak-wrap"
              title={`${s.region}: ${s.risk}% (${s.alertLevel})`}
            >
              <div
                className={`terrain3d-peak ${s.alertLevel === "CRITICAL" || s.alertLevel === "HIGH" ? "terrain3d-peak-pulse" : ""}`}
                style={{
                  height: `${LEVEL_HEIGHT[s.alertLevel] || 34}px`,
                  background: `linear-gradient(160deg, ${LEVEL_COLOR[s.alertLevel] || "#94a3b8"}, ${LEVEL_COLOR[s.alertLevel] || "#94a3b8"}cc)`
                }}
              />
              <span className="terrain3d-label">{s.region.split(" ")[0]}</span>
              <span className="terrain3d-value">{s.risk}%</span>
            </Link>
          ))}
          {liveStates
            .filter((s) => s.dataInsufficient)
            .map((s) => (
              <div key={s.region} className="terrain3d-peak-wrap terrain3d-unavailable" title={`${s.region}: Data Unavailable`}>
                <div className="terrain3d-peak terrain3d-peak-unavailable" style={{ height: "34px" }} />
                <span className="terrain3d-label">{s.region.split(" ")[0]}</span>
                <span className="terrain3d-value muted">N/A</span>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

import { Link } from "react-router-dom";

export default function RiskOverview({ latest, zones = [], reports = [], region }) {
  const risk = latest?.risk ?? 0;
  const severity = latest?.severity ?? "Low";
  const highCount = zones.filter((z) => z.severity === "High").length;
  const topZone = [...zones].sort((a, b) => rank(b.severity) - rank(a.severity))[0];

  return (
    <>
      <div className={`region-banner ${region ? "region-banner-set" : "region-banner-empty"}`}>
        {region ? (
          <>
            📍 <strong>{region}</strong> <span className="muted">— readings below are for this region</span>
          </>
        ) : (
          <>👆 No region selected yet — pick one in the simulator below to label these readings</>
        )}
      </div>

      <section className="metric-grid">
        <MetricCard icon="🌧️" label="Rainfall" region={region} value={latest?.rainfall ?? "—"} unit="mm" />
        <MetricCard icon="💧" label="Soil Moisture" region={region} value={latest?.soilMoisture ?? "—"} unit="%" />
        <MetricCard icon="🏔️" label="Slope" region={region} value={latest?.slope ?? "—"} unit="°" />
        <MetricCard
          icon="🏚️"
          label="Previous Landslide"
          region={region}
          value={latest?.previousLandslide ? "Yes" : "No"}
        />
        <MetricCard icon="🤖" label="AI Risk" region={region} value={latest ? `${risk}%` : "—"} highlight={severity} />
      </section>
      <p className="data-disclaimer muted">
        ⚠️ Prototype data — these values come from the simulator below, not live satellite or sensor feeds. See the
        README for how to wire in real data sources.
      </p>

      <section className="two-col">
        <Link to="/map" className="card map-snapshot-link">
          <h2>🗺️ NER Risk Snapshot</h2>
          <div className="snapshot-row">
            <SnapshotStat value={zones.length} label="Zones Monitored" />
            <SnapshotStat value={highCount} label="High Risk Now" danger={highCount > 0} />
            <SnapshotStat value={reports.length} label="Field Reports" />
          </div>
          {topZone && (
            <p className="muted snapshot-note">
              Most urgent right now: <strong>{topZone.name}</strong> ({topZone.state}) — {topZone.severity} risk
            </p>
          )}
          <span className="snapshot-cta">Open full Risk Map →</span>
        </Link>

        <div className={`card risk-analysis risk-${severity.toLowerCase()}`}>
          <h2>📊 AI Risk Analysis</h2>
          <div className="risk-analysis-value">
            <span className="risk-percent">{latest ? `${risk}%` : "—"}</span>
            <span className="risk-label">{severity.toUpperCase()} LANDSLIDE RISK</span>
          </div>
          <ul className="recommendation-list">
            {(latest?.recommendations ?? ["Pick a region and send environmental data to see recommendations"]).map(
              (r) => (
                <li key={r}>🚧 {r}</li>
              )
            )}
          </ul>
        </div>
      </section>
    </>
  );
}

function rank(severity) {
  return { High: 2, Medium: 1, Low: 0 }[severity] ?? 0;
}

function SnapshotStat({ value, label, danger }) {
  return (
    <div className="snapshot-stat">
      <div className={`snapshot-value ${danger ? "snapshot-value-danger" : ""}`}>{value}</div>
      <div className="snapshot-label">{label}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, highlight, region }) {
  return (
    <div className={`metric-card ${highlight ? `glow-${highlight.toLowerCase()}` : ""}`}>
      <div className="metric-label">
        {icon} {label}
      </div>
      <div className="metric-value">
        {value} {unit && <span className="metric-unit">{unit}</span>}
      </div>
      <div className="metric-region">{region ? `📍 ${region}` : "No region picked"}</div>
    </div>
  );
}

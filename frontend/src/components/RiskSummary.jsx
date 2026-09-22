export default function RiskSummary({ zones }) {
  const high = zones.filter((z) => z.severity === "High").length;
  const medium = zones.filter((z) => z.severity === "Medium").length;
  const low = zones.filter((z) => z.severity === "Low").length;

  return (
    <section className="card">
      <h2>🗺️ Long-Term Landslide Susceptibility</h2>
      <p className="muted">
        Static geographic classification (our own model, not live) — how prone each zone is to landslides over
        time, independent of today's weather. See Current Risk (real-time) for what's happening right now.
      </p>
      <div className="severity-grid">
        <SeverityStat value={high} label="High Susceptibility" color="#dc2626" />
        <SeverityStat value={medium} label="Medium Susceptibility" color="#f59e0b" />
        <SeverityStat value={low} label="Low Susceptibility" color="#16a34a" />
        <SeverityStat value={zones.length} label="Total Zones" color="#0f4c5c" />
      </div>
    </section>
  );
}

function SeverityStat({ value, label, color }) {
  return (
    <div className="severity-stat" style={{ borderLeftColor: color }}>
      <div className="severity-value" style={{ color }}>
        {value}
      </div>
      <div className="severity-label">{label}</div>
    </div>
  );
}

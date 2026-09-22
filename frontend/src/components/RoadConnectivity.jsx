export default function RoadConnectivity({ roads }) {
  const open = roads.filter((r) => r.status === "Open").length;
  const partial = roads.filter((r) => r.status === "Partial").length;
  const blocked = roads.filter((r) => r.status === "Blocked").length;

  return (
    <section className="card">
      <h2>🛣️ Road Connectivity</h2>
      <p className="muted data-disclaimer">⚠️ Seed/demo data — not a live traffic or roads API in this version.</p>
      <RoadRow label="Total Roads" value={roads.length} color="#0f4c5c" />
      <RoadRow label="Open" value={open} color="#16a34a" />
      <RoadRow label="Partial" value={partial} color="#f59e0b" />
      <RoadRow label="Blocked" value={blocked} color="#dc2626" />

      <ul className="road-list">
        {roads.map((r) => (
          <li key={r.id}>
            <span>{r.name}</span>
            <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RoadRow({ label, value, color }) {
  return (
    <div className="road-row" style={{ borderLeftColor: color }}>
      <span className="road-row-label">{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

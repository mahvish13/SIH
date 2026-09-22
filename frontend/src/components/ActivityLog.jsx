export default function ActivityLog({ entries }) {
  return (
    <section className="card">
      <h2>🛰️ System Activity</h2>
      <div className="activity-list">
        {entries.length === 0 && <p className="muted">No activity yet — send data from the simulator above.</p>}
        {entries.map((e) => (
          <div key={e.id} className="activity-row">
            <span>
              {e.risk >= 70 && "⚠️ "}
              {e.label || "Environmental data sent to backend successfully"}
              {e.region && ` (${e.region})`}
              {typeof e.risk === "number" && ` — ${e.severity} risk (${e.risk}%)`}
            </span>
            <span className="muted">{new Date(e.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

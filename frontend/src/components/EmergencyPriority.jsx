const LEVEL_RANK = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
const LEVEL_CLASS = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };
const ZONE_RANK = { High: 2, Medium: 1, Low: 0 };

export default function EmergencyPriority({ liveStates = [], zones = [] }) {
  const validLive = liveStates.filter((s) => !s.dataInsufficient && s.alertLevel);
  const useLive = validLive.length > 0;

  const liveSorted = [...validLive].sort((a, b) => LEVEL_RANK[b.alertLevel] - LEVEL_RANK[a.alertLevel]);
  const zoneSorted = [...zones].sort((a, b) => ZONE_RANK[b.severity] - ZONE_RANK[a.severity]);

  return (
    <section className="card">
      <h2>🚨 Emergency Priority {useLive ? "— Current Risk (real-time)" : "— Long-Term Susceptibility (fallback)"}</h2>
      <p className="muted">
        {useLive
          ? "Ranked by today's real, live risk level for each state — this is what should get attention right now."
          : "Live data unavailable right now — falling back to the static long-term susceptibility ranking."}
      </p>
      <ul className="priority-list">
        {useLive
          ? liveSorted.map((s) => (
              <li key={s.region} className={`priority-${LEVEL_CLASS[s.alertLevel]}`}>
                <div>
                  <strong>{s.region}</strong>
                  <span className="muted"> {s.risk}% risk</span>
                </div>
                <span className={`priority-badge priority-badge-${LEVEL_CLASS[s.alertLevel]}`}>{s.alertLevel}</span>
              </li>
            ))
          : zoneSorted.map((z) => (
              <li key={z.id} className={`priority-${z.severity.toLowerCase()}`}>
                <div>
                  <strong>{z.name}</strong>
                  <span className="muted"> {z.state}</span>
                </div>
                <span className={`priority-badge priority-badge-${z.severity.toLowerCase()}`}>{z.severity}</span>
              </li>
            ))}
      </ul>
    </section>
  );
}

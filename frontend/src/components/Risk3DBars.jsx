const LEVELS = [
  { key: "CRITICAL", label: "Critical", color: "#b91c1c" },
  { key: "HIGH", label: "High", color: "#ea580c" },
  { key: "MEDIUM", label: "Medium", color: "#d97706" },
  { key: "LOW", label: "Low", color: "#16a34a" }
];

export default function Risk3DBars({ liveStates }) {
  const valid = liveStates.filter((s) => !s.dataInsufficient);
  const counts = LEVELS.map((l) => ({ ...l, count: valid.filter((s) => s.alertLevel === l.key).length }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="risk3d-bars">
      {counts.map((c) => {
        const heightPx = 20 + (c.count / max) * 100;
        return (
          <div key={c.key} className="risk3d-bar-col">
            <div className="risk3d-bar-count">{c.count}</div>
            <div className="risk3d-bar" style={{ height: `${heightPx}px` }}>
              <div className="risk3d-bar-top" style={{ background: c.color }} />
              <div className="risk3d-bar-front" style={{ background: c.color }} />
              <div className="risk3d-bar-side" style={{ background: c.color }} />
            </div>
            <div className="risk3d-bar-label">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}

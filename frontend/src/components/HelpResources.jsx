const CONTACTS = [
  { label: "National Emergency Number", number: "112", note: "Police, fire, ambulance — 24×7, all of India" },
  { label: "NDRF Helpline", number: "011-24363260", note: "National Disaster Response Force — also +91-9711077372" },
  { label: "NDMA Helpline", number: "1078", note: "National Disaster Management Authority — also 011-26701728" },
  { label: "Ambulance", number: "102 / 108", note: "Medical emergency" }
];

export default function HelpResources() {
  return (
    <section className="card help-resources">
      <h2>🆘 Help &amp; Resources Near an Incident</h2>
      <p className="muted">
        If you're near a landslide or affected road, contact these first — verified official numbers, not
        generated. If you submit a field report above, it helps responders see where reports are coming from, but
        it is <strong>not</strong> a substitute for calling emergency services directly.
      </p>
      <div className="help-grid">
        {CONTACTS.map((c) => (
          <div key={c.label} className="help-card">
            <div className="help-number">{c.number}</div>
            <div className="help-label">{c.label}</div>
            <div className="muted help-note">{c.note}</div>
          </div>
        ))}
      </div>
      <p className="muted help-tip">
        📍 If possible, share your exact location (or drop a pin/coordinates) when calling — it's the single
        biggest thing that speeds up a real rescue response.
      </p>
    </section>
  );
}

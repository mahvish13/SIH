const NER_REGIONS = [
  "Meghalaya",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim"
];

export default function RegionBar({ region, onChange }) {
  return (
    <section className="card region-bar">
      <div className="region-bar-head">
        <h2>📍 Which region is this reading for?</h2>
        <p className="muted">
          Pick a region before sending data — every number below (rainfall, soil moisture, AI risk...) is only
          meaningful when it's tied to a real place.
        </p>
      </div>
      <div className="region-picker">
        {NER_REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`region-chip ${region === r ? "region-chip-active" : ""}`}
            onClick={() => onChange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      {!region && <p className="form-error">No region selected yet — the metric cards below stay empty until you pick one.</p>}
    </section>
  );
}

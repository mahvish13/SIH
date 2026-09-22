export const NER_REGIONS = [
  "Meghalaya",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim"
];

export default function RegionPicker({ region, onChange, label = "Select a region" }) {
  return (
    <section className="card region-select-card">
      <h2>📍 {label}</h2>
      <p className="muted">
        Every reading below (rainfall, soil moisture, slope, AI risk) is tied to whichever region you pick here —
        nothing is shown as an unlabeled default.
      </p>
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
    </section>
  );
}

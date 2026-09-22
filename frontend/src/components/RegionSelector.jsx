export const NER_REGIONS = [
  "Assam",
  "Meghalaya",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim"
];

export default function RegionSelector({ selected, onSelect }) {
  return (
    <div className="region-selector">
      <span className="region-selector-label">📍 Region:</span>
      <div className="region-buttons">
        {NER_REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            className={`region-btn ${selected === region ? "region-btn-active" : ""}`}
            onClick={() => onSelect(region)}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}

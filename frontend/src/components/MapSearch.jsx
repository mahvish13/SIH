import { useMemo, useState } from "react";

export default function MapSearch({ districtFeatures, reports, onSelectDistrict, onSelectReport }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const districtMatches = districtFeatures
      .filter((f) => {
        const d = (f.properties?.district || "").toLowerCase();
        const s = (f.properties?.st_nm || "").toLowerCase();
        return d.includes(q) || s.includes(q);
      })
      .slice(0, 8)
      .map((f) => ({
        type: "district",
        key: `${f.properties.st_nm}-${f.properties.district}`,
        label: `${f.properties.district}, ${f.properties.st_nm}`,
        feature: f
      }));

    const reportMatches = reports
      .filter((r) => (r.description || "").toLowerCase().includes(q) || (r.severity || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((r) => ({
        type: "report",
        key: `report-${r.id}`,
        label: `📍 Field Report — ${r.severity} — "${r.description?.slice(0, 40)}${r.description?.length > 40 ? "…" : ""}"`,
        report: r
      }));

    return [...districtMatches, ...reportMatches];
  }, [query, districtFeatures, reports]);

  const select = (result) => {
    if (result.type === "district") onSelectDistrict(result.feature);
    else onSelectReport(result.report);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="map-search">
      <input
        type="text"
        placeholder="🔎 Search state, district, village, or field report…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="map-search-results">
          {results.map((r) => (
            <button key={r.key} className="map-search-result" onClick={() => select(r)}>
              {r.label}
            </button>
          ))}
        </div>
      )}
      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="map-search-results">
          <div className="map-search-empty muted">No matches</div>
        </div>
      )}
    </div>
  );
}

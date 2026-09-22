import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";

// Real district boundary data — Census 2011 district delineations, curated
// and served from a public open-data repo (udit-001/india-maps-data, itself
// sourced from Survey of India / DataMeet / GADM per its disclaimer).
// Pinned to a specific commit via jsDelivr so the data doesn't shift under
// us. Loaded live, client-side — nothing is embedded/invented here.
const CDN_BASE = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states";

const NER_STATE_FILES = {
  "Arunachal Pradesh": "arunachal-pradesh",
  Assam: "assam",
  Manipur: "manipur",
  Meghalaya: "meghalaya",
  Mizoram: "mizoram",
  Nagaland: "nagaland",
  Sikkim: "sikkim",
  Tripura: "tripura"
};

const SEVERITY_FILL = { High: "#dc2626", Medium: "#f59e0b", Low: "#16a34a" };
const NEUTRAL_FILL = "#94a3b8"; // grey — "no real data connected for this district yet"

function normalize(name) {
  return (name || "").toLowerCase().replace(/[^a-z]/g, "");
}

export function useNerDistricts() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const entries = Object.entries(NER_STATE_FILES);
      const results = await Promise.allSettled(
        entries.map(([, slug]) => fetch(`${CDN_BASE}/${slug}.geojson`).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        }))
      );

      if (cancelled) return;

      const allFeatures = [];
      const failed = [];
      results.forEach((r, i) => {
        const [stateName] = entries[i];
        if (r.status === "fulfilled") {
          allFeatures.push(...(r.value.features || []));
        } else {
          failed.push(stateName);
        }
      });

      setFeatures(allFeatures);
      setLoadedCount(entries.length - failed.length);
      if (failed.length > 0) {
        setError(`Couldn't load district boundaries for: ${failed.join(", ")}. Showing the rest.`);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { features, loading, error, totalStates: Object.keys(NER_STATE_FILES).length, loadedCount };
}

// Matches a district feature (real property: `district`, `st_nm`) against
// our small set of districts we actually have susceptibility data for.
export function matchDistrictData(feature, zones) {
  const distName = normalize(feature.properties?.district);
  const stateName = normalize(feature.properties?.st_nm);
  return zones.find((z) => normalize(z.district) === distName && normalize(z.state) === stateName);
}

export function matchHistoryEvents(feature, historyEvents) {
  const distName = normalize(feature.properties?.district);
  const stateName = normalize(feature.properties?.st_nm);
  return historyEvents.filter((e) => normalize(e.district) === distName && normalize(e.state) === stateName);
}

export default function DistrictLayer({ features, zones, historyEvents, showFill, onDistrictClick }) {
  const geoJsonData = useMemo(() => ({ type: "FeatureCollection", features }), [features]);

  const style = (feature) => {
    const match = showFill ? matchDistrictData(feature, zones) : null;
    return {
      color: "#1f2937",
      weight: 1,
      fillColor: match ? SEVERITY_FILL[match.severity] : NEUTRAL_FILL,
      fillOpacity: match ? 0.55 : 0.15
    };
  };

  const onEachFeature = (feature, layer) => {
    const match = matchDistrictData(feature, zones);
    const events = matchHistoryEvents(feature, historyEvents);
    const distName = feature.properties?.district || "Unknown district";
    const stateName = feature.properties?.st_nm || "";

    layer.on("click", () => onDistrictClick?.({ feature, layer, match, events, distName, stateName }));

    layer.bindTooltip(`${distName}, ${stateName}`, { sticky: true, className: "district-tooltip" });
  };

  if (features.length === 0) return null;

  return <GeoJSON key={features.length} data={geoJsonData} style={style} onEachFeature={onEachFeature} />;
}

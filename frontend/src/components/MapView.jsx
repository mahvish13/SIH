import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, LayersControl, ScaleControl, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { api } from "../api.js";
import DistrictLayer, { useNerDistricts, matchDistrictData } from "./DistrictLayer.jsx";
import DistrictDetailPanel from "./DistrictDetailPanel.jsx";
import MapSearch from "./MapSearch.jsx";

const { BaseLayer } = LayersControl;

const pulseIcon = L.divIcon({
  className: "visualized-risk-zone-icon",
  html: `<div class="risk-pulse-ring risk-pulse-1"></div><div class="risk-pulse-ring risk-pulse-2"></div><div class="risk-pulse-core"></div>`,
  iconSize: [1, 1]
});

const NER_CENTER = [25.8, 93.2];
const NER_BOUNDS = [
  [21.5, 88.0],
  [29.5, 97.5]
];
const NER_STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura"
];

function selectionFromFeature(feature, zones, historyEvents) {
  const tempLayer = L.geoJSON(feature);
  return {
    feature,
    layer: tempLayer,
    match: matchDistrictData(feature, zones),
    events: historyEvents.filter(
      (e) =>
        (e.district || "").toLowerCase() === (feature.properties?.district || "").toLowerCase() &&
        (e.state || "").toLowerCase() === (feature.properties?.st_nm || "").toLowerCase()
    ),
    distName: feature.properties?.district || "Unknown district",
    stateName: feature.properties?.st_nm || ""
  };
}

export default function MapView({ zones, reports }) {
  const mapRef = useRef(null);
  const wrapRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { features, loading: districtsLoading, error: districtsError, totalStates, loadedCount } = useNerDistricts();

  const [history, setHistory] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrictName, setSelectedDistrictName] = useState("");
  const [selection, setSelection] = useState(null);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showSusceptibility, setShowSusceptibility] = useState(true);
  const [showRecent, setShowRecent] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [locateMsg, setLocateMsg] = useState("");

  useEffect(() => {
    api
      .getHistory()
      .then((d) => setHistory(d.events || []))
      .catch((err) => console.error("Failed to load recent landslides for map:", err));
  }, []);

  const districtsInSelectedState = useMemo(
    () => (selectedState ? features.filter((f) => f.properties?.st_nm === selectedState) : []),
    [features, selectedState]
  );

  const highRiskCentroids = useMemo(() => {
    if (features.length === 0) return [];
    return zones
      .filter((z) => z.severity === "High")
      .map((z) => {
        const feature = features.find(
          (f) =>
            (f.properties?.district || "").toLowerCase() === (z.district || "").toLowerCase() &&
            (f.properties?.st_nm || "").toLowerCase() === (z.state || "").toLowerCase()
        );
        if (!feature) return null;
        const center = L.geoJSON(feature).getBounds().getCenter();
        return { id: z.id, center };
      })
      .filter(Boolean);
  }, [features, zones]);

  const flyToFeature = (feature) => {
    const bounds = L.geoJSON(feature).getBounds();
    mapRef.current?.flyToBounds(bounds, { padding: [30, 30], duration: 0.8 });
    setSelection(selectionFromFeature(feature, zones, history));
    setSelectedState(feature.properties?.st_nm || "");
    setSelectedDistrictName(feature.properties?.district || "");
  };

  const flyToState = (stateName) => {
    setSelectedState(stateName);
    setSelectedDistrictName("");
    setSelection(null);
    const stateFeatures = features.filter((f) => f.properties?.st_nm === stateName);
    if (stateFeatures.length === 0) return;
    const bounds = L.geoJSON({ type: "FeatureCollection", features: stateFeatures }).getBounds();
    mapRef.current?.flyToBounds(bounds, { padding: [20, 20], duration: 0.8 });
  };

  useEffect(() => {
    const stateParam = searchParams.get("state");
    if (stateParam && features.length > 0) {
      flyToState(stateParam);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, searchParams]);

  const resetView = () => {
    setSelectedState("");
    setSelectedDistrictName("");
    setSelection(null);
    mapRef.current?.flyToBounds(NER_BOUNDS, { duration: 0.8 });
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocateMsg("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const inNer = latitude >= NER_BOUNDS[0][0] && latitude <= NER_BOUNDS[1][0] && longitude >= NER_BOUNDS[0][1] && longitude <= NER_BOUNDS[1][1];
        if (!inNer) {
          setLocateMsg("Your current location is outside the NER monitoring region.");
          return;
        }
        setLocateMsg("");
        mapRef.current?.flyTo([latitude, longitude], 10, { duration: 0.8 });
      },
      () => setLocateMsg("Couldn't get your location.")
    );
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Leaflet caches its container size — force a recalculation once the
      // browser has actually resized the element, or tiles/controls won't
      // fill the new fullscreen viewport correctly.
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!wrapRef.current) return;
    if (!document.fullscreenElement) wrapRef.current.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <section className="card">
      <div className="map-header">
        <h2>🗺️ NER Landslide GIS Monitoring Map</h2>
        <p className="muted">
          {loadedCount}/{totalStates} states' real district boundaries loaded · {features.length} districts ·{" "}
          {history.length} recent landslides
        </p>
      </div>

      <p className="breadcrumb muted">
        NER {selectedState && <> &gt; {selectedState}</>} {selectedDistrictName && <> &gt; {selectedDistrictName}</>}
      </p>

      <p className="data-disclaimer muted">
        ⚠️ District boundaries are real Census-2011 delineations from a public open-data source (see Data Sources
        page) — loaded live, not invented. District shading uses <strong>our own</strong> susceptibility
        classification, only for the small number of districts we actually have data for — grey districts mean{" "}
        <strong>Data Unavailable</strong>, not "Low risk." Click "Fetch Real Current Risk" on any district for a
        live, on-demand reading.
      </p>
      {districtsError && <div className="form-error">{districtsError}</div>}

      <MapSearch
        districtFeatures={features}
        reports={reports}
        onSelectDistrict={flyToFeature}
        onSelectReport={(r) => mapRef.current?.flyTo([r.lat, r.lng], 10, { duration: 0.8 })}
      />

      <div className="map-selector-row">
        <select value={selectedState} onChange={(e) => (e.target.value ? flyToState(e.target.value) : resetView())}>
          <option value="">All NER states</option>
          {NER_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={selectedDistrictName}
          disabled={!selectedState}
          onChange={(e) => {
            const feature = districtsInSelectedState.find((f) => f.properties.district === e.target.value);
            if (feature) flyToFeature(feature);
          }}
        >
          <option value="">Select district…</option>
          {districtsInSelectedState.map((f) => (
            <option key={f.properties.district} value={f.properties.district}>
              {f.properties.district}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={resetView}>
          ⟲ Reset NER View
        </button>
        <button className="btn btn-ghost btn-sm" onClick={locateMe}>
          📍 My Location
        </button>
        <button className="btn btn-ghost btn-sm" onClick={toggleFullscreen}>
          ⛶ Fullscreen
        </button>
      </div>
      {locateMsg && <p className="muted">{locateMsg}</p>}

      <div className="layer-toggle-row">
        <label className="layer-toggle">
          <input type="checkbox" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} />
          District Boundaries
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showSusceptibility} onChange={(e) => setShowSusceptibility(e.target.checked)} />
          Landslide Susceptibility (our classification)
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showRecent} onChange={(e) => setShowRecent(e.target.checked)} />
          Recent Landslides (verified real events)
        </label>
        <label className="layer-toggle">
          <input type="checkbox" checked={showReports} onChange={(e) => setShowReports(e.target.checked)} />
          Field Reports
        </label>
      </div>
      <p className="muted layer-honesty-note">
        Not shown (no real data connected yet): rivers, roads/highways, live weather overlay, CAP alerts, landslide
        inventory polygons finer than district level.
      </p>

      <div className="map-wrap" ref={wrapRef}>
        {districtsLoading && <p className="muted map-loading-note">Loading real district boundaries for all 8 states…</p>}
        <button className="fullscreen-exit-btn" onClick={toggleFullscreen}>
          ✕ Exit Fullscreen
        </button>
        <MapContainer
          ref={mapRef}
          center={NER_CENTER}
          zoom={7}
          minZoom={6}
          maxBounds={NER_BOUNDS}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={false}
          touchZoom={true}
          tap={true}
          dragging={true}
          zoomControl={true}
          style={{ height: 480, width: "100%", touchAction: "none" }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Street">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
            <BaseLayer name="Terrain (Hillshade)">
              <TileLayer
                attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
          </LayersControl>

          <ScaleControl position="bottomleft" />

          {showDistricts && (
            <DistrictLayer
              features={features}
              zones={zones}
              historyEvents={history}
              showFill={showSusceptibility}
              onDistrictClick={setSelection}
            />
          )}

          {showSusceptibility &&
            highRiskCentroids.map((h) => <Marker key={h.id} position={h.center} icon={pulseIcon} interactive={false} />)}

          {showRecent &&
            history
              .filter((e) => e.lat != null && e.lng != null)
              .map((e) => (
                <CircleMarker
                  key={e.id}
                  center={[e.lat, e.lng]}
                  radius={9}
                  pathOptions={{ color: "#7c3aed", fillColor: "#7c3aed", fillOpacity: 0.8 }}
                >
                  <Popup>
                    <strong>{e.title}</strong>
                    <br />
                    {e.place}, {e.state}
                    <br />
                    {new Date(e.date).toLocaleDateString()}
                    <br />
                    💀 {e.deaths} deaths
                  </Popup>
                </CircleMarker>
              ))}

          {showReports &&
            reports.map((r) => (
              <CircleMarker
                key={r.id}
                center={[r.lat, r.lng]}
                radius={8}
                pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.85 }}
              >
                <Popup>
                  <strong>Field Report</strong>
                  <br />
                  {r.source} report
                  <br />
                  Severity: {r.severity}
                  <br />
                  {r.description}
                  {r.photo && (
                    <>
                      <br />
                      <img src={r.photo} alt="Field report attachment" className="report-popup-photo" />
                    </>
                  )}
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>

      <DistrictDetailPanel selection={selection} onClose={() => setSelection(null)} />

      <div className="map-legend">
        <LegendDot color="#dc2626" label="High Susceptibility" />
        <LegendDot color="#f59e0b" label="Medium Susceptibility" />
        <LegendDot color="#16a34a" label="Low Susceptibility" />
        <LegendDot color="#94a3b8" label="Data Unavailable" />
        <LegendDot color="#7c3aed" label="Recent Landslide (verified)" />
        <LegendDot color="#2563eb" label="Field Report" />
      </div>

      <div className="map-stats">
        <Stat value={features.length} label="Districts Loaded" />
        <Stat value={history.length} label="Recent Landslides" />
        <Stat value={reports.length} label="Field Reports" />
      </div>
    </section>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="legend-dot">
      <span className="dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

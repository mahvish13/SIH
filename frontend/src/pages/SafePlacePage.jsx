import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { api } from "../api.js";
import { SAFE_PLACE_LABELS, SAFE_PLACE_LANGUAGES } from "../safePlaceLabels.js";

const youAreHereIcon = L.divIcon({
  className: "visualized-risk-zone-icon",
  html: `<div class="risk-pulse-ring risk-pulse-1" style="background: rgba(15,109,132,0.35);"></div><div class="risk-pulse-ring risk-pulse-2" style="background: rgba(15,109,132,0.35);"></div><div class="risk-pulse-core" style="background:#0f6d84; box-shadow:0 0 6px 2px rgba(15,109,132,0.6);"></div>`,
  iconSize: [1, 1]
});

const NER_BOUNDS = [
  [21.5, 88.0],
  [29.5, 97.5]
];
const LOW_CONFIDENCE_LANGS = ["mni", "kha", "lus"];
const RADIUS_OPTIONS = [
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 20000, label: "20 km" }
];
const CATEGORY_FILTERS = [
  { key: "", label: "All" },
  { key: "shelter", label: "Shelters / Evacuation Centres" },
  { key: "hospital", label: "Hospitals" },
  { key: "fire", label: "Fire Stations" },
  { key: "police", label: "Police Stations" }
];
const CATEGORY_COLOR = { shelter: "#16a34a", hospital: "#dc2626", fire: "#ea580c", police: "#2563eb" };
const ALERT_COLOR = { CRITICAL: "#b91c1c", HIGH: "#ea580c", MEDIUM: "#d97706", LOW: "#16a34a" };

export default function SafePlacePage() {
  const [lang, setLang] = useState("en");
  const [radius, setRadius] = useState(20000);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [origin, setOrigin] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [ownRisk, setOwnRisk] = useState(null);
  const [ownRiskLoading, setOwnRiskLoading] = useState(false);
  const [places, setPlaces] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outsideNer, setOutsideNer] = useState(false);

  const t = SAFE_PLACE_LABELS[lang] || SAFE_PLACE_LABELS.en;
  const lowConfidence = LOW_CONFIDENCE_LANGS.includes(lang);

  const findPlaces = (overrideRadius) => {
    const useRadius = overrideRadius ?? radius;
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      return;
    }
    setLoading(true);
    setError("");
    setOutsideNer(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const inNer =
          latitude >= NER_BOUNDS[0][0] &&
          latitude <= NER_BOUNDS[1][0] &&
          longitude >= NER_BOUNDS[0][1] &&
          longitude <= NER_BOUNDS[1][1];
        if (!inNer) {
          setOutsideNer(true);
          setLoading(false);
          return;
        }
        setOrigin({ lat: latitude, lng: longitude });
        setAccuracy(acc ?? null);
        setOwnRisk(null);
        try {
          const [placesData, geoData] = await Promise.allSettled([
            api.getSafePlaces({ lat: latitude, lng: longitude, radius: useRadius }),
            api.getReverseGeocode({ lat: latitude, lng: longitude })
          ]);
          if (placesData.status === "fulfilled") setPlaces(placesData.value);
          else setError("Couldn't fetch nearby places right now.");
          setLocationInfo(geoData.status === "fulfilled" ? geoData.value : null);
        } finally {
          setLoading(false);
        }

        // Real current risk AT your exact location — separate call so a
        // slow/failed risk lookup never blocks showing nearby places.
        setOwnRiskLoading(true);
        try {
          const risk = await api.getDistrictRisk({
            lat: latitude,
            lng: longitude,
            name: "Your Location",
            state: locationInfo?.state
          });
          setOwnRisk(risk);
        } catch (err) {
          console.error("Own-location risk fetch failed:", err);
          setOwnRisk({ dataInsufficient: true });
        } finally {
          setOwnRiskLoading(false);
        }
      },
      () => {
        setError("Couldn't get your location. Location access is required for this feature.");
        setLoading(false);
      }
    );
  };

  const changeRadius = (r) => {
    setRadius(r);
    if (origin) findPlaces(r);
  };

  const directionsUrl = (place) =>
    origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}`
      : null;

  const filteredPlaces = places
    ? places.places.filter((p) => !categoryFilter || p.category === categoryFilter)
    : [];
  const recommendedPlace = places?.recommended ? places.places.find((p) => p.id === places.recommended.id) : null;

  return (
    <section className="card safe-place-page">
      <h1>{t.title}</h1>
      <p className="muted">{t.subtitle}</p>

      <div className="safety-selector-row">
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {SAFE_PLACE_LANGUAGES.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
        <button className="btn btn-live" onClick={() => findPlaces()} disabled={loading}>
          {loading ? t.locating : t.useLocation}
        </button>
        {places && (
          <button className="btn btn-ghost btn-sm" onClick={() => findPlaces()} disabled={loading}>
            {t.refresh}
          </button>
        )}
      </div>

      {origin && (
        <>
          <p className="muted safe-place-coords">
            📍 {origin.lat.toFixed(5)}, {origin.lng.toFixed(5)}
            {locationInfo?.district && ` — ${locationInfo.district}`}
            {locationInfo?.state && `, ${locationInfo.state}`}
            {!locationInfo && " — district/state lookup unavailable"}
            {accuracy != null && ` (±${Math.round(accuracy)}m GPS accuracy)`}
          </p>

          <div className="own-risk-card">
            <strong>📡 Current Risk at Your Location</strong>
            {ownRiskLoading && <p className="muted">Fetching real risk for your exact coordinates…</p>}
            {!ownRiskLoading && ownRisk?.dataInsufficient && (
              <p className="muted">⚠️ {t.unavailable} — couldn't get a real reading for this exact point right now.</p>
            )}
            {!ownRiskLoading && ownRisk && !ownRisk.dataInsufficient && (
              <p>
                <span className={`alert-badge alert-${(ownRisk.alertLevel || "").toLowerCase()}`}>
                  {ownRisk.alertLevel}
                </span>{" "}
                <strong>{ownRisk.risk}% risk</strong> — 🌧️ {ownRisk.inputs?.rainfall}mm · 💧 {ownRisk.inputs?.soilMoisture}% ·
                🏔️ {ownRisk.inputs?.slope}°
                <span className="muted"> · updated {new Date(ownRisk.lastUpdated).toLocaleTimeString()}</span>
              </p>
            )}
          </div>
        </>
      )}

      {lowConfidence && (
        <div className="safety-lowconf-notice">
          ⚠️ Full translation for this language isn't available yet for this feature — most labels are shown in
          English rather than guessed.
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
      {outsideNer && <p className="muted">{t.outsideNer}</p>}

      {places && (
        <>
          <div className="safety-selector-row">
            <span className="muted">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.value}
                className={`filter-chip-3d ${radius === r.value ? "filter-chip-3d-active" : ""}`}
                onClick={() => changeRadius(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="safety-selector-row">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.key}
                className={`filter-chip-3d ${categoryFilter === c.key ? "filter-chip-3d-active" : ""}`}
                onClick={() => setCategoryFilter(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <p className="muted data-disclaimer">
            ⚠️ Source: {places.source}. {t.status} and {t.roadStatus} are shown as "{t.unavailable}" wherever we
            genuinely don't have that data — never invented. Last updated {new Date(places.fetchedAt).toLocaleTimeString()}.
          </p>
          {places.note && <p className="muted safe-place-limit-note">ℹ️ {places.note}</p>}

          {recommendedPlace && (
            <div className="safe-place-recommended">
              <strong>✅ Recommended: {recommendedPlace.name}</strong>
              <p className="muted">{places.recommended.reason}</p>
            </div>
          )}

          {filteredPlaces.length === 0 && <p className="muted">{t.noResults}</p>}

          <div className="safe-place-map-wrap">
            <MapContainer center={[origin.lat, origin.lng]} zoom={12} scrollWheelZoom={false} style={{ height: 320, width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CircleMarker center={[origin.lat, origin.lng]} radius={9} pathOptions={{ color: "#0f6d84", fillColor: "#0f6d84", fillOpacity: 0.9 }}>
                <Popup>Your location</Popup>
              </CircleMarker>
              <Marker position={[origin.lat, origin.lng]} icon={youAreHereIcon} interactive={false} />
              {filteredPlaces.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={[p.lat, p.lng]}
                  radius={p.id === recommendedPlace?.id ? 10 : 7}
                  pathOptions={{
                    color: CATEGORY_COLOR[p.category] || "#64748b",
                    fillColor: CATEGORY_COLOR[p.category] || "#64748b",
                    fillOpacity: p.id === recommendedPlace?.id ? 1 : 0.8
                  }}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <br />
                    {p.typeLabel}
                    <br />
                    {p.distanceKm} km away
                    {p.risk?.value != null && (
                      <>
                        <br />
                        Risk: {p.risk.value}% ({p.risk.severity})
                      </>
                    )}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="safe-place-grid">
            {filteredPlaces.map((p) => (
              <div key={p.id} className={`safe-place-card ${p.id === recommendedPlace?.id ? "safe-place-card-recommended" : ""}`}>
                <div className="safe-place-card-head">
                  <span className="safe-place-icon">{p.icon}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <div className="muted safe-place-type">{p.typeLabel}</div>
                    <div className="safe-place-official-note">
                      {p.osmTaggedAsEmergencyPoint
                        ? "🏷️ OSM-tagged as an emergency point — not confirmed as government-designated"
                        : "General nearby facility — not a designated shelter"}
                    </div>
                  </div>
                </div>
                <div className="safe-place-stats">
                  <span>📏 {t.distance}: <strong>{p.distanceKm} km</strong></span>
                  {p.risk?.value != null ? (
                    <span>
                      ⚠️ Current Risk: <strong>{p.risk.value}%</strong> ({p.risk.severity})
                    </span>
                  ) : p.risk?.error ? (
                    <span>⚠️ Risk: {t.unavailable}</span>
                  ) : (
                    <span className="muted">Risk: not checked (see note above)</span>
                  )}
                  {p.route?.distanceKm != null ? (
                    <span>🚗 Route: {p.route.distanceKm} km, ~{p.route.durationMin} min</span>
                  ) : (
                    <span className="muted">Route: {t.unavailable}</span>
                  )}
                  <span>🟡 {t.status}: {t.unavailable}</span>
                  <span>🕐 {t.lastUpdated}: {t.unavailable}</span>
                  <span>🛣️ {t.roadStatus}: {t.unavailable}</span>
                </div>
                <a href={directionsUrl(p)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  {t.getDirections}
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

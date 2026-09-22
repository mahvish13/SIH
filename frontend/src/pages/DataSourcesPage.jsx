const SOURCES = [
  {
    name: "Open-Meteo — Weather & Soil",
    url: "https://open-meteo.com/",
    used: "Rainfall, soil moisture, temperature, humidity, wind, forecasts, 7-day history",
    where: "Dashboard, Insights, Risk Map"
  },
  {
    name: "Open-Meteo — Elevation API",
    url: "https://open-meteo.com/en/docs/elevation-api",
    used: "Real SRTM elevation → slope angle via trigonometry",
    where: "Risk calculation everywhere"
  },
  {
    name: "India District Boundaries",
    url: "https://github.com/udit-001/india-maps-data",
    used: "Real district polygons for all 8 NER states (Census 2011)",
    where: "Risk Map"
  },
  {
    name: "Map Basemaps",
    url: "https://www.openstreetmap.org/",
    used: "OpenStreetMap (street), Esri (satellite), OpenTopoMap (terrain)",
    where: "Risk Map, Find Safe Place"
  },
  {
    name: "Overpass API",
    url: "https://overpass-api.de/",
    used: "Real nearby shelters, hospitals, fire/police stations from OpenStreetMap",
    where: "Find Safe Place"
  },
  {
    name: "OSRM Routing",
    url: "https://project-osrm.org/",
    used: "Real road-network route distance & travel time",
    where: "Find Safe Place"
  },
  {
    name: "Nominatim",
    url: "https://nominatim.org/",
    used: "Real reverse geocoding — GPS → district/state name",
    where: "Find Safe Place"
  },
  {
    name: "Google Maps",
    url: "https://www.google.com/maps",
    used: "\"Get Directions\" deep link using your real coordinates",
    where: "Find Safe Place"
  },
  {
    name: "Google News RSS",
    url: "https://news.google.com/",
    used: "Real live NER disaster headlines — situational awareness only",
    where: "Insights, History"
  }
];

export default function DataSourcesPage() {
  return (
    <section className="card">
      <h1>🛰️ Data Sources</h1>
      <p className="muted">Everything this app actually calls, and where it's used. Nothing else.</p>

      <div className="source-list-compact">
        {SOURCES.map((s) => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="source-card-compact">
            <div className="source-card-compact-head">
              <strong>{s.name}</strong>
              <span className="status-badge status-open">Live</span>
            </div>
            <p className="source-card-compact-used">{s.used}</p>
            <p className="muted source-card-compact-where">Used in: {s.where}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

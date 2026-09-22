import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/map", label: "Risk Map" },
  { to: "/reports", label: "Field Reports" },
  { to: "/insights", label: "Insights" },
  { to: "/safe-place", label: "Find Safe Place" },
  { to: "/safety-guide", label: "Safety Guide" },
  { to: "/history", label: "History" },
  { to: "/data-sources", label: "Data Sources" }
];

export default function Navbar({ backendOk }) {
  return (
    <header className="header">
      <div className="header-title">
        <span className="header-icon">🌧️</span>
        <div>
          <h1>NER Disaster Monitoring System</h1>
          <p>AI-Based Early Warning &amp; Landslide Risk Monitoring</p>
        </div>
      </div>

      <nav className="navbar">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <span className={`backend-pill ${backendOk ? "ok" : "down"}`}>
        <span className="dot" />
        {backendOk ? "Backend Connected" : "Backend Offline"}
      </span>
    </header>
  );
}

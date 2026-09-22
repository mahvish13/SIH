export default function Header({ backendOk }) {
  return (
    <header className="header">
      <div className="header-title">
        <span className="header-icon">🌧️</span>
        <div>
          <h1>NER Disaster Monitoring System</h1>
          <p>AI-Based Early Warning &amp; Landslide Risk Monitoring</p>
        </div>
      </div>
      <span className={`backend-pill ${backendOk ? "ok" : "down"}`}>
        <span className="dot" />
        {backendOk ? "Backend Connected" : "Backend Offline"}
      </span>
    </header>
  );
}

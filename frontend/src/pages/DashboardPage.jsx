import { useState } from "react";
import StatesLiveGrid from "../components/StatesLiveGrid.jsx";
import LiveAlerts from "../components/LiveAlerts.jsx";
import RegionPicker from "../components/RegionPicker.jsx";
import RiskOverview from "../components/RiskOverview.jsx";
import EnvironmentalSimulator from "../components/EnvironmentalSimulator.jsx";
import ActivityLog from "../components/ActivityLog.jsx";

export default function DashboardPage({
  latest,
  onSend,
  sending,
  activity,
  zones,
  reports,
  region,
  onRegionChange,
  liveStates,
  liveLoading,
  liveError,
  liveLastFetched,
  onLiveRefresh
}) {
  const [showManual, setShowManual] = useState(false);

  return (
    <>
      <section className="intro card">
        <h1>AI-Based Landslide Early Warning System</h1>
        <p className="muted">
          Real-time monitoring and prediction platform for identifying landslide-prone areas in the North Eastern
          Region of India — now fully automatic, no manual data entry required.
        </p>
        <div className="pipeline-bar">
          <strong>Data Pipeline:</strong> Real Satellite/Weather Data → Backend → AI Risk Analysis → GIS Risk Map →
          Early Warning
        </div>
      </section>

      <StatesLiveGrid
        states={liveStates}
        loading={liveLoading}
        error={liveError}
        lastFetched={liveLastFetched}
        onRefresh={onLiveRefresh}
      />
      <LiveAlerts states={liveStates} />

      <section className="card">
        <button className="btn btn-ghost" onClick={() => setShowManual((v) => !v)}>
          {showManual ? "▲ Hide Manual Demo Mode" : "▼ Show Manual Demo Mode (optional, for testing specific scenarios)"}
        </button>
        {showManual && (
          <div className="manual-demo-block">
            <p className="muted">
              This section is optional — everything above already runs on real, automatically-fetched data. Use
              this only if you want to test a specific hypothetical scenario by hand.
            </p>
            <RegionPicker region={region} onChange={onRegionChange} label="Select a region for manual testing" />
            <RiskOverview latest={latest} zones={zones} reports={reports} region={region} />
            <EnvironmentalSimulator onSend={onSend} sending={sending} region={region} />
            <ActivityLog entries={activity} />
          </div>
        )}
      </section>
    </>
  );
}

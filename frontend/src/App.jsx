import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { api } from "./api.js";

import Navbar from "./components/Navbar.jsx";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import InsightsPage from "./pages/InsightsPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DataSourcesPage from "./pages/DataSourcesPage.jsx";
import SafetyGuidePage from "./pages/SafetyGuidePage.jsx";
import SafePlacePage from "./pages/SafePlacePage.jsx";
import DiagnosticsPage from "./pages/DiagnosticsPage.jsx";

const PAGE_THEMES = {
  "/": "terrain",
  "/map": "satellite",
  "/reports": "storm",
  "/insights": "water",
  "/history": "terrain",
  "/data-sources": "terrain",
  "/safety-guide": "storm",
  "/safe-place": "terrain"
};

const LIVE_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export default function App() {
  const location = useLocation();
  const theme = PAGE_THEMES[location.pathname] || "terrain";

  const [backendOk, setBackendOk] = useState(false);
  const [zones, setZones] = useState([]);
  const [roads, setRoads] = useState([]);
  const [reports, setReports] = useState([]);
  const [dashboardRegion, setDashboardRegion] = useState(null); // no default — user must pick
  const [latest, setLatest] = useState(null);
  const [activity, setActivity] = useState([]);
  const [sending, setSending] = useState(false);

  // Real per-state current-risk data — fetched ONCE here and shared by both
  // the Dashboard and Insights pages, so the two never show inconsistent
  // numbers for the same state.
  const [liveStates, setLiveStates] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState("");
  const [liveLastFetched, setLiveLastFetched] = useState(null);

  const loadLiveStates = useCallback(async () => {
    try {
      const data = await api.getStatesLive();
      setLiveStates(data.states);
      setLiveLastFetched(new Date());
      setLiveError("");
      setBackendOk(true);
    } catch (err) {
      console.error("Failed to load state-wise live data:", err);
      setLiveError("Couldn't refresh live data — showing the last successful reading.");
      setBackendOk(false);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveStates();
    const interval = setInterval(loadLiveStates, LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadLiveStates]);

  useEffect(() => {
    (async () => {
      try {
        const [zonesData, roadsData, reportsData] = await Promise.all([
          api.getZones(),
          api.getRoads(),
          api.getReports()
        ]);
        setZones(zonesData);
        setRoads(roadsData);
        setReports(reportsData);
        setBackendOk(true);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setBackendOk(false);
      }
    })();
  }, []);

  const handleSend = async (values, meta = {}) => {
    setSending(true);
    try {
      const result = await api.predictRisk({ ...values, region: dashboardRegion });
      setLatest(result);
      setActivity((prev) => [{ ...result, label: `${meta.label || "Data"} sent to backend successfully` }, ...prev].slice(0, 30));
      setBackendOk(true);
    } catch (err) {
      console.error("Prediction request failed:", err);
      setActivity((prev) => [
        { id: `err-${Date.now()}`, timestamp: new Date().toISOString(), risk: null, severity: null, label: "⚠️ Failed to reach backend" },
        ...prev
      ].slice(0, 30));
      setBackendOk(false);
    } finally {
      setSending(false);
    }
  };

  const handleReportSubmit = async (payload) => {
    try {
      const saved = await api.submitReport(payload);
      setReports((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Failed to submit report:", err);
    }
  };

  return (
    <div className="app">
      <AnimatedBackground theme={theme} />
      <Navbar backendOk={backendOk} />

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                latest={latest}
                onSend={handleSend}
                sending={sending}
                activity={activity}
                zones={zones}
                reports={reports}
                region={dashboardRegion}
                onRegionChange={setDashboardRegion}
                liveStates={liveStates}
                liveLoading={liveLoading}
                liveError={liveError}
                liveLastFetched={liveLastFetched}
                onLiveRefresh={loadLiveStates}
              />
            }
          />
          <Route path="/map" element={<MapPage zones={zones} reports={reports} />} />
          <Route path="/reports" element={<ReportsPage reports={reports} onSubmit={handleReportSubmit} />} />
          <Route
            path="/insights"
            element={<InsightsPage zones={zones} roads={roads} liveStates={liveStates} liveLastFetched={liveLastFetched} />}
          />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/safety-guide" element={<SafetyGuidePage />} />
          <Route path="/safe-place" element={<SafePlacePage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
        </Routes>

        <footer className="footer muted">
          Prototype dashboard · NER Disaster Monitoring System · swap mock data sources for live feeds in later
          phases
        </footer>
      </main>
    </div>
  );
}

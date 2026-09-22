import CurrentRegionalRisk from "../components/CurrentRegionalRisk.jsx";
import NewsSection from "../components/NewsSection.jsx";
import RiskSummary from "../components/RiskSummary.jsx";
import RoadConnectivity from "../components/RoadConnectivity.jsx";
import EmergencyPriority from "../components/EmergencyPriority.jsx";

export default function InsightsPage({ zones, roads, liveStates, liveLastFetched }) {
  return (
    <>
      <section className="card">
        <h1>📊 Insights</h1>
        <p className="muted">
          This page is powered by the <strong>same live data as the Dashboard</strong> and the{" "}
          <strong>same zone data as the Risk Map</strong> — nothing here is separately hardcoded. Current Risk
          updates automatically every 5 minutes from real per-state readings. Long-Term Susceptibility is a static
          classification (won't change minute to minute). Road Connectivity below is still seed/demo data, clearly
          labeled as such, not shown as if it were real.
        </p>
      </section>

      <CurrentRegionalRisk liveStates={liveStates} lastFetched={liveLastFetched} />

      <NewsSection />

      <div className="two-col">
        <RiskSummary zones={zones} />
        <RoadConnectivity roads={roads} />
      </div>

      <EmergencyPriority liveStates={liveStates} zones={zones} />
    </>
  );
}

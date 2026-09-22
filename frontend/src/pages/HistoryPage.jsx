import HistoryTimeline3D from "../components/HistoryTimeline3D.jsx";

export default function HistoryPage() {
  return (
    <>
      <HistoryTimeline3D />
      <section className="card">
        <p className="muted history-note">
          See the <a href="/data-sources">Data Sources</a> page for exactly which real data feeds power this site.
        </p>
      </section>
    </>
  );
}

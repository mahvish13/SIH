import FieldReports from "../components/FieldReports.jsx";
import HelpResources from "../components/HelpResources.jsx";

export default function ReportsPage({ reports, onSubmit }) {
  return (
    <>
      <HelpResources />
      <FieldReports reports={reports} onSubmit={onSubmit} />
    </>
  );
}

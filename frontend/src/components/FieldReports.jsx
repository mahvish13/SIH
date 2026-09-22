import { useState } from "react";
import ReportForm from "./ReportForm.jsx";

export default function FieldReports({ reports, onSubmit }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="card">
      <div className="field-reports-header">
        <div>
          <h2>Field Reports</h2>
          <p className="muted">Citizen and official incident reports</p>
        </div>
        <div className="field-reports-actions">
          <span className="pill">{reports.length} Report{reports.length === 1 ? "" : "s"}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "+ New Report"}
          </button>
        </div>
      </div>

      {showForm && (
        <ReportForm
          onSubmit={(payload) => {
            onSubmit(payload);
            setShowForm(false);
          }}
        />
      )}

      <div className="report-list">
        {reports.map((r, i) => (
          <article key={r.id} className="report-card">
            <div className="report-card-header">
              <h3>Report #{reports.length - i}</h3>
              <span className="muted">{new Date(r.submittedAt).toLocaleString()}</span>
            </div>
            <span className="pill pill-source">{r.source}</span>

            <div className="report-location">
              <strong>Location:</strong> {r.lat.toFixed(6)}, {r.lng.toFixed(6)}
            </div>

            <div>
              <strong>Description:</strong>
              <p>
                Severity: {r.severity}
                <br />
                {r.description}
              </p>
            </div>

            {r.photo && (
              <div className="report-photo">
                <img src={r.photo} alt={`Photo attached to report #${reports.length - i}`} />
              </div>
            )}

            {r.attachment && (
              <div className="report-attachment">
                <strong>Attachment:</strong> {r.attachment}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

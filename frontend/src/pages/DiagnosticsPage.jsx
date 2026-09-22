import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function DiagnosticsPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const run = async () => {
    setLoading(true);
    setFetchError("");
    try {
      // Deliberately not using the shared api.js request() helper here —
      // it throws away the response body on non-2xx, and this page needs
      // to see the per-check breakdown even when some checks fail.
      const res = await fetch(`${BASE_URL}/diagnostics`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Diagnostics request failed:", err);
      setFetchError(
        "Couldn't even reach the backend itself — check that your backend terminal is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <section className="card">
      <h1>🔧 Connection Diagnostics</h1>
      <p className="muted">
        Directly tests each real data connection the backend depends on and reports the exact result — used to
        confirm the real-data pipeline is actually working, not just to check the UI.
      </p>

      <button className="btn btn-primary btn-sm" onClick={run} disabled={loading}>
        {loading ? "Testing…" : "↻ Run Diagnostics Again"}
      </button>

      {fetchError && <div className="form-error">{fetchError}</div>}

      {result && (
        <>
          <p className={result.allOk ? "diag-ok" : "diag-fail"}>
            {result.allOk ? "✅ All connections working" : "⚠️ One or more connections failed"} — tested{" "}
            {new Date(result.testedAt).toLocaleString()} against {result.testRegion}
          </p>
          <p className="muted">{result.note}</p>

          <div className="diag-list">
            {result.results.map((r) => (
              <div key={r.name} className={`diag-row ${r.ok ? "diag-row-ok" : "diag-row-fail"}`}>
                <div className="diag-row-head">
                  <strong>{r.ok ? "✅" : "❌"} {r.name}</strong>
                  <span className="muted">{r.tookMs}ms</span>
                </div>
                {r.ok ? (
                  <pre className="diag-sample">{JSON.stringify(r.sample, null, 2)}</pre>
                ) : (
                  <p className="diag-error">{r.error}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { NER_STATES, CATEGORIES, categoryLabel, enrichNewsItem } from "../newsUtils.js";

// Merges the 3 separately-verified historical events (which carry real
// casualty data we specifically researched) with real, older news headlines
// from Google News RSS. Casualty numbers are only ever shown for the
// verified entries — never inferred or invented for a news headline.
function buildTimeline(verifiedEvents, newsItems) {
  const verified = verifiedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    state: e.state,
    category: "landslide",
    publishedAt: e.date,
    source: e.source,
    url: null,
    deaths: e.deaths,
    missing: e.missing,
    injured: e.injured,
    summary: e.summary,
    verified: true,
    historical: true
  }));

  const news = newsItems.map((n) =>
    enrichNewsItem(n, { historical: true })
  ).map((n) => ({ ...n, deaths: null, missing: null, injured: null, summary: null, verified: false }));

  return [...verified, ...news].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
}

export default function HistoryTimeline3D() {
  const [verifiedEvents, setVerifiedEvents] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [histRes, newsRes] = await Promise.allSettled([api.getHistory(), api.getNewsHistory()]);
        if (histRes.status === "fulfilled") setVerifiedEvents(histRes.value.events || []);
        if (newsRes.status === "fulfilled") setNewsItems(newsRes.value.items || []);
        if (histRes.status === "rejected" && newsRes.status === "rejected") {
          setError("Historical data unavailable right now.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const timeline = useMemo(() => buildTimeline(verifiedEvents, newsItems), [verifiedEvents, newsItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return timeline.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (stateFilter && t.state !== stateFilter) return false;
      return true;
    });
  }, [timeline, query, categoryFilter, stateFilter]);

  return (
    <section className="card history-timeline-3d">
      <div className="live-header">
        <h2>🗺️ North-East Disaster History</h2>
      </div>
      <p className="muted">
        A chronological mix of 3 separately-verified major historical events (with real casualty figures we
        specifically researched) and real older headlines from Google News RSS. Casualty numbers are shown only
        where we actually verified them — never inferred for a news headline.
      </p>

      <div className="news-filters news-filters-3d">
        <input type="text" placeholder="🔎 Search history…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button
          className={`filter-chip-3d ${categoryFilter === "" ? "filter-chip-3d-active" : ""}`}
          onClick={() => setCategoryFilter("")}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`filter-chip-3d ${categoryFilter === c.key ? "filter-chip-3d-active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === c.key ? "" : c.key)}
          >
            {c.label}
          </button>
        ))}
        <button
          className={`filter-chip-3d ${categoryFilter === "other" ? "filter-chip-3d-active" : ""}`}
          onClick={() => setCategoryFilter(categoryFilter === "other" ? "" : "other")}
        >
          Other
        </button>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="">All states</option>
          {NER_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p className="muted">Loading history…</p>}
      {!loading && filtered.length === 0 && <p className="muted">No matching events found.</p>}

      <div className="timeline-3d-track">
        {filtered.map((t) => (
          <button
            key={t.id}
            className={`timeline-3d-point ${t.verified ? "timeline-3d-point-verified" : ""} ${selected?.id === t.id ? "timeline-3d-point-selected" : ""}`}
            onClick={() => setSelected(selected?.id === t.id ? null : t)}
          >
            <span className="timeline-3d-glow" />
            <span className="timeline-3d-date muted">
              {t.publishedAt ? new Date(t.publishedAt).toLocaleDateString() : "Undated"}
            </span>
            <span className="timeline-3d-title">{t.title}</span>
            <span className="timeline-3d-tags">
              {t.category && <span className="pill">{categoryLabel(t.category)}</span>}
              {t.state && <span className="pill pill-source">{t.state}</span>}
              {t.verified && <span className="pill pill-verified">Verified</span>}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="history-detail-panel">
          <div className="history-detail-head">
            <h3>{selected.title}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="history-detail-grid">
            <DetailField label="Date" value={selected.publishedAt ? new Date(selected.publishedAt).toLocaleDateString() : null} />
            <DetailField label="State" value={selected.state} />
            <DetailField label="Category" value={categoryLabel(selected.category)} />
            <DetailField label="Source" value={selected.source} />
            {selected.verified && (
              <>
                <DetailField label="Deaths" value={selected.deaths} />
                <DetailField label="Missing" value={selected.missing} />
                <DetailField label="Injured" value={selected.injured} />
              </>
            )}
          </div>
          {selected.summary && <p>{selected.summary}</p>}
          {selected.url && (
            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Read Original Article →
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function DetailField({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="detail-stat">
      <div className="detail-stat-label">{label}</div>
      <div className="detail-stat-value">{value}</div>
    </div>
  );
}

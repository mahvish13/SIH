import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { NER_STATES, CATEGORIES, categoryLabel, enrichNewsItem } from "../newsUtils.js";

export default function NewsSection() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [paused, setPaused] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getNews();
      setNews(data);
    } catch (err) {
      console.error("Failed to load news:", err);
      setError("Live news data unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const enriched = useMemo(() => (news?.items || []).map((n) => enrichNewsItem(n)), [news]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((n) => {
      if (q && !n.title.toLowerCase().includes(q)) return false;
      if (stateFilter && n.state !== stateFilter) return false;
      if (typeFilter && n.category !== typeFilter) return false;
      return true;
    });
  }, [enriched, query, stateFilter, typeFilter]);

  // Duplicate the list once so the CSS scroll-loop can wrap seamlessly.
  const loopItems = filtered.length > 0 ? [...filtered, ...filtered] : [];
  const scrollDuration = Math.max(14, filtered.length * 3.2);

  return (
    <section className="card news-section">
      <div className="live-header">
        <h2>📰 News Headlines</h2>
        {news?.fetchedAt && (
          <span className="muted">
            <span className="live-dot" /> LIVE · Last updated {new Date(news.fetchedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <p className="muted">
        Real, current North-East India disaster headlines, updated automatically — fetched live, not written or
        summarized by this app.
      </p>

      <div className="news-filters news-filters-3d">
        <input type="text" placeholder="🔎 Search headlines…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="">All states</option>
          {NER_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
          <option value="other">Other</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && !news && <p className="muted">Loading real headlines…</p>}
      {news && filtered.length === 0 && <p className="muted">No matching real headlines found right now.</p>}

      {news && filtered.length > 0 && (
        <div
          className="news-ticker-vertical"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`news-ticker-vertical-track ${paused ? "news-ticker-paused" : ""}`}
            style={{ animationDuration: `${scrollDuration}s` }}
          >
            {loopItems.map((n, i) => (
              <a
                key={`${n.id}-${i}`}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-ticker-row"
              >
                <span className="news-ticker-date muted">
                  {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                </span>
                <span className="news-ticker-headline">{n.title}</span>
                <span className="news-ticker-src muted">{n.source || ""}</span>
              </a>
            ))}
          </div>
          <div className="news-ticker-fade-top" />
          <div className="news-ticker-fade-bottom" />
        </div>
      )}
    </section>
  );
}

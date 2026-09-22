import { useRef, useState } from "react";
import { DISASTER_TYPES, LANGUAGES, SAFETY_CONTENT, isAvailable } from "../safetyContent.js";

const PHASES = [
  { key: "before", label: "Before", icon: "🧭" },
  { key: "during", label: "During", icon: "⚠️" },
  { key: "after", label: "After", icon: "🧯" }
];

const LOW_CONFIDENCE_LANGS = ["mni", "kha", "lus"];

export default function SafetyGuidePage() {
  const [disaster, setDisaster] = useState("landslide");
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState(0); // 0=before,1=during,2=after
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState("next");
  const dragRef = useRef({ startX: 0, dragging: false });

  const lowConfidence = LOW_CONFIDENCE_LANGS.includes(lang);
  const available = isAvailable(disaster, lang);
  const content = available ? SAFETY_CONTENT[disaster][lang] : SAFETY_CONTENT[disaster]?.en;

  const turnTo = (nextPage, dir) => {
    if (nextPage < 0 || nextPage > 2 || flipping) return;
    setDirection(dir);
    setFlipping(true);
    setTimeout(() => setPage(nextPage), 190); // swap content at the midpoint of the rotation
    setTimeout(() => setFlipping(false), 380);
  };

  const changeDisaster = (key) => {
    setDisaster(key);
    setPage(0);
  };

  // Drag/swipe-to-turn: works with mouse or touch via pointer events.
  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, dragging: true };
  };
  const onPointerUp = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(delta) < 40) return; // too small to count as a swipe
    if (delta < 0) turnTo(page + 1, "next");
    else turnTo(page - 1, "prev");
  };

  return (
    <section className="card safety-book-page">
      <h1>🎓 Disaster Training &amp; Awareness</h1>
      <p className="muted">
        Select a hazard and language, then flip (click, or drag left/right) through Before / During / After
        guidance like a book. General safety guidance we've written for clarity — always check{" "}
        <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer">ndma.gov.in</a> for the authoritative
        version.
      </p>

      <div className="safety-selector-row">
        {DISASTER_TYPES.map((d) => (
          <button
            key={d.key}
            className={`filter-chip-3d ${disaster === d.key ? "filter-chip-3d-active" : ""}`}
            onClick={() => changeDisaster(d.key)}
          >
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      <div className="safety-selector-row">
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
      </div>

      {lowConfidence && (
        <div className="safety-lowconf-notice">
          ⚠️ We don't have a confident, accurate translation for this language yet. Rather than guess at
          safety-critical wording, we're showing English below instead. If you have reviewed text (or a link to an
          official NDMA-translated resource) for this language, share it and we'll add it directly.
        </div>
      )}

      <div
        className="safety-book"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <button className="book-nav book-nav-prev" onClick={() => turnTo(page - 1, "prev")} disabled={page === 0}>
          ‹
        </button>

        <div className="book-pages">
          <div className={`book-page ${flipping ? `book-page-flip-${direction}` : ""}`}>
            <div className="book-page-spine" />
            <div className="book-page-header">
              <span className="book-page-icon">{PHASES[page].icon}</span>
              <h2>{PHASES[page].label}</h2>
              <span className="book-page-number">Page {page + 1} of 3</span>
            </div>
            <ul className="book-page-list">
              {content?.[PHASES[page].key]?.map((point, i) => (
                <li key={i} className={point.startsWith("🚫") ? "book-item-dont" : "book-item-do"}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className="book-nav book-nav-next" onClick={() => turnTo(page + 1, "next")} disabled={page === 2}>
          ›
        </button>
      </div>

      <div className="book-dots">
        {PHASES.map((p, i) => (
          <button
            key={p.key}
            className={`book-dot ${i === page ? "book-dot-active" : ""}`}
            onClick={() => turnTo(i, i > page ? "next" : "prev")}
          />
        ))}
      </div>

      <section className="video-section">
        <h2>📺 Official Training Video</h2>
        <p className="muted">Verified official NDMA content — embedded directly from YouTube, not re-hosted.</p>
        <div className="video-embed">
          <iframe
            src="https://www.youtube.com/embed/0M9OMkDV3_k"
            title="NDMA India — Landslide: Are You Ready?"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="muted">
          More official disaster-response footage and training material:{" "}
          <a href="https://www.youtube.com/channel/UCnITGBejfoA1Gzgv_Cshgig" target="_blank" rel="noopener noreferrer">
            NDRF's official YouTube channel →
          </a>
        </p>
      </section>
    </section>
  );
}

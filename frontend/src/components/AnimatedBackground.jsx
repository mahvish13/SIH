// Purely decorative, fixed full-screen background. Each page gets its own themed
// variant so the site doesn't feel like one repeated background everywhere.
// CSS-only animation throughout — smooth on both desktop and mobile.

function TerrainTheme() {
  return (
    <>
      <div className="bg-sky bg-sky-terrain" />
      <svg className="bg-contours" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path className="contour c1" d="M-100,180 C300,120 500,260 900,180 S1300,80 1600,200" />
        <path className="contour c2" d="M-100,320 C350,260 600,400 950,320 S1350,220 1600,340" />
        <path className="contour c3" d="M-100,460 C300,420 650,540 1000,460 S1400,380 1600,480" />
      </svg>
      <svg className="bg-mountains bg-mountains-far" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,320 L120,220 L260,300 L420,160 L600,280 L780,180 L960,300 L1140,200 L1320,290 L1440,240 L1440,400 L0,400 Z" />
      </svg>
      <svg className="bg-mountains bg-mountains-mid" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,360 L160,260 L320,340 L500,220 L680,330 L860,240 L1040,340 L1220,250 L1440,320 L1440,400 L0,400 Z" />
      </svg>
      <svg className="bg-mountains bg-mountains-near" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0,400 L140,320 L300,380 L480,300 L660,390 L840,310 L1020,385 L1220,320 L1440,370 L1440,400 L0,400 Z" />
      </svg>
      <div className="bg-rain">
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: `${(i * 3.9) % 100}%`,
              animationDuration: `${1.1 + ((i * 13) % 9) / 10}s`,
              animationDelay: `${(i * 0.37) % 4}s`,
              opacity: 0.15 + ((i * 7) % 20) / 100
            }}
          />
        ))}
      </div>
      <div className="bg-particles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`bg-particle bg-particle-${(i % 7) + 1}`} />
        ))}
      </div>
    </>
  );
}

function SatelliteTheme() {
  return (
    <>
      <div className="bg-sky bg-sky-satellite" />
      <svg className="bg-grid" viewBox="0 0 1440 900" preserveAspectRatio="none">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 120} y1="0" x2={i * 120} y2="900" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="1440" y2={i * 100} />
        ))}
      </svg>
      <div className="bg-radar">
        <span className="radar-ring r1" />
        <span className="radar-ring r2" />
        <span className="radar-ring r3" />
        <span className="radar-sweep" />
      </div>
      <div className="bg-particles">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`bg-blip bg-blip-${(i % 5) + 1}`} />
        ))}
      </div>
    </>
  );
}

function StormTheme() {
  return (
    <>
      <div className="bg-sky bg-sky-storm" />
      <div className="bg-storm-clouds">
        <span className="storm-cloud sc1" />
        <span className="storm-cloud sc2" />
        <span className="storm-cloud sc3" />
      </div>
      <svg className="bg-lightning" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <polygon className="bolt bolt1" points="420,0 380,260 440,260 360,560 520,220 450,220 500,0" />
        <polygon className="bolt bolt2" points="1080,60 1030,320 1090,320 1000,620 1160,280 1090,280 1140,60" />
      </svg>
      <div className="bg-flash bg-flash-a" />
      <div className="bg-flash bg-flash-b" />
      <div className="bg-rain bg-rain-heavy">
        {Array.from({ length: 34 }).map((_, i) => (
          <span
            key={i}
            className="rain-drop rain-drop-storm"
            style={{
              left: `${(i * 3.0) % 100}%`,
              animationDuration: `${0.6 + ((i * 13) % 6) / 10}s`,
              animationDelay: `${(i * 0.21) % 3}s`,
              opacity: 0.25 + ((i * 7) % 25) / 100
            }}
          />
        ))}
      </div>
    </>
  );
}

function WaterTheme() {
  return (
    <>
      <div className="bg-sky bg-sky-water" />
      <div className="bg-shimmer" />
      <svg className="bg-waves" viewBox="0 0 1440 500" preserveAspectRatio="none">
        <path className="water-wave w1" d="M0,260 C240,320 480,200 720,260 C960,320 1200,200 1440,260 L1440,500 L0,500 Z" />
        <path className="water-wave w2" d="M0,320 C260,260 500,380 760,320 C1020,260 1260,380 1440,320 L1440,500 L0,500 Z" />
        <path className="water-wave w3" d="M0,380 C300,420 560,340 820,380 C1080,420 1300,340 1440,380 L1440,500 L0,500 Z" />
      </svg>
    </>
  );
}

const THEMES = { terrain: TerrainTheme, satellite: SatelliteTheme, storm: StormTheme, water: WaterTheme };

export default function AnimatedBackground({ theme = "terrain" }) {
  const ThemeContent = THEMES[theme] || TerrainTheme;
  return (
    <div className={`animated-bg theme-${theme}`} aria-hidden="true">
      <ThemeContent />
    </div>
  );
}

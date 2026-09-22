import { useEffect, useRef, useState } from "react";

const LEVEL_META = {
  CRITICAL: { color: "alert-row-critical", label: "🔴 CRITICAL" },
  HIGH: { color: "alert-row-high", label: "🟠 HIGH" },
  MEDIUM: { color: "alert-row-medium", label: "🟡 MEDIUM" },
  LOW: { color: "alert-row-low", label: "🟢 LOW" }
};

export default function LiveAlerts({ states }) {
  const [soundOn, setSoundOn] = useState(true);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const seenCriticalRef = useRef(new Set());
  const audioCtxRef = useRef(null);
  const activeTimeoutRef = useRef(null);
  const firstRunRef = useRef(true);

  // Reuse ONE AudioContext for the whole component instead of creating a
  // fresh one per buzz. Browsers block audio from an unlocked/suspended
  // context unless it was resumed during a real user gesture (a click) —
  // creating a brand-new context inside an automatic data-refresh effect
  // (not a click) is exactly the pattern browsers silently mute.
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  // Called from the toggle button's onClick — a genuine user gesture, so
  // this is where we actually unlock/resume the context for later
  // automatic use.
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    setUnlocked(true);
  };

  const playBuzzer = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        // Can't unlock from here (no user gesture) — the visual indicator
        // still fires so the alert isn't silently missed entirely.
        console.warn("Buzzer audio is locked — click the Buzzer button once to enable sound.");
      }
      const now = ctx.currentTime;
      [0, 0.28, 0.56].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.15, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });

      setBuzzerActive(true);
      clearTimeout(activeTimeoutRef.current);
      activeTimeoutRef.current = setTimeout(() => setBuzzerActive(false), 2500);
    } catch (err) {
      console.warn("Buzzer audio couldn't play:", err);
    }
  };

  const stopBuzzer = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
    }
    setBuzzerActive(false);
    clearTimeout(activeTimeoutRef.current);
  };

  const toggleSound = () => {
    if (!soundOn) unlockAudio(); // turning ON is a click — unlock right here
    else stopBuzzer(); // turning OFF should also silence anything currently playing
    setSoundOn((v) => !v);
  };

  const alerts = (states || [])
    .filter((s) => !s.dataInsufficient && s.alertLevel && s.alertLevel !== "LOW")
    .map((s) => ({
      id: s.region,
      state: s.region,
      level: s.alertLevel,
      condition: s.current?.condition,
      description: `AI risk ${s.risk}% — ${s.severity} landslide risk based on real rainfall, soil moisture and slope readings.`,
      timestamp: s.lastUpdated,
      status: "Active"
    }))
    .sort((a, b) => rank(b.level) - rank(a.level));

  useEffect(() => {
    // Only HIGH/CRITICAL ever trigger the buzzer — LOW and MEDIUM never do.
    const currentCritical = new Set(alerts.filter((a) => a.level === "HIGH" || a.level === "CRITICAL").map((a) => a.id));

    // Don't buzz for whatever's already active on the very first load —
    // only for a state that genuinely NEWLY crosses into HIGH/CRITICAL
    // after that, across any later refresh.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      seenCriticalRef.current = currentCritical;
      return;
    }

    let hasNew = false;
    currentCritical.forEach((id) => {
      if (!seenCriticalRef.current.has(id)) hasNew = true;
    });
    if (hasNew && soundOn) playBuzzer();
    seenCriticalRef.current = currentCritical;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states]);

  return (
    <section className="card">
      <div className="live-header">
        <h2>🚨 Live Alerts</h2>
        <div className="buzzer-controls">
          {buzzerActive && <span className="buzzer-active-badge">🔊 Buzzer Active</span>}
          <button className="btn btn-ghost btn-sm" onClick={toggleSound}>
            {soundOn ? "🔊 Buzzer On" : "🔇 Buzzer Off"}
          </button>
          {buzzerActive && (
            <button className="btn btn-danger btn-sm" onClick={stopBuzzer}>
              ✕ Stop
            </button>
          )}
        </div>
      </div>
      <p className="muted">
        Generated automatically from real per-state data above — not manually created. The buzzer sounds only when a
        state genuinely newly crosses into HIGH or CRITICAL (not on every refresh, and never for LOW/MEDIUM).
        {!unlocked && soundOn && " Click the Buzzer button once so your browser allows the sound to play."}
      </p>

      {alerts.length === 0 && <p className="muted">No active MEDIUM+ alerts right now — all monitored states are LOW risk.</p>}

      <div className="alert-list">
        {alerts.map((a) => (
          <div key={a.id} className={`alert-row ${LEVEL_META[a.level].color}`}>
            <div className="alert-row-top">
              <span className="alert-row-level">{LEVEL_META[a.level].label}</span>
              <span className="alert-row-state">{a.state}</span>
              <span className="alert-row-status">{a.status}</span>
            </div>
            <div className="alert-row-desc">{a.description}</div>
            <div className="muted alert-row-time">{new Date(a.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function rank(level) {
  return { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 }[level] ?? 0;
}

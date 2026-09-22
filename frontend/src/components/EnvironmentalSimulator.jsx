import { useMemo, useState } from "react";
import { api } from "../api.js";

const DEFAULTS = { rainfall: 132, soilMoisture: 81, slope: 13, previousLandslide: false };

// Mirrors backend/utils/riskModel.js so the dashboard gives instant feedback as
// sliders move, instead of showing a stale risk value from the last "Send".
// Rainfall is the trigger: below MODERATE_RAIN_MM, soil/slope/history only count
// a fraction of their weight, so "less rainfall" realistically reads as Low.
const MODERATE_RAIN_MM = 150;
const RAIN_GATE_MIN = 0.3;

function previewRisk({ rainfall, soilMoisture, slope, previousLandslide }) {
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const rainfallScore = clamp((rainfall / 300) * 45, 0, 45);
  const rainGate = clamp(rainfall / MODERATE_RAIN_MM, RAIN_GATE_MIN, 1);
  const soilScore = clamp((soilMoisture / 100) * 20, 0, 20) * rainGate;
  const slopeScore = clamp((slope / 60) * 20, 0, 20) * rainGate;
  const historyScore = (previousLandslide ? 15 : 0) * rainGate;
  const risk = Math.round(clamp(rainfallScore + soilScore + slopeScore + historyScore, 0, 100));
  const severity = risk >= 70 ? "High" : risk >= 40 ? "Medium" : "Low";
  return { risk, severity };
}

export default function EnvironmentalSimulator({ onSend, sending, region }) {
  const [values, setValues] = useState(DEFAULTS);
  const [error, setError] = useState("");
  const [fetchingSatellite, setFetchingSatellite] = useState(false);
  const [satelliteInfo, setSatelliteInfo] = useState(null); // { sources: {}, warnings: [], fetchedAt }
  const [simulatingDisaster, setSimulatingDisaster] = useState(false);
  const preview = useMemo(() => previewRisk(values), [values]);

  const update = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: Number(e.target.value) }));
    setSatelliteInfo(null); // manual tweak after a real fetch — no longer purely "real"
  };

  const reset = () => {
    setValues(DEFAULTS);
    setError("");
    setSatelliteInfo(null);
  };

  const requireRegion = () => {
    if (!region) {
      setError("Pick a region in the card above first, so this reading is tied to a real place.");
      return false;
    }
    setError("");
    return true;
  };

  const send = () => {
    if (!requireRegion()) return;
    onSend({ ...values, region }, { label: "Send Data to Backend" });
  };

  const simulateDisaster = async () => {
    if (!requireRegion()) return;
    setSimulatingDisaster(true);
    setError("");

    // Escalates this region's own real satellite baseline into a severe
    // scenario, instead of sending the same fixed 260/92/45 every time —
    // so "disaster in Nagaland" and "disaster in Mizoram" differ, driven by
    // each region's actual current rainfall/soil/slope reading.
    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
    let baseline = null;
    try {
      baseline = await api.getSatelliteData(region);
    } catch {
      baseline = null; // fall through to fixed fallback below
    }

    const disaster =
      baseline && (baseline.rainfall != null || baseline.soilMoisture != null || baseline.slope != null)
        ? {
            rainfall: clamp((baseline.rainfall ?? 100) * 1.8 + 60, 220, 300),
            soilMoisture: clamp((baseline.soilMoisture ?? 60) + 25, 85, 100),
            slope: clamp((baseline.slope ?? 20) + 15, 30, 60),
            previousLandslide: true
          }
        : { rainfall: 260, soilMoisture: 92, slope: 45, previousLandslide: true }; // fallback if satellite sources unreachable

    setValues(disaster);
    setSatelliteInfo(
      baseline
        ? {
            rainfallSource: baseline.rainfallSource && `${baseline.rainfallSource} (escalated)`,
            soilMoistureSource: baseline.soilMoistureSource && `${baseline.soilMoistureSource} (escalated)`,
            slopeSource: baseline.slopeSource && `${baseline.slopeSource} (escalated)`,
            warnings: baseline.warnings || [],
            fetchedAt: baseline.fetchedAt
          }
        : null
    );
    setSimulatingDisaster(false);
    onSend({ ...disaster, region }, { label: "Simulate Disaster Conditions" });
  };

  const pullRealData = async () => {
    if (!requireRegion()) return;
    setFetchingSatellite(true);
    setError("");
    try {
      const data = await api.getSatelliteData(region);
      setValues((v) => ({
        ...v,
        rainfall: data.rainfall ?? v.rainfall,
        soilMoisture: data.soilMoisture ?? v.soilMoisture,
        slope: data.slope ?? v.slope
      }));
      setSatelliteInfo({
        rainfallSource: data.rainfallSource,
        soilMoistureSource: data.soilMoistureSource,
        slopeSource: data.slopeSource,
        warnings: data.warnings || [],
        fetchedAt: data.fetchedAt
      });
    } catch (err) {
      setError(`Couldn't reach real satellite data sources: ${err.message}`);
    } finally {
      setFetchingSatellite(false);
    }
  };

  return (
    <section className="card">
      <h2>🎛️ Environmental Data Simulator</h2>
      <p className="muted">
        {region ? (
          <>
            Set conditions for <strong>{region}</strong> and send them to the backend, or pull real readings below —
            rainfall and soil moisture from Open-Meteo (modeled), slope from Open-Meteo's SRTM-derived elevation
            API. Sliders stay editable after a real pull. "Simulate Disaster" escalates this region's own real
            baseline into a severe scenario, so it varies by region instead of always landing on the same number.
          </>
        ) : (
          "Pick a region in the card above, then set conditions here and send them to the backend."
        )}
      </p>

      {error && <div className="form-error">{error}</div>}

      {region && (
        <div className="satellite-pull-row">
          <button className="btn btn-secondary" disabled={fetchingSatellite || sending} onClick={pullRealData}>
            {fetchingSatellite ? "📡 Fetching real data…" : "🛰️ Pull Real Satellite Data"}
          </button>
          {satelliteInfo && (
            <div className="muted satellite-info">
              {satelliteInfo.rainfallSource && <div>Rainfall: {satelliteInfo.rainfallSource}</div>}
              {satelliteInfo.soilMoistureSource && <div>Soil moisture: {satelliteInfo.soilMoistureSource}</div>}
              {satelliteInfo.slopeSource && <div>Slope: {satelliteInfo.slopeSource}</div>}
              {satelliteInfo.warnings?.length > 0 && (
                <div className="form-error">
                  Some sources were unreachable, kept prior values for those: {satelliteInfo.warnings.join("; ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="preview-risk-row">
        <span className="muted">Live preview as you adjust the sliders:</span>
        <span className={`risk-badge risk-badge-${preview.severity.toLowerCase()}`}>
          {preview.risk}% — {preview.severity}
        </span>
      </div>

      <div className="sliders">
        <div className="slider-block">
          <label>🌧️ Rainfall</label>
          <input type="range" min="0" max="300" value={values.rainfall} onChange={update("rainfall")} />
          <span>{values.rainfall} mm</span>
        </div>
        <div className="slider-block">
          <label>💧 Soil Moisture</label>
          <input type="range" min="0" max="100" value={values.soilMoisture} onChange={update("soilMoisture")} />
          <span>{values.soilMoisture} %</span>
        </div>
        <div className="slider-block">
          <label>🏔️ Slope</label>
          <input type="range" min="0" max="60" value={values.slope} onChange={update("slope")} />
          <span>{values.slope} °</span>
        </div>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={values.previousLandslide}
          onChange={(e) => setValues((v) => ({ ...v, previousLandslide: e.target.checked }))}
        />
        Previous landslide recorded here
      </label>

      <div className="button-row">
        <button className="btn btn-primary" disabled={sending} onClick={send}>
          📡 Send Data to Backend
        </button>
        <button className="btn btn-danger" disabled={sending || simulatingDisaster} onClick={simulateDisaster}>
          {simulatingDisaster ? "⚠️ Escalating region data…" : "⚠️ Simulate Disaster Conditions"}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          ↺ Reset
        </button>
      </div>
    </section>
  );
}

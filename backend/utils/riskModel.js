// Simple weighted risk model.
// This stands in for a trained ML model in the prototype — swap `computeRisk`
// for a call to your real model (or a Python microservice) once you have one.
//
// Rainfall is treated as the trigger, not just one factor among equals: without
// meaningful rain, even saturated soil / steep slope / prior-landslide ground
// only contributes a small fraction of its weight (RAIN_GATE_MIN below), so a
// "less rainfall" reading realistically lands in Low — not stuck at whatever a
// previous "disaster" simulation showed. As rainfall rises past MODERATE_RAIN_MM
// the other factors count in full, so a genuinely saturated, steep, previously
// unstable slope with heavy rain can still reach High.
//
//   rainfall     -> up to 45 points (heavier, recent rain is the biggest driver)
//   soilMoisture -> up to 20 points, scaled by the rain gate
//   slope        -> up to 20 points, scaled by the rain gate
//   previous landslide on record -> up to 15 points, scaled by the rain gate

const MODERATE_RAIN_MM = 150; // rain level at which other factors count in full
const RAIN_GATE_MIN = 0.3; // even at zero rain, static ground conditions still count a little

export function computeRisk({ rainfall = 0, soilMoisture = 0, slope = 0, previousLandslide = false }) {
  const rainfallScore = clamp((rainfall / 300) * 45, 0, 45);
  const rainGate = clamp(rainfall / MODERATE_RAIN_MM, RAIN_GATE_MIN, 1);

  const soilScore = clamp((soilMoisture / 100) * 20, 0, 20) * rainGate;
  const slopeScore = clamp((slope / 60) * 20, 0, 20) * rainGate;
  const historyScore = (previousLandslide ? 15 : 0) * rainGate;

  const raw = rainfallScore + soilScore + slopeScore + historyScore;
  const risk = Math.round(clamp(raw, 0, 100));

  return {
    risk,
    severity: severityFor(risk),
    breakdown: {
      rainfallScore: Math.round(rainfallScore),
      soilScore: Math.round(soilScore),
      slopeScore: Math.round(slopeScore),
      historyScore: Math.round(historyScore)
    },
    recommendations: recommendationsFor(risk)
  };
}

export function severityFor(risk) {
  if (risk >= 70) return "High";
  if (risk >= 40) return "Medium";
  return "Low";
}

// 4-level classification for the Live Alerts panel (LOW/MEDIUM/HIGH/CRITICAL),
// kept separate from severityFor() above (Low/Medium/High) so existing zone-map
// colouring isn't affected by adding a 4th tier.
export function alertLevelFor(risk) {
  if (risk >= 80) return "CRITICAL";
  if (risk >= 55) return "HIGH";
  if (risk >= 30) return "MEDIUM";
  return "LOW";
}

function recommendationsFor(risk) {
  if (risk >= 70) {
    return [
      "Alert responsible authorities",
      "Closely monitor vulnerable locations",
      "Prepare emergency response teams",
      "Consider restricting access to risky areas"
    ];
  }
  if (risk >= 40) {
    return [
      "Increase monitoring frequency in the area",
      "Notify local disaster management contacts",
      "Advise caution to nearby residents and road users"
    ];
  }
  return [
    "Continue routine monitoring",
    "No immediate action required"
  ];
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

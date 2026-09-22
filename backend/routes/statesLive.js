import { Router } from "express";
import {
  REGION_COORDS,
  fetchRegionWeatherBundle,
  fetchTerrainSlope,
  fetchDailyHistory
} from "../utils/satelliteData.js";
import { computeRisk, alertLevelFor } from "../utils/riskModel.js";

const router = Router();
const REGIONS = Object.keys(REGION_COORDS);

// Fetches everything needed to render one state's card in just 2 real
// requests (down from 4): one combined Open-Meteo call for rainfall + soil
// moisture + current weather, and one Open-Meteo Elevation call for slope.
// fetchRegionWeatherBundle() already retries transient 429/503 with backoff
// internally (see utils/satelliteData.js).
async function loadRegion(region) {
  const [bundleR, slopeR] = await Promise.allSettled([
    fetchRegionWeatherBundle(region),
    fetchTerrainSlope(region)
  ]);

  const warnings = [];
  const inputs = {};

  if (bundleR.status === "fulfilled") {
    inputs.rainfall = bundleR.value.rainfall;
    inputs.soilMoisture = bundleR.value.soilMoisture;
  } else {
    warnings.push(`rainfall/soil moisture: ${bundleR.reason.message}`);
  }

  if (slopeR.status === "fulfilled") inputs.slope = slopeR.value.slope;
  else warnings.push(`slope: ${slopeR.reason.message}`);

  const haveAllRiskInputs = inputs.rainfall != null && inputs.soilMoisture != null && inputs.slope != null;

  if (warnings.length > 0) {
    console.warn(`[states-live] ${region}: ${warnings.join(" | ")}`);
  }

  const current =
    bundleR.status === "fulfilled"
      ? {
          temperature: bundleR.value.temperature,
          humidity: bundleR.value.humidity,
          windSpeed: bundleR.value.windSpeed,
          rainfall: bundleR.value.currentRainfall,
          condition: bundleR.value.condition
        }
      : null;

  let riskResult = null;
  if (haveAllRiskInputs) {
    riskResult = computeRisk({ ...inputs, previousLandslide: false });
  }

  return {
    region,
    dataInsufficient: !haveAllRiskInputs,
    current,
    inputs: haveAllRiskInputs ? inputs : null,
    risk: riskResult?.risk ?? null,
    severity: riskResult?.severity ?? null,
    alertLevel: riskResult ? alertLevelFor(riskResult.risk) : null,
    recommendations: riskResult?.recommendations ?? null,
    warnings,
    lastUpdated: new Date().toISOString()
  };
}

// Loads all 8 regions in small batches rather than firing all 16 requests
// (8 regions x 2 calls) at once — this is the other half of the 429/503
// fix: fewer *and* less bursty.
async function loadAllRegions() {
  const BATCH_SIZE = 3;
  const results = [];
  for (let i = 0; i < REGIONS.length; i += BATCH_SIZE) {
    const batch = REGIONS.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((r) =>
        loadRegion(r).catch((err) => ({
          region: r,
          dataInsufficient: true,
          warnings: [err.message],
          lastUpdated: new Date().toISOString()
        }))
      )
    );
    results.push(...batchResults);
    if (i + BATCH_SIZE < REGIONS.length) {
      await new Promise((r) => setTimeout(r, 250)); // brief gap between batches
    }
  }
  return results;
}

// GET /api/states-live — all 8 states, throttled in batches, real data only.
router.get("/", async (_req, res) => {
  const results = await loadAllRegions();
  res.json({ states: results, fetchedAt: new Date().toISOString() });
});

// GET /api/states-live/:region — single state detail.
router.get("/:region", async (req, res) => {
  const { region } = req.params;
  if (!REGION_COORDS[region]) {
    return res.status(404).json({ error: `Unknown region "${region}"` });
  }
  try {
    const result = await loadRegion(region);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/states-live/:region/charts — real 24h forecast + real 7-day history.
router.get("/:region/charts", async (req, res) => {
  const { region } = req.params;
  if (!REGION_COORDS[region]) {
    return res.status(404).json({ error: `Unknown region "${region}"` });
  }

  const [bundleR, historyR] = await Promise.allSettled([
    fetchRegionWeatherBundle(region),
    fetchDailyHistory(region)
  ]);

  const out = { region, fetchedAt: new Date().toISOString(), warnings: [] };

  if (bundleR.status === "fulfilled") {
    out.hourly = bundleR.value.hourly;
    out.hourlySource = bundleR.value.source;
  } else {
    out.hourly = [];
    out.warnings.push(`Hourly forecast: ${bundleR.reason.message}`);
  }

  if (historyR.status === "fulfilled") {
    out.daily = historyR.value.days;
    out.dailySource = historyR.value.source;
  } else {
    out.daily = [];
    out.warnings.push(`Daily history: ${historyR.reason.message}`);
  }

  if (out.hourly.length === 0 && out.daily.length === 0) {
    return res.status(502).json({ error: "Chart data sources are currently unreachable.", warnings: out.warnings });
  }

  res.json(out);
});

export default router;

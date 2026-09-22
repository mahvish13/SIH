import { Router } from "express";
import { fetchRegionWeatherBundle, fetchTerrainSlope, REGION_COORDS } from "../utils/satelliteData.js";

const router = Router();

// Pulls real rainfall, soil moisture, and terrain slope for a region and
// returns them in the shape the Environmental Simulator's sliders expect.
// Rainfall + soil moisture come from one combined Open-Meteo request;
// slope from a separate Open-Meteo Elevation call. Each is fetched
// independently (Promise.allSettled) so one failing source doesn't block
// the other — the response says exactly which fields came back real and
// which are missing, rather than silently substituting a mock number.
router.get("/:region", async (req, res) => {
  const { region } = req.params;

  if (!REGION_COORDS[region]) {
    return res.status(400).json({ error: `No coordinates on file for region "${region}"` });
  }

  const [bundleResult, slopeResult] = await Promise.allSettled([
    fetchRegionWeatherBundle(region),
    fetchTerrainSlope(region)
  ]);

  const warnings = [];
  const out = { region, fetchedAt: new Date().toISOString() };

  if (bundleResult.status === "fulfilled") {
    out.rainfall = bundleResult.value.rainfall;
    out.rainfallSource = bundleResult.value.source;
    out.soilMoisture = bundleResult.value.soilMoisture;
    out.soilMoistureSource = bundleResult.value.source;
  } else {
    warnings.push(`Rainfall/soil moisture: ${bundleResult.reason.message}`);
  }

  if (slopeResult.status === "fulfilled") {
    out.slope = slopeResult.value.slope;
    out.slopeSource = slopeResult.value.source;
  } else {
    warnings.push(`Slope: ${slopeResult.reason.message}`);
  }

  out.warnings = warnings;
  out.allSucceeded = warnings.length === 0;

  // Only fail the whole request if every source failed.
  if (bundleResult.status !== "fulfilled" && slopeResult.status !== "fulfilled") {
    return res.status(502).json({ error: "All real satellite data sources are currently unreachable.", warnings });
  }

  res.json(out);
});

export default router;

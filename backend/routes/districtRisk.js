import { Router } from "express";
import { fetchRegionWeatherBundle, fetchTerrainSlope } from "../utils/satelliteData.js";
import { computeRisk, alertLevelFor } from "../utils/riskModel.js";

const router = Router();

// GET /api/district-risk?lat=..&lng=..&name=..&state=..
// On-demand real current-risk computation for an arbitrary point (a district
// centroid from the real boundary GeoJSON, or a Find Safe Place candidate).
// Not pre-computed for every location — fetched live only when actually
// requested, to stay within free-API rate limits.
router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const name = req.query.name || "Selected location";
  const state = req.query.state || null;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required and must be numbers" });
  }

  const coords = { lat, lng };
  const [bundleR, slopeR] = await Promise.allSettled([
    fetchRegionWeatherBundle(coords),
    fetchTerrainSlope(coords)
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

  const haveAll = inputs.rainfall != null && inputs.soilMoisture != null && inputs.slope != null;

  if (!haveAll) {
    return res.json({
      name,
      state,
      lat,
      lng,
      dataInsufficient: true,
      warnings,
      lastUpdated: new Date().toISOString()
    });
  }

  const result = computeRisk({ ...inputs, previousLandslide: false });

  res.json({
    name,
    state,
    lat,
    lng,
    dataInsufficient: false,
    inputs,
    risk: result.risk,
    severity: result.severity,
    alertLevel: alertLevelFor(result.risk),
    recommendations: result.recommendations,
    warnings,
    lastUpdated: new Date().toISOString()
  });
});

export default router;

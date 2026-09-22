import { Router } from "express";
import {
  fetchSatelliteRainfall,
  fetchSatelliteSoilMoisture,
  fetchTerrainSlope,
  fetchWeatherDetails
} from "../utils/satelliteData.js";

const router = Router();

// GET /api/diagnostics — visit this directly in a browser (or run
// `curl http://localhost:5000/api/diagnostics`) to see exactly which real
// data connections succeed or fail, with the real error message for each.
// Uses Meghalaya's coordinates as a single test point.
router.get("/", async (_req, res) => {
  const testRegion = "Meghalaya";
  const checks = [
    { name: "Open-Meteo — Rainfall", fn: () => fetchSatelliteRainfall(testRegion) },
    { name: "Open-Meteo — Soil Moisture", fn: () => fetchSatelliteSoilMoisture(testRegion) },
    { name: "Open-Meteo — Elevation/Slope", fn: () => fetchTerrainSlope(testRegion) },
    { name: "Open-Meteo — Current Weather", fn: () => fetchWeatherDetails(testRegion) }
  ];

  const results = await Promise.all(
    checks.map(async (c) => {
      const startedAt = Date.now();
      try {
        const data = await c.fn();
        return { name: c.name, ok: true, tookMs: Date.now() - startedAt, sample: data };
      } catch (err) {
        return { name: c.name, ok: false, tookMs: Date.now() - startedAt, error: err.message };
      }
    })
  );

  const allOk = results.every((r) => r.ok);

  res.status(allOk ? 200 : 502).json({
    allOk,
    testedAt: new Date().toISOString(),
    testRegion,
    results,
    note: allOk
      ? "All real data connections are working."
      : "One or more connections failed — check the 'error' field on each failed check above. If every check fails with a timeout or network error, it usually means outbound internet access to api.open-meteo.com is blocked from wherever this backend is running (firewall, antivirus, or hosting provider restriction)."
  });
});

export default router;

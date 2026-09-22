import { Router } from "express";
import { computeRisk } from "../utils/riskModel.js";

const router = Router();

// In-memory log of the last N readings, powers the "System Activity" feed
// and the "Historical Trend" panel on the frontend.
const activityLog = [];
const MAX_LOG = 50;

router.post("/predict", (req, res) => {
  const { rainfall, soilMoisture, slope, previousLandslide, lat, lng, region } = req.body || {};

  if ([rainfall, soilMoisture, slope].some((v) => typeof v !== "number")) {
    return res.status(400).json({ error: "rainfall, soilMoisture and slope must be numbers" });
  }

  const result = computeRisk({ rainfall, soilMoisture, slope, previousLandslide: !!previousLandslide });

  const entry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    rainfall,
    soilMoisture,
    slope,
    previousLandslide: !!previousLandslide,
    lat: lat ?? null,
    lng: lng ?? null,
    region: region || null,
    ...result
  };

  activityLog.unshift(entry);
  if (activityLog.length > MAX_LOG) activityLog.pop();

  res.json(entry);
});

router.get("/activity", (_req, res) => {
  res.json(activityLog);
});

export default router;

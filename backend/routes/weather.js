import { Router } from "express";
import { severityFor } from "../utils/riskModel.js";
import { fetchForecast, REGION_COORDS } from "../utils/satelliteData.js";

const router = Router();

// Real hourly precipitation forecast from Open-Meteo, with a per-hour risk
// score layered on top by our own model (Open-Meteo gives rainfall, not a
// landslide risk number). Falls back to a clearly-labelled mock series if
// the free API is unreachable, so the dashboard still has something to show
// on a sandboxed/offline host.
router.get("/:region", async (req, res) => {
  const { region } = req.params;

  if (!REGION_COORDS[region]) {
    return res.status(400).json({ error: `No coordinates on file for region "${region}"` });
  }

  try {
    const { hours: realHours, source } = await fetchForecast(region);
    const hours = realHours.map((h) => {
      const rainfall = h.rainfall ?? 0;
      const risk = Math.min(95, Math.round((rainfall / 60) * 100));
      return {
        time: new Date(h.time).toTimeString().slice(0, 5),
        rainfall,
        risk,
        severity: severityFor(risk)
      };
    });
    res.json({ region, hours, source, live: true });
  } catch (err) {
    const hours = mockHours();
    res.json({ region, hours, source: "mock (live forecast unreachable, fallback)", live: false, error: err.message });
  }
});

function mockHours() {
  const now = new Date();
  const hours = [];
  for (let i = 0; i < 8; i++) {
    const t = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const rainfall = +(10 + Math.random() * 55).toFixed(1);
    const risk = Math.min(95, Math.round((rainfall / 60) * 100 * (0.6 + Math.random() * 0.5)));
    hours.push({ time: t.toTimeString().slice(0, 5), rainfall, risk, severity: severityFor(risk) });
  }
  return hours;
}

export default router;

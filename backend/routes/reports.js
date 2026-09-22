import { Router } from "express";

const router = Router();

// In-memory field report store. Swap for a real DB (Mongo/Postgres) in Phase 1.
let reports = [
  {
    id: "report-1",
    source: "Citizen",
    lat: 17.394462,
    lng: 78.492224,
    severity: "Medium",
    description: "Large cracks observed near the roadside slope. Small rocks are falling onto the road.",
    attachment: "landslides-caused-by-heavy-rains.avif",
    submittedAt: "2026-08-25T13:24:24.000Z"
  }
];

router.get("/", (_req, res) => {
  res.json(reports);
});

router.post("/", (req, res) => {
  const { source, lat, lng, severity, description, attachment, photo } = req.body || {};

  if (typeof lat !== "number" || typeof lng !== "number" || !description) {
    return res.status(400).json({ error: "lat, lng and description are required" });
  }

  const report = {
    id: `report-${Date.now()}`,
    source: source === "Official" ? "Official" : "Citizen",
    lat,
    lng,
    severity: severity || "Medium",
    description,
    attachment: attachment || null,
    photo: typeof photo === "string" ? photo : null,
    submittedAt: new Date().toISOString()
  };

  reports = [report, ...reports];
  res.status(201).json(report);
});

export default router;

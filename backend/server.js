import express from "express";
import cors from "cors";

import riskRoutes from "./routes/risk.js";
import reportRoutes from "./routes/reports.js";
import weatherRoutes from "./routes/weather.js";
import zoneRoutes from "./routes/zones.js";
import satelliteRoutes from "./routes/satellite.js";
import statesLiveRoutes from "./routes/statesLive.js";
import historyRoutes from "./routes/history.js";
import districtRiskRoutes from "./routes/districtRisk.js";
import newsRoutes from "./routes/news.js";
import safePlacesRoutes from "./routes/safePlaces.js";
import diagnosticsRoutes from "./routes/diagnostics.js";
import reverseGeocodeRoutes from "./routes/reverseGeocode.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "6mb" })); // field-report photos are base64-encoded JSON

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "NER Disaster Monitoring backend" });
});

app.use("/api/risk", riskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/satellite", satelliteRoutes);
app.use("/api/states-live", statesLiveRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/district-risk", districtRiskRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/safe-places", safePlacesRoutes);
app.use("/api/diagnostics", diagnosticsRoutes);
app.use("/api/reverse-geocode", reverseGeocodeRoutes);

app.listen(PORT, () => {
  console.log(`NER Disaster Monitoring backend running on http://localhost:${PORT}`);
});

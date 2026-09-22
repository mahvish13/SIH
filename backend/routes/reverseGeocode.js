import { Router } from "express";

const router = Router();

// GET /api/reverse-geocode?lat=..&lng=..
// Real reverse geocoding via OpenStreetMap's Nominatim — free, no key.
// Nominatim's usage policy requires a real User-Agent identifying the app,
// which is set below, and expects this to be called server-side (not
// directly from a browser), which is why this proxies through our backend.
router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required and must be numbers" });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "NER-Disaster-Monitoring-System/1.0 (student hackathon project)" },
      signal: controller.signal
    });
    if (!upstream.ok) throw new Error(`Nominatim responded ${upstream.status}`);
    const data = await upstream.json();
    const addr = data?.address || {};

    res.json({
      lat,
      lng,
      district: addr.state_district || addr.county || addr.district || null,
      state: addr.state || null,
      displayName: data?.display_name || null,
      source: "OpenStreetMap Nominatim (real reverse geocoding)"
    });
  } catch (err) {
    console.error("Reverse geocode failed:", err.message);
    res.status(502).json({ error: "Couldn't reach the reverse geocoding source right now." });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;

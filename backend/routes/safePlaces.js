import { Router } from "express";
import { fetchRegionWeatherBundle, fetchTerrainSlope } from "../utils/satelliteData.js";
import { computeRisk, alertLevelFor } from "../utils/riskModel.js";

const router = Router();
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const ALLOWED_RADII_M = [5000, 10000, 20000];
const RISK_CHECK_LIMIT = 5; // only the nearest N get real risk + route data — protects Open-Meteo from a burst

const TYPE_META = {
  assembly_point: { label: "Emergency Assembly Point", icon: "📍", category: "shelter", officialish: true },
  shelter: { label: "Shelter", icon: "🏕️", category: "shelter", officialish: true },
  community_centre: { label: "Community Centre", icon: "🏛️", category: "shelter", officialish: false },
  school: { label: "School (not an official shelter unless confirmed)", icon: "🏫", category: "shelter", officialish: false },
  hospital: { label: "Hospital", icon: "🏥", category: "hospital", officialish: false },
  fire_station: { label: "Fire Station", icon: "🚒", category: "fire", officialish: false },
  police: { label: "Police Station", icon: "🚓", category: "police", officialish: false }
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classify(tags) {
  if (tags.emergency === "assembly_point") return "assembly_point";
  if (tags.amenity === "shelter") return "shelter";
  if (tags.amenity === "community_centre") return "community_centre";
  if (tags.amenity === "hospital") return "hospital";
  if (tags.amenity === "school") return "school";
  if (tags.amenity === "fire_station") return "fire_station";
  if (tags.amenity === "police") return "police";
  return null;
}

// Real route distance/duration from OSRM's free public demo routing
// server — genuine road-network routing, not a straight-line guess. The
// demo server is rate-limited too, so this is only called for a handful of
// nearest candidates, one at a time (not in parallel).
async function fetchRoute(origin, dest) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`OSRM responded ${res.status}`);
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) throw new Error("No route found");
    return {
      distanceKm: +(route.distance / 1000).toFixed(2),
      durationMin: Math.round(route.duration / 60),
      source: "OSRM (project-osrm.org) — real road-network routing"
    };
  } catch (err) {
    return { error: err.message };
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/safe-places?lat=..&lng=..&radius=5000|10000|20000
router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const requestedRadius = Number(req.query.radius);
  const radius = ALLOWED_RADII_M.includes(requestedRadius) ? requestedRadius : 20000;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required and must be numbers" });
  }

  const query = `
    [out:json][timeout:20];
    (
      node["emergency"="assembly_point"](around:${radius},${lat},${lng});
      node["amenity"="shelter"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      way["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="school"](around:${radius},${lat},${lng});
      node["amenity"="fire_station"](around:${radius},${lat},${lng});
      way["amenity"="fire_station"](around:${radius},${lat},${lng});
      node["amenity"="police"](around:${radius},${lat},${lng});
      way["amenity"="police"](around:${radius},${lat},${lng});
    );
    out center 60;
  `;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const upstream = await fetch(OVERPASS_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal
    });
    if (!upstream.ok) throw new Error(`Overpass API responded ${upstream.status}`);
    const data = await upstream.json();

    let places = (data.elements || [])
      .map((el) => {
        const type = classify(el.tags || {});
        if (!type) return null;
        const placeLat = el.lat ?? el.center?.lat;
        const placeLng = el.lon ?? el.center?.lon;
        if (placeLat == null || placeLng == null) return null;
        const name = el.tags?.name || null;
        const meta = TYPE_META[type];
        return {
          id: `osm-${el.type}-${el.id}`,
          name,
          type,
          category: meta.category,
          typeLabel: meta.label,
          icon: meta.icon,
          // Honest, conservative: OSM tagging alone never confirms official
          // government designation. We only ever say "OSM-tagged as an
          // emergency point," never "officially designated."
          osmTaggedAsEmergencyPoint: meta.officialish,
          lat: placeLat,
          lng: placeLng,
          distanceKm: +haversineKm(lat, lng, placeLat, placeLng).toFixed(2),
          risk: null, // filled in below for the nearest few only
          route: null,
          status: null,
          lastUpdated: null,
          roadStatus: null
        };
      })
      .filter(Boolean)
      .filter((p) => p.name)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

    // Real current risk + real route, for the nearest few only — sequential,
    // not parallel, to avoid re-triggering the exact rate-limit issue this
    // pipeline was just fixed for.
    const toEnrich = places.slice(0, RISK_CHECK_LIMIT);
    for (const place of toEnrich) {
      try {
        const [bundle, slope] = await Promise.all([
          fetchRegionWeatherBundle({ lat: place.lat, lng: place.lng }),
          fetchTerrainSlope({ lat: place.lat, lng: place.lng })
        ]);
        const result = computeRisk({
          rainfall: bundle.rainfall,
          soilMoisture: bundle.soilMoisture,
          slope: slope.slope,
          previousLandslide: false
        });
        place.risk = { value: result.risk, severity: result.severity, alertLevel: alertLevelFor(result.risk) };
      } catch (err) {
        place.risk = { error: err.message };
      }

      const route = await fetchRoute({ lat, lng }, { lat: place.lat, lng: place.lng });
      place.route = route;
    }

    // Recommend the safest reachable place among the ones we actually
    // checked — lowest real risk first, distance as tiebreaker. Never
    // recommends from the unchecked remainder (we don't have real risk for
    // those, so we can't honestly compare them).
    const checked = toEnrich.filter((p) => p.risk && typeof p.risk.value === "number");
    let recommended = null;
    if (checked.length > 0) {
      const best = [...checked].sort((a, b) => a.risk.value - b.risk.value || a.distanceKm - b.distanceKm)[0];
      recommended = {
        id: best.id,
        reason:
          checked.length > 1
            ? `Recommended over ${checked.length - 1} other nearby checked location(s) because it currently has the lowest real risk reading (${best.risk.value}%, ${best.risk.severity}) among places we checked, at ${best.distanceKm}km.`
            : `Only location with a real risk reading available (${best.risk.value}%, ${best.risk.severity}) at ${best.distanceKm}km.`
      };
    }

    res.json({
      places,
      recommended,
      riskCheckedCount: toEnrich.length,
      totalFound: places.length,
      radius,
      origin: { lat, lng },
      fetchedAt: new Date().toISOString(),
      source: "OpenStreetMap / Overpass API for locations; Open-Meteo for real current risk; OSRM for real routing",
      note:
        places.length > RISK_CHECK_LIMIT
          ? `Real risk and route data was only computed for the nearest ${RISK_CHECK_LIMIT} locations, to avoid overloading the free weather API with a burst of requests. The rest are shown with distance only.`
          : null
    });
  } catch (err) {
    console.error("Safe-place search failed:", err.message);
    res.status(502).json({ error: "Couldn't reach the map data source right now. Try again shortly." });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;

// Real data sources for the NER Disaster Monitoring System.
//
// UPDATED: previously used NASA POWER (rainfall + soil moisture) and
// Open-Elevation.com (slope). Both were causing widespread "Data
// Insufficient" failures — Open-Elevation's free community instance is
// well known to be unreliable/rate-limited, and NASA POWER's daily-point
// API can be slow or inconsistent from some networks. Both are now
// replaced with Open-Meteo's own endpoints (forecast API for rainfall +
// soil moisture, dedicated Elevation API for slope) — one reliable host
// family instead of three, and Open-Meteo was already proven working
// elsewhere in this app (current weather, forecast, historical charts).
//
// All calls fail closed: if the network/API is unreachable, callers get a
// clear error instead of a silent wrong number. Nothing here is invented.

export const REGION_COORDS = {
  Meghalaya: { lat: 25.5788, lng: 91.8933 },
  Assam: { lat: 26.1445, lng: 91.7362 },
  "Arunachal Pradesh": { lat: 27.0844, lng: 93.6053 },
  Nagaland: { lat: 25.6751, lng: 94.1086 },
  Manipur: { lat: 24.817, lng: 93.9368 },
  Mizoram: { lat: 23.7271, lng: 92.7176 },
  Tripura: { lat: 23.8315, lng: 91.2868 },
  Sikkim: { lat: 27.3389, lng: 88.6065 }
};

function coordsFor(regionOrCoords) {
  if (typeof regionOrCoords === "object" && regionOrCoords !== null) {
    const { lat, lng } = regionOrCoords;
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error("Coordinates object must have numeric lat and lng");
    }
    return { lat, lng };
  }
  const coords = REGION_COORDS[regionOrCoords];
  if (!coords) {
    throw new Error(`No coordinates on file for region "${regionOrCoords}"`);
  }
  return coords;
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status} from ${new URL(url).host}${body ? ` — ${body.slice(0, 200)}` : ""}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Timed out after ${timeoutMs}ms calling ${new URL(url).host}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Open-Meteo's free tier rate-limits bursts of concurrent requests (429) or
// occasionally reports itself as overloaded (503). Both are transient —
// retry with a real backoff instead of failing the whole state immediately.
async function fetchJsonWithBackoff(url, { retries = 3, timeoutMs = 12000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchJson(url, timeoutMs);
    } catch (err) {
      lastErr = err;
      const isRateLimited = err.status === 429 || err.status === 503;
      if (!isRateLimited || attempt === retries) throw err;
      const delay = 500 * 2 ** attempt + Math.random() * 300; // 500ms, 1s, 2s... + jitter
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

const WEATHER_CODE_LABELS = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
};

export function conditionLabel(code) {
  return WEATHER_CODE_LABELS[code] ?? "Unknown";
}

// Cache successful bundles briefly so multiple callers asking about the same
// region within a few minutes (e.g. states-live + a district-risk click on
// the same state) don't each fire a fresh request and add to the burst.
const bundleCache = new Map();
const inFlight = new Map();
const CACHE_MS = 20 * 60 * 1000; // serve cached data for 20 min before refetching
const STALE_MS = 6 * 60 * 60 * 1000; // if Open-Meteo is down/rate-limited, still serve up to 6h-old data

/**
 * ONE combined Open-Meteo call that returns real rainfall (trailing 3-day
 * accumulated), real soil moisture (surface + root-zone), and real current
 * + next-24h weather — everything the Dashboard needs for a region, in a
 * single request instead of three. This is the main fix for the 429/503
 * "too many concurrent requests" errors: fewer requests, less burst.
 *
 * Concurrent calls for the same location share one in-flight request
 * (rather than each independently checking the cache and all missing it)
 * — important because callers like the diagnostics endpoint intentionally
 * fire several checks for the same region at once.
 */
export async function fetchRegionWeatherBundle(regionOrCoords) {
  const { lat, lng } = coordsFor(regionOrCoords);
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  const cached = bundleCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  const existing = inFlight.get(cacheKey);
  if (existing) return existing;

  const promise = fetchRegionWeatherBundleUncached(lat, lng)
    .then((value) => {
      bundleCache.set(cacheKey, { value, at: Date.now() });
      inFlight.delete(cacheKey);
      return value;
    })
    .catch((err) => {
      inFlight.delete(cacheKey);
      // Open-Meteo down or rate-limited (e.g. shared free-tier IP hit its
      // daily cap): serve the last known-good reading for this region
      // instead of failing the whole card, as long as it isn't too old.
      if (cached && Date.now() - cached.at < STALE_MS) {
        return { ...cached.value, stale: true, staleSince: new Date(cached.at).toISOString() };
      }
      throw err;
    });

  inFlight.set(cacheKey, promise);
  return promise;
}

async function fetchRegionWeatherBundleUncached(lat, lng) {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
    `&hourly=precipitation,temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,soil_moisture_0_to_1cm,soil_moisture_9_to_27cm` +
    `&past_days=3&forecast_days=1&timezone=auto`;

  const data = await fetchJsonWithBackoff(url);
  const current = data?.current;
  const hourly = data?.hourly;
  if (!current || !hourly?.time) throw new Error("Open-Meteo response missing current/hourly data");

  const now = Date.now();

  // Rainfall: trailing 3-day (72h) accumulated precipitation.
  const past72h = hourly.time
    .map((t, i) => ({ time: t, mm: hourly.precipitation?.[i] }))
    .filter((h) => new Date(h.time).getTime() <= now)
    .slice(-72);
  const rainfall3day = +past72h.reduce((sum, h) => sum + (typeof h.mm === "number" ? h.mm : 0), 0).toFixed(1);
  const latestDayRainfall = +past72h
    .slice(-24)
    .reduce((sum, h) => sum + (typeof h.mm === "number" ? h.mm : 0), 0)
    .toFixed(1);

  // Soil moisture: most recent hour at/before now with a valid reading.
  let soilIdx = -1;
  for (let i = hourly.time.length - 1; i >= 0; i--) {
    if (new Date(hourly.time[i]).getTime() <= now && typeof hourly.soil_moisture_0_to_1cm?.[i] === "number") {
      soilIdx = i;
      break;
    }
  }
  const surfaceMoisture = soilIdx >= 0 ? Math.min(100, +(hourly.soil_moisture_0_to_1cm[soilIdx] * 100).toFixed(1)) : null;
  const rootMoisture =
    soilIdx >= 0 && typeof hourly.soil_moisture_9_to_27cm?.[soilIdx] === "number"
      ? Math.min(100, +(hourly.soil_moisture_9_to_27cm[soilIdx] * 100).toFixed(1))
      : null;

  // Weather details: current + next-24h, sampled every 3rd hour.
  const upcoming = hourly.time
    .map((t, i) => ({
      time: t,
      temperature: hourly.temperature_2m?.[i],
      humidity: hourly.relative_humidity_2m?.[i],
      windSpeed: hourly.wind_speed_10m?.[i],
      rainfall: hourly.precipitation?.[i],
      condition: conditionLabel(hourly.weather_code?.[i])
    }))
    .filter((h) => new Date(h.time).getTime() >= now);
  const sampledHourly = [];
  for (let i = 0; i < upcoming.length; i += 3) sampledHourly.push(upcoming[i]);

  if (rainfall3day == null || surfaceMoisture == null) {
    throw new Error("Open-Meteo response missing valid rainfall or soil moisture readings for this location");
  }

  const value = {
    rainfall: rainfall3day,
    latestDayRainfall,
    soilMoisture: surfaceMoisture,
    rootZoneMoisture: rootMoisture,
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    currentRainfall: current.precipitation,
    condition: conditionLabel(current.weather_code),
    weatherCode: current.weather_code,
    hourly: sampledHourly.slice(0, 8),
    source: "Open-Meteo (single combined request: rainfall, soil moisture, weather)",
    lat,
    lng
  };

  return value;
}

// Thin wrappers kept for compatibility with existing callers — each just
// pulls its slice out of the one combined, cached bundle rather than firing
// its own separate request.
export async function fetchSatelliteRainfall(regionOrCoords) {
  const b = await fetchRegionWeatherBundle(regionOrCoords);
  return {
    rainfall: b.rainfall,
    latestDayRainfall: b.latestDayRainfall,
    currentPrecipitation: b.currentRainfall,
    source: b.source,
    lat: b.lat,
    lng: b.lng
  };
}

export async function fetchSatelliteSoilMoisture(regionOrCoords) {
  const b = await fetchRegionWeatherBundle(regionOrCoords);
  return { soilMoisture: b.soilMoisture, rootZoneMoisture: b.rootZoneMoisture, source: b.source, lat: b.lat, lng: b.lng };
}

export async function fetchWeatherDetails(regionOrCoords) {
  const b = await fetchRegionWeatherBundle(regionOrCoords);
  return {
    temperature: b.temperature,
    humidity: b.humidity,
    windSpeed: b.windSpeed,
    rainfall: b.currentRainfall,
    condition: b.condition,
    weatherCode: b.weatherCode,
    hourly: b.hourly,
    source: b.source,
    lat: b.lat,
    lng: b.lng
  };
}

/**
 * Real terrain slope for a region, from Open-Meteo's dedicated Elevation
 * API (SRTM-derived) — one request for 3 nearby points (centre + ~1.1km
 * north/east), converted to a genuine slope angle via trigonometry.
 */
const slopeCache = new Map();

export async function fetchTerrainSlope(region) {
  const { lat, lng } = coordsFor(region);
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = slopeCache.get(cacheKey);
  if (cached) return cached; // terrain doesn't change — cache for the life of the server

  const OFFSET_DEG = 0.01; // ~1.1km at these latitudes
  const OFFSET_M = 1100;

  const lats = [lat, lat + OFFSET_DEG, lat].join(",");
  const lngs = [lng, lng, lng + OFFSET_DEG].join(",");
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

  const data = await fetchJson(url);
  const elevations = data?.elevation;
  if (!Array.isArray(elevations) || elevations.length < 3) {
    throw new Error("Open-Meteo Elevation response missing points");
  }

  const [centre, north, east] = elevations;
  const riseNorth = Math.abs(north - centre);
  const riseEast = Math.abs(east - centre);
  const steepestRise = Math.max(riseNorth, riseEast);
  const slopeDeg = (Math.atan(steepestRise / OFFSET_M) * 180) / Math.PI;

  const result = {
    slope: +slopeDeg.toFixed(1),
    elevation: centre,
    source: "Open-Meteo Elevation API (SRTM-derived)",
    lat,
    lng
  };
  slopeCache.set(cacheKey, result);
  return result;
}

const dailyHistoryCache = new Map();
const DAILY_CACHE_MS = 60 * 60 * 1000; // 7-day history barely changes hour to hour
const DAILY_STALE_MS = 24 * 60 * 60 * 1000;

export async function fetchDailyHistory(region) {
  const { lat, lng } = coordsFor(region);
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  const cached = dailyHistoryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < DAILY_CACHE_MS) return cached.value;

  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const fmt = (d) => d.toISOString().slice(0, 10);

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
    `&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,relative_humidity_2m_mean` +
    `&timezone=auto`;

  let data;
  try {
    data = await fetchJsonWithBackoff(url);
  } catch (err) {
    if (cached && Date.now() - cached.at < DAILY_STALE_MS) {
      return { ...cached.value, stale: true, staleSince: new Date(cached.at).toISOString() };
    }
    throw err;
  }

  const daily = data?.daily;
  if (!daily?.time) throw new Error("Open-Meteo archive response missing daily data");

  const days = daily.time.map((date, i) => ({
    date,
    rainfall: daily.precipitation_sum?.[i] ?? null,
    tempMax: daily.temperature_2m_max?.[i] ?? null,
    tempMin: daily.temperature_2m_min?.[i] ?? null,
    windMax: daily.wind_speed_10m_max?.[i] ?? null,
    humidity: daily.relative_humidity_2m_mean?.[i] ?? null
  }));

  const value = { days, source: "Open-Meteo Archive (real recorded daily weather)", lat, lng };
  dailyHistoryCache.set(cacheKey, { value, at: Date.now() });
  return value;
}

export async function fetchForecast(region) {
  const { lat, lng } = coordsFor(region);

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}&hourly=precipitation&forecast_days=2&timezone=auto`;

  const data = await fetchJson(url);
  const times = data?.hourly?.time;
  const precip = data?.hourly?.precipitation;
  if (!times || !precip) throw new Error("Open-Meteo response missing hourly data");

  const now = Date.now();
  const upcoming = times
    .map((t, i) => ({ time: t, rainfall: precip[i] }))
    .filter((h) => new Date(h.time).getTime() >= now)
    .slice(0, 24);

  const sampled = [];
  for (let i = 0; i < upcoming.length; i += 3) sampled.push(upcoming[i]);

  return { hours: sampled.slice(0, 8), source: "Open-Meteo (live forecast)", lat, lng };
}

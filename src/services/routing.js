/**
 * Walking-route fetcher using the OSRM public demo server.
 *
 * OSRM (https://project-osrm.org) is open-source routing on top of
 * OpenStreetMap. The demo server is free for low-traffic public use,
 * NO API KEY needed. For high traffic we'd self-host or use Mapbox
 * Directions API (paid).
 *
 * What it returns:
 *   - coordinates: array of [lat, lng] pairs forming the walking path
 *   - distanceMeters: actual route distance (often longer than crow-flies)
 *   - durationSeconds: estimated walking time per OSRM
 *   - steps: simplified turn-by-turn (just maneuver names; no street
 *     names yet — those would come from Mapbox or Google Directions)
 *
 * Returns null on any failure — caller should fall back to the
 * straight-line polyline.
 */

const OSRM_BASE = "https://router.project-osrm.org/route/v1/foot";

// Tiny cache so repeated route calls (the same selected bathroom) don't
// hammer the demo server. Keyed by rounded coords.
const routeCache = new Map();

function cacheKey(from, to) {
  const r = (n) => Number(n).toFixed(4);
  return `${r(from.lat)},${r(from.lng)}->${r(to.lat)},${r(to.lng)}`;
}

export async function fetchWalkingRoute(from, to) {
  if (!from || !to) return null;
  const key = cacheKey(from, to);
  if (routeCache.has(key)) return routeCache.get(key);

  const url =
    `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson&steps=true`;

  try {
    const res = await fetch(url, {
      // Public demo server — no auth header needed; just identify ourselves
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route?.geometry?.coordinates) return null;

    const result = {
      // Leaflet wants [lat, lng]; GeoJSON gives us [lng, lat]
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      steps: (route.legs?.[0]?.steps || []).map((s) => ({
        type: s.maneuver?.type,
        modifier: s.maneuver?.modifier,
        distance: s.distance,
      })),
    };
    routeCache.set(key, result);
    // Cap cache size
    if (routeCache.size > 50) {
      const firstKey = routeCache.keys().next().value;
      routeCache.delete(firstKey);
    }
    return result;
  } catch {
    return null;
  }
}

/* ------- Compass bearing helpers ------- */

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

/**
 * Initial bearing from (lat1,lng1) to (lat2,lng2) in degrees clockwise
 * from North (0..360).
 */
export function bearing(lat1, lng1, lat2, lng2) {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = toDeg(Math.atan2(y, x));
  return (θ + 360) % 360;
}

const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function bearingToCardinal(deg) {
  return CARDINALS[Math.round(deg / 45) % 8];
}

/* ------- Turn-by-turn helpers (P0 #6) ------- */

// Arrow glyph for a maneuver modifier — quick visual scan of the strip.
const MODIFIER_ARROWS = {
  "left": "←", "right": "→",
  "slight left": "↖", "slight right": "↗",
  "sharp left": "↰", "sharp right": "↱",
  "straight": "↑", "uturn": "↩",
};

export function stepArrow(step) {
  if (step.type === "arrive") return "🏁";
  if (step.type === "depart") return "🚶";
  return MODIFIER_ARROWS[step.modifier] || "↑";
}

/**
 * Humanize one OSRM step ({type, modifier, distance}) into short text.
 * OSRM's demo profile gives no street names, so keep it directional.
 */
export function describeStep(step) {
  const dir = step.modifier || "";
  switch (step.type) {
    case "depart": return "Head out";
    case "arrive": return "Arrive";
    case "turn": return `Turn ${dir}`;
    case "end of road": return `End of road, go ${dir}`;
    case "fork": return `At the fork, keep ${dir}`;
    case "merge": return `Merge ${dir}`;
    case "roundabout":
    case "rotary": return "Take the roundabout";
    case "new name":
    case "continue":
    default:
      return dir && dir !== "straight" ? `Continue ${dir}` : "Continue straight";
  }
}

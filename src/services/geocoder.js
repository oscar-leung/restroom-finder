/**
 * Geocoder — turn an address/landmark string into lat/lng using OSM
 * Nominatim. Free, no key, fair-use only — we throttle aggressively
 * and self-rate-limit per OSM Foundation policy:
 *   https://operations.osmfoundation.org/policies/nominatim/
 *
 * Rules we follow:
 *   - One request per second max (we debounce caller-side)
 *   - Set a meaningful User-Agent (browsers strip this, but we send a
 *     `Accept-Language` header which Nominatim respects for results)
 *   - Cache aggressively (in-memory + sessionStorage)
 *
 * For higher-volume usage we'd self-host Nominatim or move to Photon.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const memCache = new Map();

function cacheGet(q) {
  if (memCache.has(q)) return memCache.get(q);
  try {
    const raw = sessionStorage.getItem(`gg_geo_${q}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memCache.set(q, parsed);
      return parsed;
    }
  } catch {}
  return null;
}
function cacheSet(q, results) {
  memCache.set(q, results);
  try { sessionStorage.setItem(`gg_geo_${q}`, JSON.stringify(results)); } catch {}
}

/**
 * Search Nominatim for a place. Returns up to `limit` matches with
 * { displayName, lat, lng, type, importance }.
 */
export async function geocodeSearch(query, { limit = 6, language = "en" } = {}) {
  const q = (query || "").trim();
  if (q.length < 3) return [];

  const cached = cacheGet(q);
  if (cached) return cached;

  const url = `${NOMINATIM}?format=jsonv2&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=0`;
  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": language },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.map((row) => ({
      displayName: row.display_name,
      lat: Number(row.lat),
      lng: Number(row.lon),
      type: row.type,
      importance: Number(row.importance) || 0,
    }));
    cacheSet(q, results);
    return results;
  } catch {
    return [];
  }
}

/**
 * Reverse geocode — turn lat/lng into a human-readable address.
 * Used for displaying "you are near Market St + 5th Ave" in the
 * banner above the hero (a small UX improvement).
 */
export async function reverseGeocode(lat, lng) {
  const key = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = memCache.get(key);
  if (cached) return cached;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`;
  try {
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      displayName: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village,
      neighborhood: data.address?.neighbourhood || data.address?.suburb,
    };
    memCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

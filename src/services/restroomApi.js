import { fetchNYC } from "./dataSources/nyc";
import { fetchSF } from "./dataSources/sf";
import { fetchGooglePlaces } from "./dataSources/googlePlaces";

/**
 * Restroom data layer — aggregates 4+ sources and dedupes:
 *
 *   1. Refuge Restrooms   – community-maintained, rich accessibility & gender
 *                           info, US-heavy.
 *                           https://www.refugerestrooms.org/api/docs/
 *
 *   2. OpenStreetMap (Overpass API) – `amenity=toilets` tagged features.
 *                           MUCH broader coverage (colleges, parks,
 *                           highway rest stops, international cities).
 *                           https://wiki.openstreetmap.org/wiki/Overpass_API
 *
 * Both APIs are free and require no key. We race them in parallel and
 * merge. If one fails, the other still renders something useful.
 */

const REFUGE_URL = "https://www.refugerestrooms.org/api/v1/restrooms";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// How far around the user (meters) to search OSM for toilets
const OSM_RADIUS_M = 2000;

/* ------------------------- Refuge Restrooms ------------------------- */

async function fetchFromRefuge(lat, lng) {
  const url = `${REFUGE_URL}/by_location?lat=${lat}&lng=${lng}&per_page=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Refuge: ${res.status}`);
  const data = await res.json();
  return data.map((r) => ({
    id: `refuge-${r.id}`,
    source: "refuge",
    name: r.name,
    street: r.street,
    city: r.city,
    state: r.state,
    country: r.country,
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    accessible: !!r.accessible,
    unisex: !!r.unisex,
    directions: r.directions,
    comment: r.comment,
    upvote: r.upvote || 0,
    downvote: r.downvote || 0,
  }));
}

/* ----------------------- OpenStreetMap (OSM) ----------------------- */

/**
 * Overpass QL: find every amenity=toilets within a radius of the user,
 * as node/way/relation, and return each with its center coordinates.
 */
function overpassQuery(lat, lng, radius) {
  return `
    [out:json][timeout:10];
    (
      node["amenity"="toilets"](around:${radius},${lat},${lng});
      way["amenity"="toilets"](around:${radius},${lat},${lng});
      relation["amenity"="toilets"](around:${radius},${lat},${lng});
    );
    out center tags 40;
  `.trim();
}

async function fetchFromOSM(lat, lng) {
  const body = `data=${encodeURIComponent(overpassQuery(lat, lng, OSM_RADIUS_M))}`;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`OSM: ${res.status}`);
  const { elements = [] } = await res.json();

  return elements
    .map((el) => {
      const coords =
        el.type === "node"
          ? { lat: el.lat, lng: el.lon }
          : el.center
          ? { lat: el.center.lat, lng: el.center.lon }
          : null;
      if (!coords) return null;

      const t = el.tags || {};
      const yes = (v) => v === "yes" || v === "designated";

      return {
        id: `osm-${el.type}-${el.id}`,
        source: "osm",
        name: bestName(t),
        street: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
        city: t["addr:city"],
        state: t["addr:state"],
        country: t["addr:country"],
        latitude: coords.lat,
        longitude: coords.lng,
        accessible: yes(t.wheelchair),
        unisex: yes(t.unisex) || t["toilets:unisex"] === "yes",
        // STRUCTURED — not buried in comment string anymore
        fee: t.fee === "yes" ? true : t.fee === "no" ? false : null,
        opening_hours: t.opening_hours || null,
        directions: t.description || null,
        comment: t.access && t.access !== "yes" ? `Access: ${t.access}` : null,
        upvote: 0,
        downvote: 0,
      };
    })
    .filter(Boolean);
}

/**
 * Best-effort human-readable name from OSM tags.
 *
 * The top complaint about Toilet Finder was "name = address". We do
 * better: rich tags first, generic words only as last resort, and we
 * detect when OSM's `name` is just "Toilets" so we can improve on it.
 */
function bestName(t) {
  const generic = /^(toilet|toilets|wc|restroom|public toilet|public restroom|bathroom)$/i;

  // 1. A real proper name (not a generic word)
  if (t.name && !generic.test(t.name.trim())) return t.name;

  // 2. Operator / brand — "Starbucks", "BP", "Westfield Mall"
  if (t.operator) return `Restroom · ${t.operator}`;
  if (t.brand) return `Restroom · ${t.brand}`;

  // 3. Named place it's inside — park, station, etc.
  if (t["addr:place"]) return `Restroom · ${t["addr:place"]}`;

  // 4. Generic fallback
  return t.name || "Public Restroom";
}

/* ------------------------------ Merge ------------------------------ */

/**
 * Dedupe by rounding lat/lng to ~11m precision. When two sources report
 * the same location, prefer city open-data (most authoritative) > Refuge
 * (rich community metadata) > OSM (broadest coverage).
 */
const SOURCE_PRIORITY = { user: 5, google: 5, nyc: 4, sf: 4, refuge: 3, osm: 2 };

function dedupe(list) {
  const seen = new Map();
  for (const r of list) {
    const key = `${r.latitude.toFixed(4)},${r.longitude.toFixed(4)}`;
    const existing = seen.get(key);
    const incomingPri = SOURCE_PRIORITY[r.source] ?? 1;
    const existingPri = SOURCE_PRIORITY[existing?.source] ?? 0;
    if (!existing || incomingPri > existingPri) {
      seen.set(key, r);
    } else {
      // If this entry has structured fields the existing one lacks, fold them in
      const merged = { ...existing };
      if (existing.fee == null && r.fee != null) merged.fee = r.fee;
      if (!existing.opening_hours && r.opening_hours) merged.opening_hours = r.opening_hours;
      if (existing.accessible !== true && r.accessible) merged.accessible = true;
      if (existing.unisex !== true && r.unisex) merged.unisex = true;
      seen.set(key, merged);
    }
  }
  return Array.from(seen.values());
}

/**
 * Public API — fetch from every available source in parallel, merge,
 * dedupe. City sources are geofenced internally so they no-op outside
 * their region. If one source fails, the others still return results.
 */
export async function fetchNearbyRestrooms(lat, lng) {
  const results = await Promise.allSettled([
    fetchFromRefuge(lat, lng),
    fetchFromOSM(lat, lng),
    fetchNYC(lat, lng),
    fetchSF(lat, lng),
    fetchGooglePlaces(lat, lng), // no-op without VITE_GOOGLE_MAPS_KEY
  ]);

  const combined = [];
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      combined.push(...r.value);
    }
  }

  if (combined.length === 0) {
    const firstError = results.find((r) => r.status === "rejected");
    throw new Error(firstError?.reason?.message || "No data sources responded");
  }

  return dedupe(combined);
}

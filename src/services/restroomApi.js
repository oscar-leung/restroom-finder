import { fetchNYC } from "./dataSources/nyc";
import { fetchSF } from "./dataSources/sf";
import { fetchGooglePlaces } from "./dataSources/googlePlaces";
import { fetchCommonPlaces } from "./dataSources/commonPlaces";
import { fetchWikidata } from "./dataSources/wikidata";
import { fetchWheelmap } from "./dataSources/wheelmap";

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

      // Stall-type signals — Lulu's wedge per the competitor scan.
      // "Single occupant" = a locked private bathroom (one person at a time)
      // versus "multi-stall" = shared with multiple stalls.
      // Heuristics: explicit `lockable=yes` OR "single user" / "one person"
      // language, plus the absence of male/female segregation.
      const lockable = yes(t.lockable);
      const singleUserHint = /single|one[ -]?person|locked|private/i.test(
        t.description || t.note || ""
      );
      const segregated =
        yes(t.male) || yes(t.female) || yes(t.gender_segregated);
      const single_occupant =
        lockable || singleUserHint
          ? true
          : segregated
          ? false
          : null;

      // Fixture counts (rare in OSM but worth extracting when present)
      const numToilets = Number(t["capacity"]) || Number(t["toilets:capacity"]) || null;
      const numUrinals = Number(t["male:urinals"]) || Number(t["toilets:urinals"]) || null;
      const numStalls = Number(t["female:capacity"]) || null;
      const hasSink = yes(t["toilets:hand_washing"]) || yes(t["sink"]);
      const hasPaperTowels = yes(t["toilets:paper_towels"]);
      const hasBabyChange = yes(t.changing_table) || yes(t["diaper:changing_table"]);

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
        single_occupant,
        family: yes(t["toilets:family"]) || yes(t.family),
        baby_change: hasBabyChange,
        fixtures: {
          toilets: numToilets,
          urinals: numUrinals,
          stalls: numStalls,
          sink: hasSink,
          paper_towels: hasPaperTowels,
        },
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
// Inferred (common-places) sit BELOW everything explicit since they're
// "probably has a bathroom" not "this is a public toilet".
const SOURCE_PRIORITY = {
  user: 5, google: 5,
  nyc: 4, sf: 4,
  refuge: 3, wikidata: 3, wheelmap: 3,
  osm: 2,
  inferred: 1,
};

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

/* ----------------------- Offline cache ----------------------- */

const CACHE_KEY = "gg_restroom_cache_v1";

/** Round to ~1km grid so nearby fetches share a cache slot. */
function cacheKey(lat, lng) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; }
}
function writeCache(o) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(o)); } catch {} }

function cacheGet(lat, lng) {
  return readCache()[cacheKey(lat, lng)] || null;
}
function cacheSet(lat, lng, data) {
  const all = readCache();
  all[cacheKey(lat, lng)] = { data, ts: Date.now() };
  // Keep at most 10 grids cached (~10MB cap on a few thousand entries)
  const keys = Object.keys(all);
  if (keys.length > 10) {
    const oldest = keys
      .map((k) => ({ k, ts: all[k].ts }))
      .sort((a, b) => a.ts - b.ts)[0];
    delete all[oldest.k];
  }
  writeCache(all);
}

/**
 * Public API — fetch from every available source in parallel, merge,
 * dedupe. Falls back to localStorage cache if everything fails (offline).
 *
 * Returns: { results, fromCache: boolean, cachedAt: ISO | null }
 */
export async function fetchNearbyRestrooms(lat, lng) {
  const results = await Promise.allSettled([
    fetchFromRefuge(lat, lng),
    fetchFromOSM(lat, lng),
    fetchNYC(lat, lng),
    fetchSF(lat, lng),
    fetchGooglePlaces(lat, lng), // no-op without VITE_GOOGLE_MAPS_KEY
    fetchCommonPlaces(lat, lng), // McDonald's / Starbucks / gas / big-box
    fetchWikidata(lat, lng),     // landmark / notable public toilets
    fetchWheelmap(lat, lng),     // accessibility-focused (EU-heavy)
  ]);

  const combined = [];
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      // Defensive: drop any entry without valid coords. A single bad
      // entry shouldn't break the whole render.
      for (const item of r.value) {
        if (
          item &&
          typeof item.latitude === "number" && !Number.isNaN(item.latitude) &&
          typeof item.longitude === "number" && !Number.isNaN(item.longitude)
        ) {
          combined.push(item);
        }
      }
    }
  }

  if (combined.length > 0) {
    const merged = dedupe(combined);
    cacheSet(lat, lng, merged);
    return merged;
  }

  // Everything failed — try the cache (offline mode)
  const cached = cacheGet(lat, lng);
  if (cached?.data?.length) {
    return cached.data;
  }

  const firstError = results.find((r) => r.status === "rejected");
  throw new Error(firstError?.reason?.message || "No data sources responded");
}

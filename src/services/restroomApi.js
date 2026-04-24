/**
 * Restroom data layer — aggregates TWO sources and dedupes:
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
      // Nodes have lat/lon directly; ways/relations need el.center
      const coords =
        el.type === "node"
          ? { lat: el.lat, lng: el.lon }
          : el.center
          ? { lat: el.center.lat, lng: el.center.lon }
          : null;
      if (!coords) return null;

      const t = el.tags || {};
      // OSM booleans come in as "yes"/"no"/"designated" strings
      const yes = (v) => v === "yes" || v === "designated";

      return {
        id: `osm-${el.type}-${el.id}`,
        source: "osm",
        name: t.name || t.operator || t.brand || "Public Restroom",
        street: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
        city: t["addr:city"],
        state: t["addr:state"],
        country: t["addr:country"],
        latitude: coords.lat,
        longitude: coords.lng,
        accessible: yes(t.wheelchair),
        unisex: yes(t.unisex) || t["toilets:unisex"] === "yes",
        directions: t.description || null,
        comment:
          [
            t.fee === "yes" && "Fee required",
            t.access && `Access: ${t.access}`,
            t.opening_hours && `Hours: ${t.opening_hours}`,
          ]
            .filter(Boolean)
            .join(" · ") || null,
        upvote: 0,
        downvote: 0,
      };
    })
    .filter(Boolean);
}

/* ------------------------------ Merge ------------------------------ */

/**
 * Dedupe by rounding lat/lng to ~11m precision (4 decimal places).
 * If two sources report a restroom at the same location, prefer the
 * Refuge one (richer metadata).
 */
function dedupe(list) {
  const seen = new Map();
  for (const r of list) {
    const key = `${r.latitude.toFixed(4)},${r.longitude.toFixed(4)}`;
    const existing = seen.get(key);
    if (!existing || (r.source === "refuge" && existing.source === "osm")) {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values());
}

/**
 * Public API — fetch from both sources in parallel, merge, dedupe.
 * If one source fails the other still returns results.
 */
export async function fetchNearbyRestrooms(lat, lng) {
  const [refugeResult, osmResult] = await Promise.allSettled([
    fetchFromRefuge(lat, lng),
    fetchFromOSM(lat, lng),
  ]);

  const combined = [];
  if (refugeResult.status === "fulfilled") combined.push(...refugeResult.value);
  if (osmResult.status === "fulfilled") combined.push(...osmResult.value);

  // If BOTH failed, surface the error
  if (combined.length === 0) {
    const msg =
      refugeResult.status === "rejected"
        ? refugeResult.reason?.message
        : osmResult.reason?.message;
    throw new Error(msg || "No data sources responded");
  }

  return dedupe(combined);
}

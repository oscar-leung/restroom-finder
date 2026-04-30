/**
 * Wheelmap.org — accessibility-focused crowdsourced map.
 *
 * Wheelmap rates POIs (including bathrooms) on a 4-point accessibility
 * scale: yes / limited / no / unknown. Heavily used in EU. We pull
 * the toilets it knows about as an additional source, prioritizing
 * accessibility metadata.
 *
 * API: https://wheelmap.org/api (legacy public endpoint). Some
 * endpoints require a token but the basic node search is open.
 *
 * Returns up to ~50 entries within a small bbox around the user.
 */

const ENDPOINT = "https://wheelmap.org/api/nodes";
const RADIUS_M = 1500;

// Approximate degrees-per-meter at common latitudes (good enough for a
// 1.5 km bbox; precision lat-dependent error is < 1%).
function bbox(lat, lng, radiusM) {
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));
  return {
    south: lat - dLat,
    north: lat + dLat,
    west: lng - dLng,
    east: lng + dLng,
  };
}

const ACCESSIBILITY_TO_BOOL = {
  yes: true,
  limited: true,    // partial counts as accessible for our coarse filter
  no: false,
  unknown: false,
};

export async function fetchWheelmap(lat, lng) {
  try {
    const b = bbox(lat, lng, RADIUS_M);
    const url =
      `${ENDPOINT}.json?` +
      `bbox=${b.west},${b.south},${b.east},${b.north}` +
      `&page=1&per_page=50` +
      `&category=public_transfer`; // public_transfer = "Public restrooms"
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const nodes = data?.nodes || [];

    return nodes
      .map((n) => {
        const latitude = Number(n.lat);
        const longitude = Number(n.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        return {
          id: `wheelmap-${n.id}`,
          source: "wheelmap",
          name: n.name || "Public toilet",
          street: n.street || "",
          city: n.city || "",
          state: "",
          country: "",
          latitude,
          longitude,
          accessible: ACCESSIBILITY_TO_BOOL[n.wheelchair] ?? false,
          unisex: false,
          single_occupant: null,
          family: false,
          fee: null,
          opening_hours: null,
          directions: null,
          comment:
            n.wheelchair && n.wheelchair !== "unknown"
              ? `Wheelmap rating: ${n.wheelchair}`
              : null,
          upvote: 0,
          downvote: 0,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

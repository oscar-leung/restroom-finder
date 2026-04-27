/**
 * NYC Open Data — Public Restrooms.
 *
 * Dataset: "Public Restrooms"
 * Endpoint: https://data.cityofnewyork.us/resource/i7jb-7jku.json
 * (~1,000 entries, NYC parks + libraries + transit hubs)
 *
 * Geofenced — only fetched if the user is roughly within NYC bounds.
 * Saves a wasted request for users in other cities.
 */

const NYC_BOUNDS = {
  north: 40.92,
  south: 40.49,
  east: -73.70,
  west: -74.27,
};

function isInNYC(lat, lng) {
  return (
    lat >= NYC_BOUNDS.south && lat <= NYC_BOUNDS.north &&
    lng >= NYC_BOUNDS.west && lng <= NYC_BOUNDS.east
  );
}

const ENDPOINT = "https://data.cityofnewyork.us/resource/i7jb-7jku.json";

export async function fetchNYC(lat, lng) {
  if (!isInNYC(lat, lng)) return [];

  // Socrata API: $where supports within_circle(location_field, lat, lng, meters)
  const url = `${ENDPOINT}?$limit=200`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NYC: ${res.status}`);
  const rows = await res.json();

  return rows
    .map((row, idx) => {
      // Coordinates can be in different fields depending on the snapshot
      const latitude = Number(row.latitude || row.lat);
      const longitude = Number(row.longitude || row.lon || row.lng);
      if (!latitude || !longitude) return null;

      // Best-effort name from various possible columns
      const name =
        row.facility_name || row.name || row.location_type ||
        row.location_1 || "NYC Public Restroom";

      return {
        id: `nyc-${row.facility_name || idx}-${latitude.toFixed(4)}`,
        source: "nyc",
        name,
        street: row.location || row.address || "",
        city: "New York",
        state: "NY",
        country: "US",
        latitude,
        longitude,
        accessible:
          (row.handicap_accessible || "").toLowerCase() === "yes" ||
          (row.accessibility || "").toLowerCase() === "yes",
        unisex: false,
        fee: false, // NYC public restrooms are free
        opening_hours: row.hours_of_operation || row.hours || null,
        directions: null,
        comment: row.notes || null,
        upvote: 0,
        downvote: 0,
      };
    })
    .filter(Boolean);
}

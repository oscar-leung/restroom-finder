/**
 * SF Open Data — Public Toilets / Pit Stops.
 *
 * Endpoint: https://data.sfgov.org/resource/8xq2-vbxn.json
 * (~50 entries — SF Pit Stop program: staffed, free, clean)
 *
 * Geofenced to SF Bay Area to skip the request elsewhere.
 */

const SF_BOUNDS = {
  north: 37.84,
  south: 37.70,
  east: -122.35,
  west: -122.55,
};

function isInSF(lat, lng) {
  return (
    lat >= SF_BOUNDS.south && lat <= SF_BOUNDS.north &&
    lng >= SF_BOUNDS.west && lng <= SF_BOUNDS.east
  );
}

const ENDPOINT = "https://data.sfgov.org/resource/8xq2-vbxn.json";

export async function fetchSF(lat, lng) {
  if (!isInSF(lat, lng)) return [];

  const url = `${ENDPOINT}?$limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SF: ${res.status}`);
  const rows = await res.json();

  return rows
    .map((row, idx) => {
      // Different SF datasets use different geo column shapes
      let latitude, longitude;
      if (row.location?.latitude) {
        latitude = Number(row.location.latitude);
        longitude = Number(row.location.longitude);
      } else if (row.point?.coordinates) {
        longitude = Number(row.point.coordinates[0]);
        latitude = Number(row.point.coordinates[1]);
      } else if (row.latitude) {
        latitude = Number(row.latitude);
        longitude = Number(row.longitude);
      }
      if (!latitude || !longitude) return null;

      return {
        id: `sf-${idx}-${latitude.toFixed(4)}`,
        source: "sf",
        name: row.location_name || row.name || "SF Pit Stop",
        street: row.address || "",
        city: "San Francisco",
        state: "CA",
        country: "US",
        latitude,
        longitude,
        accessible: true, // SF Pit Stops are ADA-accessible
        unisex: true,
        fee: false,
        opening_hours: row.hours || null,
        directions: null,
        comment: "SF Pit Stop — staffed, free, clean",
        upvote: 0,
        downvote: 0,
      };
    })
    .filter(Boolean);
}

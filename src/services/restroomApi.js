const BASE_URL = "https://www.refugerestrooms.org/api/v1/restrooms";

/**
 * Fetch restrooms near a given lat/lng from the Refuge Restrooms API.
 *
 * @param {number} lat  – latitude
 * @param {number} lng  – longitude
 * @returns {Promise<Array>} – array of restroom objects
 *
 * Each restroom object includes fields like:
 *   id, name, street, city, state, country,
 *   accessible (boolean), unisex (boolean),
 *   directions, comment, latitude, longitude
 */
export async function fetchNearbyRestrooms(lat, lng) {
  // The API endpoint: /by_location?lat=...&lng=...
  // per_page controls how many results (max ~20 is reasonable for a map)
  const url = `${BASE_URL}/by_location?lat=${lat}&lng=${lng}&per_page=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

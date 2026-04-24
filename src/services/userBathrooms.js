/**
 * User-added bathrooms — device-local.
 *
 * When a user submits a new bathroom:
 *   1. Save it here (localStorage). Shows in THEIR app instantly, right
 *      alongside Refuge + OSM results.
 *   2. We also show a "share with everyone" link that deep-links to
 *      Refuge Restrooms' public submission form — their moderators
 *      handle quality control, not us.
 *
 * This avoids:
 *   - Us building a backend
 *   - Us moderating user content (legally tricky, time-consuming)
 *   - Spam / fake entries polluting the map for other users
 *
 * Storage shape:
 *   localStorage["restroom_user_v1"] = [ { id, name, street, ... }, ... ]
 *
 * The entry shape matches the Refuge/OSM object shape so the merge in
 * restroomApi.js is trivial (they all go through the same dedupe).
 */

const KEY = "restroom_user_v1";
const MAX_ENTRIES = 100;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {}
}

/** Return every user-submitted bathroom (shape-compatible with API results). */
export function getUserBathrooms() {
  return readAll();
}

/**
 * Append a new user bathroom.
 *
 * @param {object} input
 * @param {number} input.latitude    – required
 * @param {number} input.longitude   – required
 * @param {string} input.name
 * @param {string} [input.street]
 * @param {string} [input.city]
 * @param {boolean} [input.accessible]
 * @param {boolean} [input.unisex]
 * @param {string} [input.comment]
 * @returns {object} created entry
 */
export function addUserBathroom(input) {
  const list = readAll();
  const entry = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: "user",
    name: (input.name || "").trim() || "My Added Restroom",
    street: (input.street || "").trim(),
    city: (input.city || "").trim(),
    state: "",
    country: "",
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    accessible: !!input.accessible,
    unisex: !!input.unisex,
    directions: null,
    comment: (input.comment || "").trim() || null,
    upvote: 0,
    downvote: 0,
    createdAt: new Date().toISOString(),
  };
  writeAll([...list, entry]);
  return entry;
}

/** Remove a user bathroom by id. */
export function removeUserBathroom(id) {
  const list = readAll().filter((b) => b.id !== id);
  writeAll(list);
}

/**
 * Build a URL that deep-links to Refuge Restrooms' public submission form.
 * Their form doesn't accept pre-filled query params, but this lets us
 * open the right page in a new tab so the user can re-enter their submission
 * for the world.
 */
export function refugeSubmitUrl() {
  return "https://www.refugerestrooms.org/restrooms/new";
}

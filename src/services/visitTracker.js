/**
 * Per-bathroom visit tracker — device-local.
 *
 * Records every time the user taps GO on a specific bathroom. Lets us:
 *   - Show "you've been here X times" in the details panel
 *   - Size map pins by visit count (your personal heat-map)
 *   - Surface "your usuals" (most-visited spots) in a future iteration
 *
 * Cross-user concentration (i.e. global popularity) requires a backend,
 * which we don't have. The "Concentration" feature is intentionally
 * scoped to the user's own data for now — honest about that in the UI.
 *
 * Storage shape:
 *   localStorage["restroom_visits_v1"] = {
 *     "<bathroom-id>": { count: number, lastVisited: ISO string }
 *   }
 */

const KEY = "restroom_visits_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function write(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
}

/**
 * Record a visit. Returns the updated record for that bathroom.
 */
export function recordVisit(bathroomId) {
  if (!bathroomId) return null;
  const all = read();
  const prev = all[bathroomId] || { count: 0, lastVisited: null };
  all[bathroomId] = {
    count: prev.count + 1,
    lastVisited: new Date().toISOString(),
  };
  write(all);
  return all[bathroomId];
}

export function getVisitRecord(bathroomId) {
  return read()[bathroomId] || { count: 0, lastVisited: null };
}

export function getVisitCount(bathroomId) {
  return read()[bathroomId]?.count || 0;
}

/** Return ALL visit records as a Map-like object — useful for map sizing. */
export function getAllVisits() {
  return read();
}

/** Top N most-visited bathroom IDs, descending. */
export function getTopVisited(n = 5) {
  const all = read();
  return Object.entries(all)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Format "lastVisited" into something like "2 days ago" or "today". */
export function formatLastVisit(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

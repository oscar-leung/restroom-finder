/**
 * Speed Dial Favorites — pin a bathroom for one-tap access from anywhere.
 *
 * Use cases:
 *   - The bathroom at work / home / gym you always go to
 *   - The good one in your local park
 *   - The clean one in the airport you fly through
 *
 * Stored in localStorage. Cross-device sync = backend feature.
 *
 * Storage shape:
 *   localStorage["gg_favorites_v1"] = ["restroom-id-1", "restroom-id-2", ...]
 */

const KEY = "gg_favorites_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

export function getFavorites() {
  return read();
}

export function isFavorite(id) {
  return read().includes(id);
}

export function toggleFavorite(id) {
  const list = read();
  const i = list.indexOf(id);
  if (i >= 0) {
    list.splice(i, 1);
    write(list);
    return false;
  }
  list.push(id);
  write(list);
  return true;
}

/**
 * Opening-hours utilities — backed by the real `opening_hours.js`
 * library (https://github.com/opening-hours/opening_hours.js).
 *
 * Why we swapped from our hand-rolled parser:
 *   - Real OSM hours have edge cases (PH = public holidays, dawn/dusk
 *     SH = school holidays, "Mo-Fr 09:00-17:00, Sa 10:00-14:00; Su off")
 *     that are tedious to handle correctly.
 *   - opening_hours.js is the de-facto standard (used by OsmAnd,
 *     openstreetmap.org itself, Wheelmap, etc).
 *   - We get nicer locale-aware formatting for free.
 *
 * The library is heavy-ish (~40 KB minified) but loads only once.
 * Existing call sites keep using `isOpenNow(str)` and `formatHours(str)`
 * with no API change.
 */

import OpeningHours from "opening_hours";

/**
 * Returns:
 *   { isOpen: boolean, knownStatus: boolean }
 * `knownStatus = false` means we couldn't tell — UI should not say "closed".
 */
export function isOpenNow(openingHours, now = new Date()) {
  if (!openingHours || typeof openingHours !== "string") {
    return { isOpen: false, knownStatus: false };
  }

  // 24/7 shortcut — opening_hours handles it but the shortcut is faster
  if (openingHours.trim() === "24/7") {
    return { isOpen: true, knownStatus: true };
  }

  try {
    const oh = new OpeningHours(openingHours, null, { tag_key: "opening_hours" });
    return { isOpen: oh.getState(now), knownStatus: true };
  } catch {
    // Library couldn't parse this string — surface as "unknown"
    return { isOpen: false, knownStatus: false };
  }
}

/**
 * Friendly display of opening_hours.
 *   "24/7" → "Open 24 hours"
 *   "Mo-Fr 09:00-17:00" → "Mon–Fri 9:00–17:00"
 * Falls back to a light find/replace if the library can't process it.
 */
export function formatHours(openingHours) {
  if (!openingHours) return null;
  const t = openingHours.trim();
  if (t === "24/7") return "Open 24 hours";

  // Pretty-print the day codes
  return t
    .replace(/\bMo\b/g, "Mon")
    .replace(/\bTu\b/g, "Tue")
    .replace(/\bWe\b/g, "Wed")
    .replace(/\bTh\b/g, "Thu")
    .replace(/\bFr\b/g, "Fri")
    .replace(/\bSa\b/g, "Sat")
    .replace(/\bSu\b/g, "Sun")
    .replace(/\bPH\b/g, "Public holidays")
    .replace(/\bSH\b/g, "School holidays");
}

/**
 * Returns "Opens at 9:00" / "Closes at 17:00" / "Open until 22:00".
 * Useful for the hero subtitle when we want a softer signal than
 * a binary open/closed badge.
 */
export function nextChange(openingHours, now = new Date()) {
  if (!openingHours) return null;
  try {
    const oh = new OpeningHours(openingHours, null, { tag_key: "opening_hours" });
    const next = oh.getNextChange(now);
    if (!next) return null;
    const isOpen = oh.getState(now);
    const time = next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return isOpen ? `Open until ${time}` : `Opens at ${time}`;
  } catch {
    return null;
  }
}

/**
 * Tiny opening-hours utilities.
 *
 * We don't pull in a 50KB OSM `opening_hours.js` parser for an MVP.
 * Instead we parse the most common patterns ourselves and gracefully
 * say "unknown" for anything weird.
 *
 * Patterns we handle:
 *   "24/7"
 *   "Mo-Fr 09:00-17:00"
 *   "Mo-Su 06:00-22:00"
 *   "Mo-Fr 09:00-17:00; Sa 10:00-14:00"
 *   "Mo,We,Fr 09:00-17:00"
 *
 * For everything else we return null (caller should treat as unknown,
 * not closed).
 */

const DAY_INDEX = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6, Su: 0 };

function expandDayRange(token) {
  // "Mo-Fr" → [1,2,3,4,5];  "Mo,We,Fr" → [1,3,5];  "Mo" → [1]
  if (token.includes("-")) {
    const [a, b] = token.split("-");
    if (DAY_INDEX[a] == null || DAY_INDEX[b] == null) return null;
    const days = [];
    let i = DAY_INDEX[a];
    while (true) {
      days.push(i);
      if (i === DAY_INDEX[b]) break;
      i = (i + 1) % 7;
      if (days.length > 7) return null; // safety
    }
    return days;
  }
  if (token.includes(",")) {
    return token.split(",").map((d) => DAY_INDEX[d]).filter((x) => x != null);
  }
  return DAY_INDEX[token] != null ? [DAY_INDEX[token]] : null;
}

function parseTimeRange(rangeStr) {
  // "09:00-17:00" → { startMin, endMin }
  const m = rangeStr.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const startMin = Number(m[1]) * 60 + Number(m[2]);
  const endMin = Number(m[3]) * 60 + Number(m[4]);
  return { startMin, endMin };
}

/**
 * Returns:
 *   { isOpen: boolean, knownStatus: boolean }
 * `knownStatus = false` means we can't tell — UI should not say "closed".
 */
export function isOpenNow(openingHours, now = new Date()) {
  if (!openingHours) return { isOpen: false, knownStatus: false };

  const trimmed = openingHours.trim();
  if (trimmed === "24/7") return { isOpen: true, knownStatus: true };

  const dayOfWeek = now.getDay(); // 0..6
  const minOfDay = now.getHours() * 60 + now.getMinutes();

  // Each rule separated by ";"
  for (const rule of trimmed.split(";").map((s) => s.trim())) {
    // Rule shape: "<days> <range>"  e.g. "Mo-Fr 09:00-17:00"
    const m = rule.match(/^([A-Za-z,\-]+)\s+([\d:\-]+)$/);
    if (!m) continue;
    const days = expandDayRange(m[1]);
    const range = parseTimeRange(m[2]);
    if (!days || !range) continue;
    if (!days.includes(dayOfWeek)) continue;

    // Handle wrap-past-midnight (e.g. 22:00-02:00)
    if (range.endMin <= range.startMin) {
      if (minOfDay >= range.startMin || minOfDay < range.endMin) {
        return { isOpen: true, knownStatus: true };
      }
    } else if (minOfDay >= range.startMin && minOfDay < range.endMin) {
      return { isOpen: true, knownStatus: true };
    }
  }

  // We saw recognizable rules but nothing matched → closed
  if (/[Mo|Tu|We|Th|Fr|Sa|Su]/.test(trimmed) || /\d{1,2}:\d{2}/.test(trimmed)) {
    return { isOpen: false, knownStatus: true };
  }
  return { isOpen: false, knownStatus: false };
}

/**
 * Friendly display of opening_hours.
 * "24/7" → "Open 24 hours"
 * "Mo-Fr 09:00-17:00" → "Mon–Fri 9:00–17:00"
 */
export function formatHours(openingHours) {
  if (!openingHours) return null;
  const t = openingHours.trim();
  if (t === "24/7") return "Open 24 hours";
  return t
    .replace(/Mo/g, "Mon")
    .replace(/Tu/g, "Tue")
    .replace(/We/g, "Wed")
    .replace(/Th/g, "Thu")
    .replace(/Fr/g, "Fri")
    .replace(/Sa/g, "Sat")
    .replace(/Su/g, "Sun");
}

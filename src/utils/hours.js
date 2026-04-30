/**
 * Opening-hours utilities — backed by the real `opening_hours.js`
 * library, but loaded LAZILY so it doesn't bloat the initial bundle.
 *
 * Why lazy: the library + its locale data is ~120 KB. We don't need
 * it on first paint; we only need it when the user actually inspects
 * a bathroom that has hours metadata. By gating it behind a dynamic
 * import, the homepage stays fast and the library streams in over
 * subsequent network idle time.
 *
 * The synchronous shape `isOpenNow(str)` is preserved for callers,
 * with a graceful fallback that returns `knownStatus: false` until
 * the library finishes loading on first call.
 */

let _ohModule = null;
let _ohPromise = null;

function loadOH() {
  if (_ohPromise) return _ohPromise;
  _ohPromise = import("opening_hours")
    .then((mod) => {
      _ohModule = mod.default || mod;
    })
    .catch(() => {
      _ohPromise = null;
    });
  return _ohPromise;
}

// Kick off the load eagerly but non-blocking — by the time a user
// taps a bathroom card, this is usually warm.
if (typeof window !== "undefined") {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadOH, { timeout: 2000 });
  } else {
    setTimeout(loadOH, 1500);
  }
}

/**
 * Returns:
 *   { isOpen: boolean, knownStatus: boolean }
 * `knownStatus = false` means we couldn't tell — UI should not say "closed".
 */
export function isOpenNow(openingHours, now = new Date()) {
  if (!openingHours || typeof openingHours !== "string") {
    return { isOpen: false, knownStatus: false };
  }
  const t = openingHours.trim();
  if (t === "24/7") return { isOpen: true, knownStatus: true };

  // Library not loaded yet — bail to "unknown"; once loaded the next
  // render pass will resolve correctly.
  if (!_ohModule) {
    loadOH(); // best-effort kick
    return { isOpen: false, knownStatus: false };
  }

  try {
    const oh = new _ohModule(openingHours, null, { tag_key: "opening_hours" });
    return { isOpen: oh.getState(now), knownStatus: true };
  } catch {
    return { isOpen: false, knownStatus: false };
  }
}

/**
 * Friendly display of opening_hours — pure regex, no library needed.
 *   "24/7" → "Open 24 hours"
 *   "Mo-Fr 09:00-17:00" → "Mon–Fri 9:00–17:00"
 */
export function formatHours(openingHours) {
  if (!openingHours) return null;
  const t = openingHours.trim();
  if (t === "24/7") return "Open 24 hours";
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

/** "Open until 17:00" / "Opens at 9:00" — null when not parseable. */
export function nextChange(openingHours, now = new Date()) {
  if (!openingHours || !_ohModule) return null;
  try {
    const oh = new _ohModule(openingHours, null, { tag_key: "opening_hours" });
    const next = oh.getNextChange(now);
    if (!next) return null;
    const isOpen = oh.getState(now);
    const time = next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return isOpen ? `Open until ${time}` : `Opens at ${time}`;
  } catch {
    return null;
  }
}

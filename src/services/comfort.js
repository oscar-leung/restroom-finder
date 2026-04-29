/**
 * Comfort Mode — accessibility-focused settings for elders, motor-
 * impairment, low-vision, or anyone who wants a calmer, larger UI.
 *
 * NOT a replacement for system-level a11y (screen readers, OS zoom,
 * dynamic type) — a complement. Together they go further.
 *
 * What it changes (when ON):
 *   - Base font size 15px → 18px
 *   - All touch targets at least 56px (was 36–44px)
 *   - Walking time calculated at 55 m/min (elderly pace) instead of 80
 *   - Aurora background blobs hidden (less visual noise)
 *   - Animations dialed back to bare minimum
 *   - GO button bigger and more legible
 *
 * Persisted in localStorage. Triggered by data-comfort="on" on <html>
 * so CSS can scope rules.
 */

const KEY = "gg_comfort_v1";

export function getComfort() {
  try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
}

export function setComfort(on) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
      "data-comfort",
      on ? "on" : "off"
    );
  }
}

export function toggleComfort() {
  const next = !getComfort();
  setComfort(next);
  return next;
}

/**
 * Walking-time helper that respects comfort pace.
 *   Default pace:  80 m/min (avg adult walk)
 *   Comfort pace:  55 m/min (slower / elder / unsteady)
 *
 * Returns minutes (rounded up, min 1).
 */
export function walkingMinutes(distanceMeters) {
  const pace = getComfort() ? 55 : 80;
  return Math.max(1, Math.round(distanceMeters / pace));
}

/**
 * Persona — a one-time picker on first visit that sets sensible
 * defaults for the user's situation. Three options:
 *
 *   "default"  — current experience, all features on
 *   "student"  — college students: free filter on, big share button,
 *                emphasize campus + library tier results, hide tip jar
 *                from the hero (keep it in footer only — broke students)
 *   "senior"   — older / accessibility-first: comfort mode on,
 *                accessible + private filters on, slower walking pace,
 *                gamification (streak, roulette, achievements) hidden,
 *                larger touch targets via comfort mode
 *
 * Persona can be changed any time via the settings menu (future) or
 * by clearing localStorage. It is a HINT, not a hard gate — every
 * feature is still available; we just default the right things on.
 */

import { setComfort } from "./comfort";

const KEY = "gg_persona_v1";
const PICKED_KEY = "gg_persona_picked_v1";
const ALLOWED = new Set(["default", "student", "senior"]);

export function getPersona() {
  try {
    const v = localStorage.getItem(KEY);
    return ALLOWED.has(v) ? v : "default";
  } catch {
    return "default";
  }
}

export function hasPickedPersona() {
  try {
    return localStorage.getItem(PICKED_KEY) === "yes";
  } catch {
    return false;
  }
}

/**
 * Set the persona AND apply the side effects (filters, comfort mode,
 * etc.). Returns the new persona string.
 */
export function setPersona(persona) {
  if (!ALLOWED.has(persona)) persona = "default";
  try {
    localStorage.setItem(KEY, persona);
    localStorage.setItem(PICKED_KEY, "yes");
  } catch {}

  // Apply DOM attribute for CSS targeting
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-persona", persona);
  }

  // Senior persona implies comfort mode
  if (persona === "senior") {
    setComfort(true);
  }

  return persona;
}

/**
 * Initial defaults a persona implies for the filter chips.
 * Caller spreads these onto its own state once on first set.
 */
export function getPersonaFilterDefaults(persona) {
  switch (persona) {
    case "senior":
      // noStairs is lenient (hides only known-other-floor entries), so
      // defaulting it on costs seniors nothing when data is missing.
      return { accessible: true, singleOccupant: true, noStairs: true };
    case "student":
      return { free: true };
    default:
      return {};
  }
}

/**
 * Whether the gamification UI (streak flame, roulette, achievement
 * toasts) should render for this persona. Seniors get a calmer app.
 */
export function showsGamification(persona) {
  return persona !== "senior";
}

/**
 * Whether the tip-jar button should appear inline. Students see it
 * only in the footer (less prominent) so the app doesn't feel like
 * it's asking broke kids for money.
 */
export function showsInlineTipJar(persona) {
  return persona !== "student";
}

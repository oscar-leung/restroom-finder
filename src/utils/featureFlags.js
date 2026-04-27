/**
 * Feature flags + A/B testing framework.
 *
 * Use cases:
 *   1. Ship a feature dark, enable per-cohort, measure in GA4.
 *   2. Run a true A/B test by assigning users to a stable variant on first
 *      load, then comparing event funnels in GA4 with `experiment` as a
 *      custom dimension.
 *   3. Kill switch — flip a flag from "on" → "off" and the next page load
 *      respects it without a redeploy (using URL/localStorage overrides).
 *
 * Flag definition shape:
 *   {
 *     key: "go_button_label",        // unique
 *     description: "...",            // why we're testing it
 *     variants: ["control", "go", "go-now"],  // 1st = control
 *     rollout: 0.5,                  // 0..1, fraction of users in test
 *     default: "control"             // outside-test fallback
 *   }
 *
 * Override priority (first match wins):
 *   1. URL query param   ?ff=go_button_label:go
 *   2. localStorage      window.__ff_overrides
 *   3. Sticky cohort     deterministic by visitor ID + flag key
 *   4. Default
 *
 * Each flag exposure fires a GA4 `experiment_view` event, so the
 * analytics-agent can build proper funnels per variant.
 */

import { trackEvent } from "./analytics";

// All defined flags. ADD NEW FLAGS HERE.
export const FLAGS = {
  // Example: testing whether "GO" or "GO NOW" performs better
  go_button_label: {
    description: "Big button copy on the hero card",
    variants: ["control", "go-now"],
    rollout: 0.5,
    default: "control",
  },
  // Example: gate the country filter (P2 #15) until ready for full rollout
  country_filter: {
    description: "Show country/region filter dropdown",
    variants: ["off", "on"],
    rollout: 0.0, // start at 0% — flip up when ready
    default: "off",
  },
  // Aurora intensity — let us A/B "bold" vs "subtle"
  aurora_intensity: {
    description: "Visual intensity of background aurora",
    variants: ["subtle", "bold"],
    rollout: 0.5,
    default: "subtle",
  },
};

// ---- Visitor ID — stable across visits, anonymous ----------------

const VISITOR_KEY = "gg_visitor_id";

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "v-anon";
  }
}

// ---- Deterministic hash for stable cohort assignment -------------

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  // unsigned, normalized to 0..1
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

// ---- Override sources --------------------------------------------

function urlOverride(key) {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ff = params.get("ff");
  if (!ff) return null;
  for (const pair of ff.split(",")) {
    const [k, v] = pair.split(":");
    if (k === key && v) return v;
  }
  return null;
}

function localOverride(key) {
  try {
    const raw = localStorage.getItem("ff_overrides");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.[key] ?? null;
  } catch {
    return null;
  }
}

// ---- Public API --------------------------------------------------

const exposed = new Set();

/**
 * Resolve which variant of a flag the current visitor sees.
 * Fires a one-time `experiment_view` GA4 event the first time it's read.
 */
export function getFlag(key) {
  const flag = FLAGS[key];
  if (!flag) {
    console.warn(`[ff] unknown flag: ${key}`);
    return null;
  }

  // 1. URL > 2. localStorage > 3. cohort > 4. default
  const override = urlOverride(key) ?? localOverride(key);
  let variant;
  if (override && flag.variants.includes(override)) {
    variant = override;
  } else {
    const visitor = getVisitorId();
    const bucket = hash(`${visitor}:${key}`);
    if (bucket >= flag.rollout) {
      variant = flag.default;
    } else {
      // Split the rollout uniformly across non-default variants
      const test = flag.variants.filter((v) => v !== flag.default);
      const idx = Math.floor((bucket / flag.rollout) * test.length);
      variant = test[Math.min(idx, test.length - 1)];
    }
  }

  // Fire one-time exposure event for analytics segmentation
  const exposureKey = `${key}:${variant}`;
  if (!exposed.has(exposureKey)) {
    exposed.add(exposureKey);
    trackEvent("experiment_view", {
      flag: key,
      variant,
      visitor: getVisitorId(),
    });
  }

  return variant;
}

/** Convenience boolean check for on/off flags. */
export function isFlagOn(key) {
  return getFlag(key) !== "off" && getFlag(key) !== "control";
}

/** Set a local override. Useful for QA: window.setFlag("go_button_label","go-now"). */
export function setFlag(key, variant) {
  try {
    const raw = localStorage.getItem("ff_overrides");
    const obj = raw ? JSON.parse(raw) : {};
    obj[key] = variant;
    localStorage.setItem("ff_overrides", JSON.stringify(obj));
  } catch {}
}

/** Clear all local overrides. */
export function clearOverrides() {
  try {
    localStorage.removeItem("ff_overrides");
  } catch {}
}

// Expose helpers in dev for fast QA
if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.setFlag = setFlag;
  window.clearOverrides = clearOverrides;
  window.getFlag = getFlag;
  window.FLAGS = FLAGS;
}

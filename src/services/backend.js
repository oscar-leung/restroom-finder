/**
 * Backend client — talks to the Cloudflare Worker in workers/api.js.
 *
 * HARD-GATED on VITE_API_BASE: when the env var is absent (every build
 * until Oscar deploys the worker — see workers/RUNBOOK.md), every
 * function here is a cheap no-op and the app behaves exactly as the
 * device-local version. All writes are fire-and-forget: the UI never
 * waits on the network for a tap.
 */

const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export function isBackendOn() {
  return BASE.length > 0;
}

// Same anonymous device id the A/B framework uses (gg_visitor_id).
function visitorId() {
  try {
    let id = localStorage.getItem("gg_visitor_id");
    if (!id) {
      id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("gg_visitor_id", id);
    }
    return id;
  } catch {
    return "v-anon";
  }
}

/** Fire-and-forget: mirror a condition report to the shared backend. */
export function postReport(bathroomId, type) {
  if (!BASE) return;
  fetch(`${BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bathroomId, type, visitorId: visitorId() }),
    keepalive: true, // survives page navigation after a GO tap
  }).catch(() => { /* offline / blocked — local copy already saved */ });
}

/** Fire-and-forget: count an anonymous GO tap. */
export function postVisit(bathroomId) {
  if (!BASE) return;
  fetch(`${BASE}/api/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bathroomId, visitorId: visitorId() }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Cross-user report state for one bathroom:
 *   { counts: {clean: 2, dirty: 1}, latest: [{type, ts}] } — or null
 * when the backend is off/unreachable.
 */
export async function fetchRemoteReports(bathroomId) {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/api/reports/${encodeURIComponent(bathroomId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** All-time GO counts for up to 50 ids: { id: count }. */
export async function fetchPopularity(ids) {
  if (!BASE || !ids?.length) return {};
  try {
    const res = await fetch(
      `${BASE}/api/popularity?ids=${ids.slice(0, 50).map(encodeURIComponent).join(",")}`
    );
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

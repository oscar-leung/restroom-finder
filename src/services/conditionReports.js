/**
 * Condition reports — GasBuddy for bathrooms.
 *
 * One-tap quick reports tell other users (and the bathroom owner, when
 * B2B ships) the current state. Reporting earns points.
 *
 * Conditions:
 *   - clean         → +5 pts (positive verification)
 *   - needs_supplies → +10 pts (actionable signal for owner)
 *   - out_of_order  → +15 pts (saves wasted trips)
 *   - dirty         → +5 pts (warning for next user)
 *
 * Points stay in localStorage until backend ships, then sync.
 *
 * Storage:
 *   gg_conditions_v1: { [bathroomId]: [{type, ts, byVisitorId}] }
 *   gg_points_v1:     { total: number, lifetime: number, byType: {...} }
 */

const COND_KEY = "gg_conditions_v1";
const POINTS_KEY = "gg_points_v1";
const SUPPRESS_KEY = "gg_suppressed_v1";

export const REPORT_TYPES = {
  clean:           { label: "Clean",          icon: "✨", points: 5,  weight: +1 },
  dirty:           { label: "Dirty",          icon: "🤢", points: 5,  weight: -1 },
  needs_supplies:  { label: "Needs supplies", icon: "🧻", points: 10, weight: -0.5 },
  out_of_order:    { label: "Out of order",   icon: "🚫", points: 15, weight: -2 },
  // "I walked here and there's no bathroom" — the most expensive data
  // error an app like this can have. Suppresses the entry on this
  // device (see isSuppressed) until the backend can aggregate votes.
  not_here:        { label: "Doesn't exist",  icon: "👻", points: 15, weight: -3 },
};

function readConditions() {
  try { return JSON.parse(localStorage.getItem(COND_KEY)) || {}; } catch { return {}; }
}
function writeConditions(o) { try { localStorage.setItem(COND_KEY, JSON.stringify(o)); } catch {} }

function readPoints() {
  try { return JSON.parse(localStorage.getItem(POINTS_KEY)) || { total: 0, lifetime: 0, byType: {} }; }
  catch { return { total: 0, lifetime: 0, byType: {} }; }
}
function writePoints(o) { try { localStorage.setItem(POINTS_KEY, JSON.stringify(o)); } catch {} }

function getVisitorId() {
  try {
    let id = localStorage.getItem("gg_visitor_id");
    if (!id) {
      id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem("gg_visitor_id", id);
    }
    return id;
  } catch { return "anon"; }
}

/**
 * File a condition report. Returns the awarded points + new state.
 * Rate-limit: at most one report per type per bathroom per 30 min.
 */
export function reportCondition(bathroomId, type) {
  if (!REPORT_TYPES[type] || !bathroomId) return null;

  const all = readConditions();
  const list = all[bathroomId] || [];
  const visitorId = getVisitorId();
  const cutoff = Date.now() - 30 * 60 * 1000;
  const recent = list.find(
    (r) => r.type === type && r.byVisitorId === visitorId && new Date(r.ts).getTime() > cutoff
  );
  if (recent) return { rateLimited: true };

  const report = {
    type,
    ts: new Date().toISOString(),
    byVisitorId: visitorId,
  };
  all[bathroomId] = [report, ...list].slice(0, 50); // cap history
  writeConditions(all);

  // "Doesn't exist" also hides the entry from this device's results
  if (type === "not_here") suppress(bathroomId);

  // Award points
  const pts = readPoints();
  const award = REPORT_TYPES[type].points;
  pts.total += award;
  pts.lifetime += award;
  pts.byType[type] = (pts.byType[type] || 0) + 1;
  writePoints(pts);

  return { awarded: award, total: pts.total, type, report };
}

export function getRecentReports(bathroomId, hours = 24) {
  const list = readConditions()[bathroomId] || [];
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return list.filter((r) => new Date(r.ts).getTime() > cutoff);
}

/**
 * Aggregate "current state" view for a bathroom: what's been reported
 * in the last 24h, with most recent first.
 */
export function getBathroomState(bathroomId) {
  const recent = getRecentReports(bathroomId, 24);
  if (recent.length === 0) return null;
  // Most recent of each type
  const seen = new Set();
  const condensed = [];
  for (const r of recent) {
    if (!seen.has(r.type)) {
      seen.add(r.type);
      condensed.push(r);
    }
  }
  return condensed;
}

/**
 * Worst negative report in the last 24h — powers the ROADMAP P2 #20
 * "warning badge outside the details modal". A "clean" report newer
 * than every negative one clears the warning (the state improved).
 * Reports are device-local until the backend ships, so this reflects
 * what THIS user reported.
 */
export function getConditionWarning(bathroomId) {
  const recent = getRecentReports(bathroomId, 24);
  if (!recent.length) return null;
  const negatives = recent.filter((r) => (REPORT_TYPES[r.type]?.weight ?? 0) < 0);
  if (!negatives.length) return null;
  const newestNegativeTs = Math.max(...negatives.map((r) => +new Date(r.ts)));
  // >= not >: reports filed in the same millisecond (burst-tapping the
  // buttons) still count the clean as the later signal — the reports
  // list is newest-first, so a same-ts clean was filed after.
  const clearedBy = recent.some(
    (r) => r.type === "clean" && +new Date(r.ts) >= newestNegativeTs
  );
  if (clearedBy) return null;
  negatives.sort(
    (a, b) => REPORT_TYPES[a.type].weight - REPORT_TYPES[b.type].weight
  );
  const worst = negatives[0];
  return { type: worst.type, ts: worst.ts, ...REPORT_TYPES[worst.type] };
}

/* ------------------- "Doesn't exist" suppression ------------------- */
/*
 * A not_here report hides the entry from results on this device —
 * persistent, unlike the 24h warning window, because a phantom
 * bathroom doesn't come back. Bulk-restorable from the main screen
 * (single-entry undo is impossible once the entry is hidden).
 * Device-local until the backend can aggregate votes across users.
 */

function readSuppressed() {
  try { return JSON.parse(localStorage.getItem(SUPPRESS_KEY)) || {}; } catch { return {}; }
}
function writeSuppressed(o) {
  try { localStorage.setItem(SUPPRESS_KEY, JSON.stringify(o)); } catch { /* non-fatal */ }
}

export function suppress(bathroomId) {
  const all = readSuppressed();
  all[bathroomId] = new Date().toISOString();
  writeSuppressed(all);
}

export function isSuppressed(bathroomId) {
  return bathroomId in readSuppressed();
}

export function getSuppressedCount() {
  return Object.keys(readSuppressed()).length;
}

export function clearSuppressed() {
  try { localStorage.removeItem(SUPPRESS_KEY); } catch { /* non-fatal */ }
}

export function getPoints() { return readPoints(); }

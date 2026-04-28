/**
 * Cleaning Log — track when a bathroom was last reported clean.
 *
 * Anyone can tap "I was just here, it's clean" to stamp it. Anyone
 * else can see the latest stamp on the hero/details ("Cleaned 2h ago").
 *
 * Device-local until backend lands. Then becomes the basis for the
 * paid-bounty data freshness signal: bathrooms not stamped in N days
 * earn a $1 bounty for the next person to verify them.
 *
 * Storage shape:
 *   localStorage["gg_cleaning_v1"] = {
 *     [bathroomId]: { lastCleanedAt: ISO, byVisitorId: string, count: number }
 *   }
 */

const KEY = "gg_cleaning_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} }

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

export function reportClean(bathroomId) {
  if (!bathroomId) return null;
  const all = read();
  const prev = all[bathroomId] || { count: 0 };
  all[bathroomId] = {
    lastCleanedAt: new Date().toISOString(),
    byVisitorId: getVisitorId(),
    count: prev.count + 1,
  };
  write(all);
  return all[bathroomId];
}

export function getCleaningLog(bathroomId) {
  return read()[bathroomId] || null;
}

/** Format relative: "just now" / "2h ago" / "yesterday" / "3d ago". */
export function formatRelative(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/**
 * Bounty eligibility: bathrooms not stamped in 14+ days are "stale"
 * and earn a $1 bounty for the next verifier (when the system goes
 * live). Returns null if data is fresh.
 */
const BOUNTY_STALE_DAYS = 14;
export function getBountyStatus(bathroomId) {
  const log = read()[bathroomId];
  if (!log?.lastCleanedAt) {
    return { eligible: true, reason: "Never verified", value: 1 };
  }
  const days = (Date.now() - new Date(log.lastCleanedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days >= BOUNTY_STALE_DAYS) {
    return { eligible: true, reason: `Stale (${Math.floor(days)} days)`, value: 1 };
  }
  return { eligible: false };
}

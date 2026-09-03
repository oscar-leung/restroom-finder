/**
 * Fixture data — stall counts, sinks, paper towels, changing tables.
 *
 * ROADMAP ("Fixture data"): most OSM entries lack these tags, so the
 * fastest way to populate them is a quick-edit form on each bathroom.
 * Edits live in localStorage until the backend ships, then sync — the
 * same story as reviews and condition reports.
 *
 * Merge rule: what the user typed beats what the source said.
 *
 * Storage:
 *   gg_fixtures_v1: { [bathroomId]: {stalls, sink, paper_towels,
 *                     changing_table, updatedAt} }
 */

const KEY = "gg_fixtures_v1";

// The editable fields, in display order. `kind` drives the form input:
// "count" renders a number input, "bool" a Yes/No/Unknown select.
export const FIXTURE_FIELDS = [
  { key: "stalls", label: "Stalls", icon: "🚻", kind: "count" },
  { key: "sink", label: "Sink", icon: "🚰", kind: "bool" },
  { key: "paper_towels", label: "Paper towels", icon: "🧻", kind: "bool" },
  { key: "changing_table", label: "Changing table", icon: "🚼", kind: "bool" },
];

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function writeAll(o) {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* non-fatal */ }
}

/** The user's own edits for one bathroom (or null). */
export function getFixtureEdits(bathroomId) {
  return readAll()[bathroomId] || null;
}

/**
 * Save edits. Pass only the fields the user actually set — null/""
 * values are dropped so they don't mask source data.
 */
export function saveFixtureEdits(bathroomId, edits) {
  const all = readAll();
  const clean = {};
  for (const f of FIXTURE_FIELDS) {
    const v = edits[f.key];
    if (v === null || v === undefined || v === "") continue;
    clean[f.key] = f.kind === "count" ? Math.max(0, Number(v) || 0) : v === true || v === "yes";
  }
  if (Object.keys(clean).length === 0) {
    delete all[bathroomId];
  } else {
    all[bathroomId] = { ...clean, updatedAt: new Date().toISOString() };
  }
  writeAll(all);
  return all[bathroomId] || null;
}

/**
 * Merged view for display: user edits > source tags. Returns
 * { stalls: number|null, sink: bool|null, paper_towels: bool|null,
 *   changing_table: bool|null, edited: bool }
 */
export function getMergedFixtures(restroom) {
  const src = restroom?.fixtures || {};
  const edits = restroom ? getFixtureEdits(restroom.id) : null;
  const pick = (editVal, srcVal) => (editVal !== undefined ? editVal : srcVal ?? null);
  return {
    stalls: pick(edits?.stalls, src.stalls ?? src.toilets),
    sink: pick(edits?.sink, src.sink === true ? true : null),
    paper_towels: pick(edits?.paper_towels, src.paper_towels === true ? true : null),
    changing_table: pick(edits?.changing_table, restroom?.baby_change === true ? true : null),
    edited: !!edits,
  };
}

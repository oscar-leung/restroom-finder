import { useState, useEffect, useCallback } from "react";

/**
 * useUsagePatterns — privacy-first usage tracking, localStorage only.
 *
 * What it does:
 *   - Records timestamps every time the user taps the "GO" button.
 *   - Computes the user's 2–3 most common hours (their "pattern").
 *   - Tells you if NOW is close to a typical go-time — useful for the
 *     predictive banner ("You usually go around 2pm — there's one 3min away").
 *
 * What it does NOT do:
 *   - Send anything to a server. Lives entirely in the browser.
 *   - Track across devices. (That's an account-only feature.)
 *
 * Storage shape:
 *   localStorage["restroom_usage_v1"] = JSON array of ISO timestamps, capped
 *   at the last 50 entries so old patterns fade as habits change.
 */

const STORAGE_KEY = "restroom_usage_v1";
const MAX_ENTRIES = 50;
const MIN_ENTRIES_FOR_PATTERN = 5; // don't predict with too little data

function readLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLog(log) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX_ENTRIES)));
  } catch {
    // Quota exceeded or private mode — fail silently
  }
}

/**
 * From a list of ISO timestamps, compute the top-N most common hours (0–23)
 * and return them sorted by frequency.
 */
function computeTopHours(log, topN = 3) {
  const counts = new Array(24).fill(0);
  log.forEach((iso) => {
    const h = new Date(iso).getHours();
    if (!isNaN(h)) counts[h] += 1;
  });
  return counts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Is the current hour within 1 hour of one of the user's typical go-times?
 */
function isNearTypicalTime(topHours, now = new Date()) {
  const current = now.getHours();
  return topHours.some(({ hour }) => Math.abs(current - hour) <= 1);
}

function formatHour(h) {
  if (h === 0) return "12am";
  if (h === 12) return "noon";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

export default function useUsagePatterns() {
  const [log, setLog] = useState([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setLog(readLog());
  }, []);

  const record = useCallback(() => {
    const updated = [...readLog(), new Date().toISOString()];
    writeLog(updated);
    setLog(updated.slice(-MAX_ENTRIES));
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setLog([]);
  }, []);

  const hasPattern = log.length >= MIN_ENTRIES_FOR_PATTERN;
  const topHours = hasPattern ? computeTopHours(log) : [];
  const inTypicalWindow = hasPattern && isNearTypicalTime(topHours);

  // Human-readable hint, e.g. "You usually go around 2pm"
  const hint = hasPattern
    ? `You usually go around ${formatHour(topHours[0].hour)}`
    : null;

  return {
    record,
    clear,
    hasPattern,
    inTypicalWindow,
    hint,
    entryCount: log.length,
  };
}

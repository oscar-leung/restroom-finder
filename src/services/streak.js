/**
 * Streak — counts consecutive days the user has opened Gotta Go and
 * tapped GO at least once. Duolingo-style flame counter.
 *
 * "Use the bathroom every day" is biologically inevitable — the
 * streak gimmick is harmless gamification that gives users a small
 * reason to come back tomorrow.
 *
 * Storage shape:
 *   localStorage["gg_streak_v1"] = {
 *     count: number,
 *     lastDay: "YYYY-MM-DD" (local-date string),
 *     longest: number
 *   }
 */

const KEY = "gg_streak_v1";

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} }

/**
 * Touch the streak — call this when the user does something
 * meaningful (we use it on GO clicks).
 *
 * Returns:
 *   {
 *     count,           // current streak (after touch)
 *     longest,
 *     advanced: bool   // did this touch advance the streak by 1 today?
 *     reset: bool      // did the streak just reset to 1 because gap > 1d?
 *   }
 */
export function touchStreak() {
  const today = todayLocal();
  const prev = read();
  if (!prev) {
    const fresh = { count: 1, lastDay: today, longest: 1 };
    write(fresh);
    return { ...fresh, advanced: true, reset: false };
  }
  if (prev.lastDay === today) {
    // Already counted today; no change
    return { ...prev, advanced: false, reset: false };
  }
  // Was yesterday? Streak continues
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  if (prev.lastDay === yesterday) {
    const next = {
      count: prev.count + 1,
      lastDay: today,
      longest: Math.max(prev.longest || 0, prev.count + 1),
    };
    write(next);
    return { ...next, advanced: true, reset: false };
  }
  // Gap → reset to 1
  const next = { count: 1, lastDay: today, longest: prev.longest || 1 };
  write(next);
  return { ...next, advanced: true, reset: true };
}

export function getStreak() {
  const today = todayLocal();
  const data = read();
  if (!data) return { count: 0, longest: 0, isToday: false };
  return {
    count: data.count || 0,
    longest: data.longest || 0,
    isToday: data.lastDay === today,
  };
}

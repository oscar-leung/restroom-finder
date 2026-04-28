/**
 * Achievements — fun, optional, never naggy.
 *
 * Tiny gamification layer that fires a celebratory toast the FIRST time
 * a user does something notable. Never repeats. Stored locally so it
 * doesn't pester anyone across devices.
 *
 * The achievements are lightly snarky on purpose — we are a bathroom
 * app, lean into it.
 */

const KEY = "gg_achievements_v1";

const ACHIEVEMENTS = {
  first_go: {
    title: "First Flush",
    desc: "You used the GO button. Welcome to Gotta Go.",
    icon: "🚀",
  },
  first_swipe: {
    title: "Picky Pee-er",
    desc: "Swiped past the closest one. Standards! We respect that.",
    icon: "👌",
  },
  first_add: {
    title: "Founding Plumber",
    desc: "Added your first bathroom. Future strangers thank you.",
    icon: "🏗️",
  },
  first_review: {
    title: "Critic",
    desc: "Wrote your first review. Honest opinions matter.",
    icon: "✍️",
  },
  first_favorite: {
    title: "Speed Dial",
    desc: "Pinned your first favorite. Quick access forever.",
    icon: "⭐",
  },
  first_roulette: {
    title: "Adventurer",
    desc: "Rolled the toilet dice. Bold.",
    icon: "🎲",
  },
  three_visits: {
    title: "Regular",
    desc: "Visited the same bathroom 3 times. You have a usual.",
    icon: "🪑",
  },
  five_added: {
    title: "Cartographer",
    desc: "Added 5 bathrooms. You're mapping the world's relief.",
    icon: "🗺️",
  },
  three_cities: {
    title: "Globe Trotter",
    desc: "Used Gotta Go in 3 different cities.",
    icon: "🌍",
  },
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

function write(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}

/**
 * Try to unlock an achievement. Returns the achievement object if it
 * was newly unlocked (so the UI can show a toast), or null if it was
 * already unlocked / doesn't exist.
 */
export function tryUnlock(id) {
  if (!ACHIEVEMENTS[id]) return null;
  const state = read();
  if (state[id]) return null; // already unlocked
  state[id] = { unlockedAt: new Date().toISOString() };
  write(state);
  return { id, ...ACHIEVEMENTS[id] };
}

export function getUnlocked() {
  const state = read();
  return Object.entries(state).map(([id, meta]) => ({
    id,
    ...ACHIEVEMENTS[id],
    ...meta,
  }));
}

export function getAllAchievements() {
  return ACHIEVEMENTS;
}

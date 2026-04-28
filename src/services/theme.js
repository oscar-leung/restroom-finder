/**
 * Theme switcher — currently two themes:
 *   - "default": pastel pink-violet kawaii
 *   - "cyber":   neon 2077 cyberpunk dark mode
 *
 * Theme is applied as `data-theme="<name>"` on document.documentElement
 * so CSS can scope styles via `[data-theme="cyber"] .hero { ... }`.
 *
 * Persisted in localStorage. Honors system dark-mode preference on
 * first visit only — after that the user's explicit choice wins.
 */

const KEY = "gg_theme_v1";
const ALLOWED = new Set(["default", "cyber"]);

function detectInitial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && ALLOWED.has(saved)) return saved;
  } catch {}
  // First-visit default: stay light. Cyber is opt-in.
  return "default";
}

export function getTheme() {
  return detectInitial();
}

export function applyTheme(theme) {
  if (!ALLOWED.has(theme)) theme = "default";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
  try { localStorage.setItem(KEY, theme); } catch {}
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "cyber" ? "default" : "cyber";
  applyTheme(next);
  return next;
}

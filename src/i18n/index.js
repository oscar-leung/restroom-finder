import { useSyncExternalStore, useCallback } from "react";
import { STRINGS } from "./strings";

/**
 * Tiny dependency-free i18n (ROADMAP P2 #19).
 *
 * Why not i18next: our whole string table is a few KB and the GO
 * button is the product — a 40KB i18n runtime on the critical path
 * buys nothing here (decision principle #1: speed over surface area).
 *
 * Locale resolution: localStorage override > navigator.language > en.
 * Missing keys and missing translations fall back to English so a
 * half-translated locale never breaks the UI.
 *
 * Usage:
 *   const { t, locale, setLocale } = useI18n();
 *   t("filter.accessible")            → "Accessible" / "Accesible" / …
 *   t("count.nearby", { n: 12 })      → "12 nearby" ({n} interpolation)
 */

export const LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const KEY = "gg_locale_v1";
const SUPPORTED = new Set(LOCALES.map((l) => l.code));

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && SUPPORTED.has(saved)) return saved;
  } catch { /* private mode */ }
  if (typeof navigator !== "undefined") {
    const lang = (navigator.language || "").slice(0, 2).toLowerCase();
    if (SUPPORTED.has(lang)) return lang;
  }
  return "en";
}

let current = detect();
const listeners = new Set();

// Reflect the detected locale on <html lang> at startup too — not just
// when the user switches (screen readers pick pronunciation from it).
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("lang", current);
}

export function getLocale() {
  return current;
}

export function setLocale(code) {
  if (!SUPPORTED.has(code)) return;
  current = code;
  try { localStorage.setItem(KEY, code); } catch { /* non-fatal */ }
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", code);
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a key in the given (or current) locale, with {var} interpolation. */
export function translate(key, vars, locale = current) {
  const entry = STRINGS[key];
  let text = entry ? entry[locale] ?? entry.en : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

/** React hook — re-renders subscribers when the locale changes. */
export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getLocale, () => "en");
  const t = useCallback(
    (key, vars) => translate(key, vars, locale),
    [locale]
  );
  return { t, locale, setLocale };
}

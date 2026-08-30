import { useState, useEffect, useRef, useCallback } from "react";
import { trackEvent } from "../utils/analytics";

/**
 * useInstallPrompt — decide when to nudge "Add to Home Screen".
 *
 * Product rule (ROADMAP "PWA install prompt"): don't beg on first
 * contact. The nudge appears from the 2nd distinct-day visit onward,
 * and one dismissal silences it for good on that device.
 *
 * Three device buckets:
 *   - Chromium (Android/desktop): `beforeinstallprompt` fires; we
 *     stash the event and can trigger the real install sheet.
 *   - iOS Safari: no install API at all — we show manual
 *     Share → "Add to Home Screen" instructions instead.
 *   - Already installed (standalone display-mode): never show.
 *
 * Storage:
 *   gg_visit_days_v1        – count of distinct days the app was opened
 *   gg_visit_last_day_v1    – YYYY-MM-DD of the last counted visit
 *   gg_install_dismissed_v1 – "true" once the user closes the nudge
 */

const DAYS_KEY = "gg_visit_days_v1";
const LAST_DAY_KEY = "gg_visit_last_day_v1";
const DISMISS_KEY = "gg_install_dismissed_v1";
const MIN_VISIT_DAYS = 2;

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

// Count at most one visit per calendar day so refresh-spamming
// doesn't race users to the nudge. Returns the running total.
function bumpVisitDays() {
  try {
    const today = todayStamp();
    const last = localStorage.getItem(LAST_DAY_KEY);
    let days = parseInt(localStorage.getItem(DAYS_KEY) || "0", 10) || 0;
    if (last !== today) {
      days += 1;
      localStorage.setItem(LAST_DAY_KEY, today);
      localStorage.setItem(DAYS_KEY, String(days));
    }
    return days;
  } catch {
    return 0;
  }
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true // iOS Safari legacy flag
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua) ||
    // iPadOS 13+ masquerades as macOS but is touch-capable
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

// Runs once per mount, synchronously — bumps the visit counter and
// answers "should the nudge show, and in which mode, if the platform
// allows it?". Keeping this out of an effect avoids a re-render and
// lets iOS (which never fires beforeinstallprompt) show immediately.
function initialState() {
  if (isStandalone()) return { eligible: false, visible: false, mode: null, days: 0 };
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === "true"; } catch { /* private mode */ }
  const days = bumpVisitDays();
  const eligible = !dismissed && days >= MIN_VISIT_DAYS;
  const ios = eligible && isIosSafari();
  return {
    eligible,
    days,
    visible: ios,
    mode: ios ? "ios" : null,
  };
}

export default function useInstallPrompt() {
  const [state, setState] = useState(initialState);
  // The stashed beforeinstallprompt event (Chromium only)
  const deferredEvent = useRef(null);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e) => {
      e.preventDefault(); // suppress Chrome's mini-infobar
      deferredEvent.current = e;
      setState((s) =>
        s.eligible ? { ...s, visible: true, mode: "native" } : s
      );
    };
    const onInstalled = () => {
      setState((s) => ({ ...s, visible: false }));
      trackEvent("app_installed");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Analytics: one event per shown nudge (mode can upgrade ios→native
  // only across page loads, so this fires at most once per mount).
  useEffect(() => {
    if (state.visible) {
      trackEvent("install_prompt_shown", { mode: state.mode, visit_days: state.days });
    }
  }, [state.visible, state.mode, state.days]);

  // Fire the real Chromium install sheet
  const install = useCallback(async () => {
    const ev = deferredEvent.current;
    if (!ev) return;
    ev.prompt();
    const { outcome } = await ev.userChoice;
    trackEvent("install_prompt_answered", { outcome });
    deferredEvent.current = null;
    setState((s) => ({ ...s, visible: false }));
    if (outcome !== "accepted") {
      try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* non-fatal */ }
    }
  }, []);

  const dismiss = useCallback(() => {
    trackEvent("install_prompt_dismissed", { mode: state.mode });
    setState((s) => ({ ...s, visible: false }));
    try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* non-fatal */ }
  }, [state.mode]);

  return { visible: state.visible, mode: state.mode, install, dismiss };
}

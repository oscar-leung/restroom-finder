/**
 * Google Analytics 4 — minimal, opt-in via env var.
 *
 * Setup (5 minutes):
 *   1. Go to https://analytics.google.com and create a GA4 property.
 *   2. Under Admin → Data Streams → Web, add your site.
 *   3. Copy the "Measurement ID" (looks like G-XXXXXXX).
 *   4. In Vercel, add env var VITE_GA_ID = G-XXXXXXX and redeploy.
 *      (Locally, create a .env file in the project root with the same line.)
 *
 * If VITE_GA_ID is not set (dev mode, fresh clone) this module does
 * absolutely nothing — no network requests, no cookies.
 */

const GA_ID = import.meta.env.VITE_GA_ID;
const enabled = Boolean(GA_ID);

/**
 * Inject the GA4 script tag once, then configure the measurement ID.
 * Safe to call from anywhere — no-ops if already loaded or disabled.
 */
export function initAnalytics() {
  if (!enabled || typeof window === "undefined") return;
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;

  // 1. Async script
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  // 2. gtag shim + config
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    // Don't send a pageview on load — we send custom events below
    send_page_view: true,
  });
}

/**
 * Track a custom event. Use descriptive action names (snake_case).
 *   trackEvent("go_clicked", { distance_m: 124 })
 */
export function trackEvent(action, params = {}) {
  if (!enabled || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}

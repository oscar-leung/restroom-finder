/**
 * Google AdSense — env-gated placeholder.
 *
 * The same pattern as analytics.js: if VITE_ADSENSE_CLIENT is not set
 * in the environment, this module does nothing — no script load, no
 * cookies, no requests. The moment you set it as a repo secret and
 * redeploy, ads light up.
 *
 * Setup once you have an AdSense account approved:
 *   1. Get your "client ID" — looks like `ca-pub-1234567890123456`
 *   2. In GitHub: Settings → Secrets → Actions → New repository secret
 *      Name: VITE_ADSENSE_CLIENT
 *      Value: ca-pub-XXXXXXXXXXXXXXXX
 *   3. Trigger a redeploy (push any commit, or run the workflow)
 *   4. Verify: open the live site, view source, you should see the
 *      AdSense loader script in <head>
 *
 * Where ads render:
 *   - <AdUnit slot="bottom" /> below the alternative cards
 *   - <AdUnit slot="modal-top" /> in the details modal header
 *   - NEVER on the GO button or the hero — that's the conversion event
 *
 * Auto Ads vs. manual placement:
 *   We use auto-ads (page-level) for now — Google's AI picks placements.
 *   Once we have real traffic data we can lock in 2-3 manual slots and
 *   disable auto for predictable RPM.
 */

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const enabled = Boolean(CLIENT);

export function initAdSense() {
  if (!enabled || typeof window === "undefined") return;
  if (window.__adsenseLoaded) return;
  window.__adsenseLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
}

export function isAdSenseEnabled() {
  return enabled;
}

export function getAdSenseClient() {
  return CLIENT || null;
}

import { useEffect, useRef } from "react";
import { isAdSenseEnabled, getAdSenseClient } from "../services/adsense";

/**
 * AdUnit — a single AdSense slot. Renders nothing if AdSense isn't
 * enabled (no env var) — so the layout doesn't reserve empty boxes
 * pre-launch.
 *
 * Props:
 *   slot   — your AdSense ad unit ID (e.g., "1234567890")
 *   format — "auto" (responsive) by default
 *   style  — optional inline styles
 */
export default function AdUnit({ slot, format = "auto", style }) {
  const insRef = useRef(null);

  useEffect(() => {
    if (!isAdSenseEnabled() || !insRef.current) return;
    try {
      // Tell AdSense to fill this <ins> slot
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      // Common in dev with adblockers — non-fatal
      console.debug("AdSense push failed", err);
    }
  }, []);

  if (!isAdSenseEnabled()) return null;

  return (
    <div className="ad-unit" aria-label="advertisement">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={getAdSenseClient()}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

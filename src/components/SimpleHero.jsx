import { formatDistance } from "../utils/distance";
import { walkingMinutes } from "../services/comfort";
import { bearing, bearingToCardinal } from "../services/routing";
import { trackEvent } from "../utils/analytics";
import { getFlag } from "../utils/featureFlags";

/**
 * SimpleHero — the radically minimal hero for Simple Mode.
 *
 * Three A/B variants exposed via the `simple_hero_variant` flag:
 *
 *   "minimal"      — Name + walking time + GO button. Nothing else.
 *   "directional"  — Above, plus a compass arrow ("head NE").
 *   "dual-line"    — Above (minimal), plus a small "Not it? Next" link.
 *
 * The variant is sticky per visitor; we fire `experiment_view` on
 * mount so GA4 can split go_clicked rate per variant. After ~7 days
 * the analytics-agent reports which won and we promote it to default.
 *
 * Props:
 *   restroom        — closest pick (with .distance attached)
 *   userPosition    — for compass calculation (directional variant only)
 *   onGo            — fired when user taps the GO button
 *   onNext          — fired when user taps "Next" (dual-line variant)
 *   onShowMore      — fired when user taps the "More options" expander
 */
export default function SimpleHero({
  restroom,
  userPosition,
  onGo,
  onNext,
  onShowMore,
}) {
  if (!restroom) return null;

  const variant = getFlag("simple_hero_variant");
  const walk = walkingMinutes(restroom.distance);
  const cardinal =
    userPosition && restroom.latitude
      ? bearingToCardinal(
          bearing(
            userPosition.latitude,
            userPosition.longitude,
            restroom.latitude,
            restroom.longitude
          )
        )
      : null;

  // Universal maps deep-link — Apple Maps on iOS, Google on Android,
  // maps.google.com on desktop
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}&travelmode=walking`;

  const handleGo = () => {
    trackEvent("go_clicked", {
      mode: "simple",
      variant,
      distance_m: Math.round(restroom.distance),
    });
    onGo?.();
  };

  return (
    <div className={`simple-hero simple-hero-${variant}`}>
      <div className="simple-name">
        {restroom.name || "Public Restroom"}
      </div>

      <div className="simple-meta">
        <span className="simple-distance">{formatDistance(restroom.distance)}</span>
        <span className="simple-dot">·</span>
        <span className="simple-walk">{walk} min walk</span>
        {variant === "directional" && cardinal && (
          <>
            <span className="simple-dot">·</span>
            <span className="simple-direction">go {cardinal}</span>
          </>
        )}
      </div>

      <a
        className="simple-go"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleGo}
      >
        GO
      </a>

      {variant === "dual-line" && onNext && (
        <button className="simple-next-link" onClick={onNext}>
          Not it? Show next →
        </button>
      )}

      {onShowMore && (
        <button className="simple-more-link" onClick={onShowMore}>
          More options
        </button>
      )}
    </div>
  );
}

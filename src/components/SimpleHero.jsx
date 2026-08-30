import { formatDistance } from "../utils/distance";
import { walkingMinutes } from "../services/comfort";
import { bearing, bearingToCardinal } from "../services/routing";
import { trackEvent } from "../utils/analytics";
import { getFlag } from "../utils/featureFlags";
import { isOpenNow } from "../utils/hours";
import { useI18n } from "../i18n";

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
  // Hook must run unconditionally — keep it above the early return
  const { t } = useI18n();
  if (!restroom) return null;

  const variant = getFlag("simple_hero_variant");
  const walk = walkingMinutes(restroom.distance);

  // Trust signals previewed BEFORE the user commits to launching directions.
  // Even in Simple Mode, people want to know "is it open, is it free, can I
  // actually use it" before they walk there. Keep it to the few that matter.
  const { isOpen, knownStatus } = isOpenNow(restroom.opening_hours);
  const signals = [];
  if (knownStatus) {
    signals.push(
      isOpen
        ? { key: "open", cls: "open", label: `🟢 ${t("filter.openNow")}` }
        : { key: "closed", cls: "closed", label: `🔴 ${t("badge.closed")}` }
    );
  }
  if (restroom.fee === false) signals.push({ key: "free", cls: "free", label: t("filter.free") });
  if (restroom.accessible) signals.push({ key: "accessible", cls: "accessible", label: `♿ ${t("filter.accessible")}` });
  if (restroom.unisex) signals.push({ key: "unisex", cls: "unisex", label: `⚧ ${t("filter.unisex")}` });
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
      open_status: knownStatus ? (isOpen ? "open" : "closed") : "unknown",
      free: restroom.fee === false,
      accessible: !!restroom.accessible,
      unisex: !!restroom.unisex,
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
        <span className="simple-walk">{t("simple.minWalk", { n: walk })}</span>
        {variant === "directional" && cardinal && (
          <>
            <span className="simple-dot">·</span>
            <span className="simple-direction">{t("simple.goDirection", { dir: cardinal })}</span>
          </>
        )}
      </div>

      {signals.length > 0 && (
        <div className="simple-signals">
          {signals.map((s) => (
            <span key={s.key} className={`simple-badge simple-badge-${s.cls}`}>
              {s.label}
            </span>
          ))}
        </div>
      )}

      <a
        className="simple-go"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get walking directions to ${restroom?.name || "the closest restroom"}`}
        onClick={handleGo}
      >
        GO
      </a>

      {variant === "dual-line" && onNext && (
        <button className="simple-next-link" onClick={onNext}>
          {t("simple.next")}
        </button>
      )}

      {onShowMore && (
        <button className="simple-more-link" onClick={onShowMore}>
          {t("simple.more")}
        </button>
      )}
    </div>
  );
}

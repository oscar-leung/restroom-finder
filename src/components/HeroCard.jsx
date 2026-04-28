import { useEffect } from "react";
import { formatDistance } from "../utils/distance";
import { trackEvent } from "../utils/analytics";
import { getFlag } from "../utils/featureFlags";
import { getStats } from "../services/reviews";
import { isOpenNow } from "../utils/hours";
import useSwipe from "../hooks/useSwipe";

/**
 * HeroCard — the big "here's the closest restroom" card shown front-and-center.
 *
 * Design intent: when someone opens this app, they NEED a restroom. They should
 * see the nearest one and a huge "GO" button without any hunting.
 *
 * Swipe:
 *   - Swipe LEFT  → next closest restroom
 *   - Swipe RIGHT → previous
 *   - Keyboard: ← / → arrows (desktop parity)
 *
 * Props:
 *   restroom        – restroom at the current position (already has .distance)
 *   index           – 0-based position (0 = closest)
 *   total           – number of restrooms cycleable (for the dot indicator)
 *   onGo            – fired when user taps the GO button
 *   onDetails       – open full details modal
 *   onNext, onPrev  – step through the list
 */
export default function HeroCard({
  restroom,
  index = 0,
  total = 1,
  visitCount = 0,
  onGo,
  onDetails,
  onNext,
  onPrev,
}) {
  // Swipe hook — bind attaches pointer handlers + a live transform
  const { bind, offsetX, isDragging } = useSwipe({
    onSwipeLeft: () => {
      if (onNext) {
        trackEvent("hero_swiped", { direction: "next", to_index: index + 1 });
        onNext();
      }
    },
    onSwipeRight: () => {
      if (onPrev) {
        trackEvent("hero_swiped", { direction: "prev", to_index: index - 1 });
        onPrev();
      }
    },
  });

  // Keyboard arrow support (desktop)
  useEffect(() => {
    const handler = (e) => {
      // Don't hijack arrows while typing in inputs/textareas
      if (e.target.matches("input, textarea, select")) return;
      if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  if (!restroom) return null;

  const walkMins = Math.max(1, Math.round(restroom.distance / 80));
  const address = [restroom.street, restroom.city].filter(Boolean).join(", ");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}&travelmode=walking`;

  // Label changes when you've swiped off the closest:
  //   "CLOSEST RESTROOM" (at index 0)
  //   "#2 NEAREST" etc.
  const label = index === 0 ? "CLOSEST RESTROOM" : `#${index + 1} NEAREST`;

  // Dot indicator: show up to 6 dots (enough for the next-5 range)
  const dotCount = Math.min(total, 6);

  // Fade the card slightly while swiping so it feels like it's "giving way"
  const heroStyle = {
    ...bind.style,
    opacity: isDragging ? Math.max(0.6, 1 - Math.abs(offsetX) / 400) : 1,
  };

  return (
    <div className="hero" {...bind} style={heroStyle}>
      <div className="hero-label">
        <span className="hero-pulse" />
        {label}
      </div>

      <h2 className="hero-name">{restroom.name || "Unnamed Restroom"}</h2>

      {address && <p className="hero-address">{address}</p>}

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-num">{formatDistance(restroom.distance)}</div>
          <div className="hero-stat-label">away</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-num">{walkMins}</div>
          <div className="hero-stat-label">min walk</div>
        </div>
      </div>

      <div className="hero-badges">
        {restroom.accessible && (
          <span className="badge badge-accessible">♿ Accessible</span>
        )}
        {restroom.unisex && (
          <span className="badge badge-unisex">⚧ Gender Neutral</span>
        )}
        {restroom.fee === false && (
          <span className="badge badge-free">Free</span>
        )}
        {restroom.single_occupant === true && (
          <span className="badge badge-private" title="Single-occupant locked room">
            🔒 Private
          </span>
        )}
        {restroom.family === true && (
          <span className="badge badge-family" title="Family-friendly">
            👨‍👩‍👧 Family
          </span>
        )}
        {(() => {
          const { isOpen, knownStatus } = isOpenNow(restroom.opening_hours);
          if (!knownStatus) return null;
          return isOpen
            ? <span className="badge badge-open">🟢 Open now</span>
            : <span className="badge badge-closed">🔴 Closed</span>;
        })()}
        {(() => {
          const s = getStats(restroom.id);
          if (!s.count) return null;
          return (
            <span className="badge badge-rating" title={`${s.count} review${s.count === 1 ? "" : "s"}`}>
              ⭐ {s.avgRating} ({s.count})
            </span>
          );
        })()}
        {visitCount > 0 && (
          <span className="badge badge-visited" title="You've been here before">
            👟 visited {visitCount}×
          </span>
        )}
      </div>

      <a
        className="hero-go"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          trackEvent("go_clicked", {
            distance_m: Math.round(restroom.distance),
            accessible: !!restroom.accessible,
            unisex: !!restroom.unisex,
            variant: getFlag("go_button_label"),
          });
          onGo && onGo();
        }}
      >
        <span className="hero-go-arrow">→</span>
        {getFlag("go_button_label") === "go-now" ? "GO NOW" : "GO"}
      </a>

      <button
        className="hero-details"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDetails}
      >
        More details
      </button>

      {/* Position dots + swipe hint */}
      {total > 1 && (
        <div className="hero-dots" aria-label={`Showing restroom ${index + 1} of ${total}`}>
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`hero-dot ${i === Math.min(index, dotCount - 1) ? "hero-dot-active" : ""}`}
            />
          ))}
          {index === 0 && total > 1 && (
            <span className="hero-swipe-hint">swipe →</span>
          )}
        </div>
      )}
    </div>
  );
}

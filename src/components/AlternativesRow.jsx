import { formatDistance } from "../utils/distance";
import { getStats } from "../services/reviews";
import { isOpenNow } from "../utils/hours";

/**
 * AlternativesRow — horizontal scroll of other nearby restrooms.
 *
 * Tapping a card makes that restroom the new "closest" (promotes it to HeroCard).
 *
 * Props:
 *   restrooms    – full sorted array (first is already the hero; we skip it)
 *   onPromote    – callback when user taps a card → make this one primary
 */
export default function AlternativesRow({ restrooms, onPromote }) {
  const alternatives = restrooms.slice(1, 7);
  if (alternatives.length === 0) return null;

  return (
    <section className="alts">
      <h3 className="alts-title">Or pick another nearby</h3>
      <div className="alts-scroll">
        {alternatives.map((r) => {
          const stats = getStats(r.id);
          const { isOpen, knownStatus } = isOpenNow(r.opening_hours);
          return (
            <button
              key={r.id}
              className="alt-card"
              onClick={() => onPromote(r)}
              title="Make this the selected restroom"
            >
              <div className="alt-distance">{formatDistance(r.distance)}</div>
              <div className="alt-name">{r.name || "Unnamed"}</div>
              <div className="alt-street">{r.street || ""}</div>
              <div className="alt-icons">
                {r.accessible && <span title="Accessible">♿</span>}
                {r.unisex && <span title="Gender neutral">⚧</span>}
                {r.fee === false && <span title="Free">💰</span>}
                {knownStatus && (
                  <span title={isOpen ? "Open now" : "Closed now"}>
                    {isOpen ? "🟢" : "🔴"}
                  </span>
                )}
                {stats.count > 0 && (
                  <span className="alt-rating" title={`${stats.count} review${stats.count === 1 ? "" : "s"}`}>
                    ⭐ {stats.avgRating}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

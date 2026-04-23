import { formatDistance } from "../utils/distance";

/**
 * AlternativesRow — horizontal scroll of other nearby restrooms.
 *
 * Tapping a card makes that restroom the new "closest" (promotes it to HeroCard).
 * This covers the "I found a better one, pick it" case the user asked for.
 *
 * Props:
 *   restrooms    – full sorted array (first is already the hero; we skip it)
 *   onPromote    – callback when user taps a card → make this one primary
 */
export default function AlternativesRow({ restrooms, onPromote }) {
  // Skip the first (it's the hero) and show up to 6 alternatives
  const alternatives = restrooms.slice(1, 7);

  if (alternatives.length === 0) return null;

  return (
    <section className="alts">
      <h3 className="alts-title">Or pick another nearby</h3>
      <div className="alts-scroll">
        {alternatives.map((r) => (
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
              {r.accessible && <span>♿</span>}
              {r.unisex && <span>⚧</span>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

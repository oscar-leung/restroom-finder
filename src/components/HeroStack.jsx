import HeroCard from "./HeroCard";

/**
 * HeroStack — wraps the HeroCard with two "peek" cards behind it,
 * so users can SEE that there are more options to swipe to.
 *
 * The peek cards are non-interactive — purely a visual cue. They show
 * the next 1–2 bathrooms, slightly smaller, slightly translated down,
 * with reduced opacity. As the user swipes, the front card is the only
 * one that moves; the peek cards stay put. When the swipe commits, the
 * whole stack re-renders with the new top card and new peeks.
 *
 * Props:
 *   sorted          – the full sorted list (already includes hero)
 *   heroIndex       – position of the current hero in sorted
 *   ...heroProps    – passed through to the front HeroCard
 */
export default function HeroStack({ sorted, heroIndex, ...heroProps }) {
  if (!sorted?.length) return null;

  const peek1 = sorted[heroIndex + 1];
  const peek2 = sorted[heroIndex + 2];

  return (
    <div className="hero-stack">
      {peek2 && (
        <div className="hero-peek hero-peek-2" aria-hidden="true">
          <div className="hero-peek-name">{peek2.name || "Up next"}</div>
        </div>
      )}
      {peek1 && (
        <div className="hero-peek hero-peek-1" aria-hidden="true">
          <div className="hero-peek-name">{peek1.name || "Up next"}</div>
        </div>
      )}
      <HeroCard {...heroProps} />
    </div>
  );
}

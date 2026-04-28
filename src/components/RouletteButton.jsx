import { useState } from "react";
import { trackEvent } from "../utils/analytics";

/**
 * Toilet Roulette — a deliberately silly button.
 *
 * Tap it and it picks a RANDOM bathroom from the nearby list (not the
 * closest, not the highest-rated — random). Plays a quick spin
 * animation + brief vibration so it feels like rolling dice.
 *
 * Why this exists: most "find X near me" apps optimize for "best
 * answer". We have that with the GO button. This is for when you're
 * up for a small adventure — go check out a bathroom you wouldn't
 * have picked yourself. It's also our "fun, unique, no-one-else-has-it"
 * differentiator.
 */
export default function RouletteButton({ candidates, onPick }) {
  const [spinning, setSpinning] = useState(false);

  const roll = async () => {
    if (spinning || !candidates || candidates.length < 2) return;
    setSpinning(true);

    // Haptic shimmy on devices that support it
    if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 40]);

    trackEvent("roulette_rolled", { candidate_count: candidates.length });

    // Tease — show 4 different candidates flipping by, then settle
    const teaseDuration = 600;
    const tickMs = 80;
    const ticks = Math.floor(teaseDuration / tickMs);
    for (let i = 0; i < ticks; i++) {
      const teaser = candidates[Math.floor(Math.random() * candidates.length)];
      // We could update an internal "currently displaying" state here for a
      // visual reel; for v1 we just spin the icon and reveal at the end.
      await new Promise((r) => setTimeout(r, tickMs));
    }

    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    setSpinning(false);
    if (navigator.vibrate) navigator.vibrate(80);
    onPick(winner);
  };

  return (
    <button
      className={`roulette-btn ${spinning ? "roulette-spinning" : ""}`}
      onClick={roll}
      disabled={spinning || !candidates?.length}
      title="Pick a random nearby bathroom"
    >
      <span className="roulette-die" aria-hidden="true">🎲</span>
      <span className="roulette-label">
        {spinning ? "Picking…" : "Try somewhere new"}
      </span>
    </button>
  );
}

import { useEffect, useState } from "react";

/**
 * CelebrationOverlay — quick confetti-style hit after a GO tap.
 *
 * Strava's post-activity celebration is the gold standard: a moment
 * of dopamine before you leave the app. We don't need full confetti
 * — a single fast popup with the score / streak update + a couple
 * of paper-burst SVGs feels great and ships in 50 lines.
 *
 * Auto-dismisses after 2 seconds. Tappable to dismiss earlier.
 *
 * Props:
 *   isOpen      – render trigger
 *   pointsEarned  – number to celebrate
 *   streakCount   – current streak (after this GO)
 *   bathroomName  – the place they're heading to
 *   onDone        – fired when overlay finishes
 */
export default function CelebrationOverlay({
  isOpen,
  pointsEarned = 0,
  streakCount = 0,
  bathroomName,
  onDone,
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setExiting(false);
    const t1 = setTimeout(() => setExiting(true), 1700);
    const t2 = setTimeout(() => onDone?.(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen, onDone]);

  if (!isOpen) return null;

  return (
    <div
      className={`celebration ${exiting ? "celebration-exit" : ""}`}
      onClick={() => onDone?.()}
      role="status"
      aria-live="polite"
    >
      {/* Burst SVG behind the card */}
      <svg
        className="celebration-burst"
        viewBox="0 0 400 400"
        aria-hidden="true"
      >
        {/* 12 paper streaks radiating from center */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const colors = ["#fbbf24", "#ec4899", "#8b5cf6", "#10b981", "#06b6d4", "#f97316"];
          return (
            <line
              key={i}
              x1="200" y1="200"
              x2="200" y2="80"
              stroke={colors[i % colors.length]}
              strokeWidth="6"
              strokeLinecap="round"
              transform={`rotate(${angle} 200 200)`}
              className="celebration-streak"
              style={{ animationDelay: `${i * 0.02}s` }}
            />
          );
        })}
      </svg>

      <div className="celebration-card">
        <div className="celebration-emoji">🎉</div>
        <div className="celebration-headline">You're heading there</div>
        {bathroomName && (
          <div className="celebration-place">{bathroomName}</div>
        )}
        <div className="celebration-stats">
          {pointsEarned > 0 && (
            <div className="celebration-stat">
              <div className="celebration-stat-num">+{pointsEarned}</div>
              <div className="celebration-stat-label">points</div>
            </div>
          )}
          {streakCount > 0 && (
            <div className="celebration-stat">
              <div className="celebration-stat-num">🔥 {streakCount}</div>
              <div className="celebration-stat-label">day streak</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

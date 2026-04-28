import { useEffect } from "react";

/**
 * AchievementToast — slides up from the bottom when an achievement
 * unlocks. Auto-dismisses after 3.5s. Tappable to dismiss earlier.
 */
export default function AchievementToast({ achievement, onDismiss }) {
  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="achievement-toast" role="status" onClick={onDismiss}>
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-text">
        <div className="achievement-title">
          Unlocked: {achievement.title}
        </div>
        <div className="achievement-desc">{achievement.desc}</div>
      </div>
    </div>
  );
}

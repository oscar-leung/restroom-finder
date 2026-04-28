import { useEffect, useState } from "react";

/**
 * IntroScreen — a 1.8s loading animation in soft Japanese-cartoon
 * style. A scared toilet (with eyes, sweat, little legs) sprints
 * across the screen, chased by a stick-figure person. After they
 * exit, the brand reveals.
 *
 * Pure SVG + CSS animations. No image fetches. Honors
 * prefers-reduced-motion (those users see a static brand frame).
 *
 * Tap anywhere to skip.
 *
 * Shows on every cold load. People who reload often (active users)
 * will see it occasionally; we keep it short on purpose.
 */
export default function IntroScreen({ onDone }) {
  const [skipped, setSkipped] = useState(false);

  // Auto-dismiss after 1.8s. If reduced-motion, dismiss after 0.6s.
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 600 : 1800;
    const t = setTimeout(() => onDone?.(), ms);
    return () => clearTimeout(t);
  }, [onDone]);

  const skip = () => {
    if (skipped) return;
    setSkipped(true);
    onDone?.();
  };

  return (
    <div className="intro-screen" onClick={skip} role="presentation">
      <svg
        viewBox="0 0 400 320"
        className="intro-svg"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="A cute toilet running away from a person who really needs to go"
      >
        <defs>
          {/* Pastel sky-pink gradient backdrop */}
          <linearGradient id="introBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3f2" />
            <stop offset="60%" stopColor="#ffedf2" />
            <stop offset="100%" stopColor="#fce7f3" />
          </linearGradient>
          <radialGradient id="sun" cx="0.85" cy="0.15" r="0.5">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Backdrop */}
        <rect width="400" height="320" fill="url(#introBg)" />
        <rect width="400" height="320" fill="url(#sun)" />

        {/* Ground line */}
        <line x1="0" y1="245" x2="400" y2="245" stroke="#fbcfe8" strokeWidth="2" />

        {/* Speed-line streaks (anime style) */}
        <g className="intro-streaks" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" opacity="0.6">
          <line x1="0" y1="180" x2="40" y2="180" />
          <line x1="0" y1="200" x2="60" y2="200" />
          <line x1="0" y1="220" x2="30" y2="220" />
        </g>

        {/* Person chasing — kawaii stick figure */}
        <g className="intro-person">
          {/* Head */}
          <circle cx="50" cy="150" r="22" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
          {/* Eyes (squinting / urgent) */}
          <path d="M 42 148 Q 46 145 50 148" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 148 Q 56 145 60 148" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Mouth — open in panic */}
          <ellipse cx="51" cy="160" rx="3" ry="4" fill="#0f172a" />
          {/* Body (purple shirt) */}
          <rect x="38" y="172" width="24" height="42" rx="6" fill="#a78bfa" stroke="#0f172a" strokeWidth="3" />
          {/* Outstretched arms reaching — front arm, back arm */}
          <path d="M 62 184 Q 90 180 105 188" stroke="#a78bfa" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 62 184 Q 90 180 105 188" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 38 184 Q 25 195 22 215" stroke="#a78bfa" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 38 184 Q 25 195 22 215" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Running legs */}
          <path d="M 44 214 Q 38 230 30 245" stroke="#0f172a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 56 214 Q 60 230 70 240" stroke="#0f172a" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Sweat drop on forehead */}
          <ellipse cx="38" cy="138" rx="2.5" ry="4" fill="#60a5fa" stroke="#0f172a" strokeWidth="1" />
        </g>

        {/* Toilet running away — kawaii */}
        <g className="intro-toilet">
          {/* Speed lines just behind it */}
          <g stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.85">
            <line x1="180" y1="195" x2="155" y2="195" />
            <line x1="175" y1="210" x2="145" y2="210" />
            <line x1="180" y1="225" x2="160" y2="225" />
          </g>
          {/* Tank (back) */}
          <rect x="240" y="155" width="32" height="48" rx="5" fill="white" stroke="#0f172a" strokeWidth="3.5" />
          {/* Bowl (front) */}
          <ellipse cx="220" cy="215" rx="42" ry="22" fill="white" stroke="#0f172a" strokeWidth="3.5" />
          {/* Water inside bowl */}
          <ellipse cx="220" cy="208" rx="34" ry="13" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Eyes — kawaii style with sparkles */}
          <circle cx="206" cy="200" r="6" fill="white" stroke="#0f172a" strokeWidth="2" />
          <circle cx="232" cy="200" r="6" fill="white" stroke="#0f172a" strokeWidth="2" />
          <circle cx="206" cy="201" r="3" fill="#0f172a" />
          <circle cx="232" cy="201" r="3" fill="#0f172a" />
          {/* Eye highlights */}
          <circle cx="207.5" cy="199.5" r="0.8" fill="white" />
          <circle cx="233.5" cy="199.5" r="0.8" fill="white" />
          {/* Mouth — alarmed open "o" */}
          <ellipse cx="219" cy="218" rx="3" ry="4" fill="#7c2d12" />
          {/* Sweat drops flying off */}
          <ellipse cx="195" cy="178" rx="3" ry="5" fill="#60a5fa" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="248" cy="138" rx="2.5" ry="4" fill="#60a5fa" stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="270" cy="172" rx="2" ry="3.5" fill="#60a5fa" stroke="#0f172a" strokeWidth="1" />
          {/* Tiny legs sprinting */}
          <ellipse className="intro-leg-1" cx="200" cy="240" rx="6" ry="9" fill="white" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse className="intro-leg-2" cx="240" cy="240" rx="6" ry="9" fill="white" stroke="#0f172a" strokeWidth="2.5" />
          {/* "wait" speech bubble from person, pointed toward toilet */}
        </g>

        {/* Brand reveal */}
        <g className="intro-brand">
          <text
            x="200" y="290"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
            fontSize="34"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#7c3aed"
          >
            GOTTA GO
          </text>
          <text
            x="200" y="308"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="11"
            fontWeight="500"
            letterSpacing="2"
            fill="#a78bfa"
          >
            CLOSEST BATHROOM, INSTANTLY
          </text>
        </g>
      </svg>

      <button className="intro-skip" onClick={skip} aria-label="Skip intro">
        skip
      </button>
    </div>
  );
}

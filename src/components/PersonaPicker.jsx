import { trackEvent } from "../utils/analytics";

/**
 * PersonaPicker — single-question first-visit modal that personalizes
 * the app for college students, seniors, or "just give me the app".
 *
 * Skippable (defaults to "default"). User can change later in settings.
 *
 * Why this exists: the same product serves wildly different needs. A
 * 19-year-old between classes wants the free filter on and a "send to
 * friend" button; a 72-year-old in a new neighborhood wants larger
 * text, accessible-only by default, and no gamified flames in their
 * face. Asking once gets us 80% of personalization at 0% of the
 * configuration cost.
 */
export default function PersonaPicker({ onPick }) {
  const choose = (persona) => {
    trackEvent("persona_picked", { persona });
    onPick(persona);
  };

  return (
    <div className="persona-backdrop" role="dialog" aria-modal="true" aria-labelledby="persona-title">
      <div className="persona-modal">
        <h2 id="persona-title" className="persona-title">
          Welcome to <span className="persona-brand">Gotta Go</span>
        </h2>
        <p className="persona-sub">Help us tailor it. Pick one — you can change later.</p>

        <div className="persona-options">
          <button
            className="persona-option"
            onClick={() => choose("student")}
          >
            <span className="persona-icon" aria-hidden="true">🎓</span>
            <span className="persona-name">I'm a student</span>
            <span className="persona-desc">
              Show free options first. Quick share with friends. No purchase
              required filter on by default.
            </span>
          </button>

          <button
            className="persona-option"
            onClick={() => choose("senior")}
          >
            <span className="persona-icon" aria-hidden="true">🪻</span>
            <span className="persona-name">Larger text + accessibility</span>
            <span className="persona-desc">
              Bigger buttons, calmer screen, accessibility filter on, walking
              time at a relaxed pace. Less visual noise.
            </span>
          </button>

          <button
            className="persona-option persona-option-default"
            onClick={() => choose("default")}
          >
            <span className="persona-icon" aria-hidden="true">🚀</span>
            <span className="persona-name">Just give me the app</span>
            <span className="persona-desc">
              Default experience. All features on.
            </span>
          </button>
        </div>

        <button className="persona-skip" onClick={() => choose("default")}>
          skip
        </button>
      </div>
    </div>
  );
}

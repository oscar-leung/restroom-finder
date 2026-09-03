import { trackEvent } from "../utils/analytics";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  const choose = (persona) => {
    trackEvent("persona_picked", { persona });
    onPick(persona);
  };

  return (
    <div className="persona-backdrop" role="dialog" aria-modal="true" aria-labelledby="persona-title">
      <div className="persona-modal">
        <h2 id="persona-title" className="persona-title">
          {t("persona.welcome", { brand: "Gotta Go" })}
        </h2>
        <p className="persona-sub">{t("persona.sub")}</p>

        <div className="persona-options">
          <button
            className="persona-option"
            onClick={() => choose("student")}
          >
            <span className="persona-icon" aria-hidden="true">🎓</span>
            <span className="persona-name">{t("persona.student.name")}</span>
            <span className="persona-desc">{t("persona.student.desc")}</span>
          </button>

          <button
            className="persona-option"
            onClick={() => choose("senior")}
          >
            <span className="persona-icon" aria-hidden="true">🪻</span>
            <span className="persona-name">{t("persona.senior.name")}</span>
            <span className="persona-desc">{t("persona.senior.desc")}</span>
          </button>

          <button
            className="persona-option persona-option-default"
            onClick={() => choose("default")}
          >
            <span className="persona-icon" aria-hidden="true">🚀</span>
            <span className="persona-name">{t("persona.default.name")}</span>
            <span className="persona-desc">{t("persona.default.desc")}</span>
          </button>
        </div>

        <button className="persona-skip" onClick={() => choose("default")}>
          {t("persona.skip")}
        </button>
      </div>
    </div>
  );
}

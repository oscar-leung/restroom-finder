import { useI18n } from "../i18n";

/**
 * InstallPrompt — bottom-sheet nudge to add Gotta Go to the home screen.
 *
 * Shown from the 2nd distinct-day visit (see useInstallPrompt). Two
 * renders: a one-tap Install button when the browser gives us the real
 * prompt, or step-by-step Share-sheet instructions on iOS Safari.
 * Dismissing it once silences it permanently on this device.
 */
export default function InstallPrompt({ mode, onInstall, onDismiss }) {
  const { t } = useI18n();
  return (
    <div className="install-prompt" role="dialog" aria-label="Install Gotta Go">
      <button
        className="install-prompt-close"
        onClick={onDismiss}
        aria-label="Dismiss install suggestion"
      >
        ×
      </button>

      <div className="install-prompt-body">
        <span className="install-prompt-icon" aria-hidden="true">📲</span>
        <div className="install-prompt-text">
          <strong>{t("install.title")}</strong>
          {mode === "ios" ? (
            <p>
              {t("install.iosTap")}{" "}
              <span className="install-share-glyph" aria-label="the Share button">⎋</span>{" "}
              {t("install.iosThen")} <strong>{t("install.iosAction")}</strong>{" "}
              {t("install.iosSuffix")}
            </p>
          ) : (
            <p>{t("install.body")}</p>
          )}
        </div>
      </div>

      {mode === "native" && (
        <button className="install-prompt-cta" onClick={onInstall}>
          {t("install.cta")}
        </button>
      )}
    </div>
  );
}

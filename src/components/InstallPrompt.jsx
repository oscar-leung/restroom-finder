/**
 * InstallPrompt — bottom-sheet nudge to add Gotta Go to the home screen.
 *
 * Shown from the 2nd distinct-day visit (see useInstallPrompt). Two
 * renders: a one-tap Install button when the browser gives us the real
 * prompt, or step-by-step Share-sheet instructions on iOS Safari.
 * Dismissing it once silences it permanently on this device.
 */
export default function InstallPrompt({ mode, onInstall, onDismiss }) {
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
          <strong>Faster next time you gotta go</strong>
          {mode === "ios" ? (
            <p>
              Tap <span className="install-share-glyph" aria-label="the Share button">⎋</span>{" "}
              then <strong>Add to Home Screen</strong> — opens instantly,
              works offline.
            </p>
          ) : (
            <p>Install the app — opens instantly, works offline, no store needed.</p>
          )}
        </div>
      </div>

      {mode === "native" && (
        <button className="install-prompt-cta" onClick={onInstall}>
          Install
        </button>
      )}
    </div>
  );
}

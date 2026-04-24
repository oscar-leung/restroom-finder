import { useState } from "react";
import { addUserBathroom, refugeSubmitUrl } from "../services/userBathrooms";
import { trackEvent } from "../utils/analytics";

/**
 * AddBathroomModal — "I'm at a bathroom right now, add it to the map".
 *
 * Design intent: most submissions happen on-site. The user's phone already
 * knows where they are — we just need a name and a few flags. No address
 * typing.
 *
 * Props:
 *   position  – { latitude, longitude } from the geolocation hook
 *   onClose   – close callback
 *   onAdded   – called with the newly-created entry so App can update its list
 */
export default function AddBathroomModal({ position, onClose, onAdded }) {
  const [name, setName] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [unisex, setUnisex] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!position) return;
    const entry = addUserBathroom({
      latitude: position.latitude,
      longitude: position.longitude,
      name,
      accessible,
      unisex,
      comment,
    });
    trackEvent("bathroom_added", { accessible, unisex });
    setSubmitted(entry);
    onAdded?.(entry);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-grip" />

        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {!submitted ? (
          <>
            <h2 className="modal-title">Add a bathroom here</h2>
            <p className="modal-address">
              📍 Using your current location ({position?.latitude.toFixed(5)},{" "}
              {position?.longitude.toFixed(5)})
            </p>

            <form className="add-form" onSubmit={submit}>
              <div className="add-form-field">
                <label htmlFor="add-name">What's it called?</label>
                <input
                  id="add-name"
                  type="text"
                  placeholder="e.g. Starbucks on 5th, library 2nd floor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  maxLength={120}
                />
              </div>

              <div className="add-form-field">
                <label>Tags</label>
                <div className="add-form-checks">
                  <label className="add-form-check">
                    <input
                      type="checkbox"
                      checked={accessible}
                      onChange={(e) => setAccessible(e.target.checked)}
                    />
                    ♿ Accessible
                  </label>
                  <label className="add-form-check">
                    <input
                      type="checkbox"
                      checked={unisex}
                      onChange={(e) => setUnisex(e.target.checked)}
                    />
                    ⚧ Gender Neutral
                  </label>
                </div>
              </div>

              <div className="add-form-field">
                <label htmlFor="add-comment">Notes (optional)</label>
                <textarea
                  id="add-comment"
                  placeholder="Code on the door? Always clean? Anything useful for the next person."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
              </div>

              <div className="add-form-actions">
                <button type="submit" className="add-form-submit">
                  Save to my map
                </button>
              </div>

              <p className="add-form-share">
                Saved on your device only. Want to share with everyone?
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="modal-title">✓ Saved</h2>
            <p className="modal-address">
              "{submitted.name}" is now in your list. It'll show up sorted by distance.
            </p>

            <div className="modal-section">
              <h3>Want to share it with the world?</h3>
              <p>
                Submit it to <strong>Refuge Restrooms</strong> — their volunteers
                review it and add it to the global database so anyone using
                this app (or others) sees it too.
              </p>
            </div>

            <a
              className="cta-button"
              href={refugeSubmitUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("refuge_submit_clicked")}
            >
              Share with everyone →
            </a>

            <button
              className="hero-details"
              style={{ color: "var(--text-muted)", marginTop: 12 }}
              onClick={onClose}
            >
              Done
            </button>
          </>
        )}
      </div>
    </>
  );
}

import { useState } from "react";
import { addUserBathroom, refugeSubmitUrl } from "../services/userBathrooms";
import { contributeToRefuge } from "../services/refugeContribute";
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
  const [shareUpstream, setShareUpstream] = useState(true); // default ON — community good
  const [submitted, setSubmitted] = useState(null);
  const [upstreamStatus, setUpstreamStatus] = useState(null); // "pending" | "ok" | "error"

  const submit = async (e) => {
    e.preventDefault();
    if (!position) return;

    // 1. Save locally — instant feedback for the user
    const entry = addUserBathroom({
      latitude: position.latitude,
      longitude: position.longitude,
      name,
      accessible,
      unisex,
      comment,
    });
    trackEvent("bathroom_added", { accessible, unisex, shareUpstream });
    setSubmitted(entry);
    onAdded?.(entry);

    // 2. Optionally POST to Refuge in the background — fire-and-forget
    //    The user already has their local copy; upstream is the bonus.
    if (shareUpstream) {
      setUpstreamStatus("pending");
      const result = await contributeToRefuge({
        name,
        latitude: position.latitude,
        longitude: position.longitude,
        accessible,
        unisex,
        comment,
        directions: comment, // Refuge calls our notes "directions"
      });
      if (result.ok) {
        setUpstreamStatus("ok");
        trackEvent("refuge_post_succeeded");
      } else {
        setUpstreamStatus("error");
        trackEvent("refuge_post_failed", { error: result.error?.slice(0, 80) || "" });
      }
    }
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

              <label className="add-form-share-toggle">
                <input
                  type="checkbox"
                  checked={shareUpstream}
                  onChange={(e) => setShareUpstream(e.target.checked)}
                />
                <span>
                  <strong>Share with everyone</strong> — also send this to
                  Refuge Restrooms so the world's open data improves.
                  Their moderators review before publishing.
                </span>
              </label>

              <div className="add-form-actions">
                <button type="submit" className="add-form-submit">
                  Save{shareUpstream ? " + share" : " to my map"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="modal-title">✓ Saved</h2>
            <p className="modal-address">
              "{submitted.name}" is now in your list, sorted by distance.
            </p>

            {/* Upstream contribution status */}
            {upstreamStatus === "pending" && (
              <div className="upstream-banner upstream-pending">
                <div className="spinner spinner-sm" />
                Sharing with Refuge Restrooms…
              </div>
            )}
            {upstreamStatus === "ok" && (
              <div className="upstream-banner upstream-ok">
                ✓ Shared with Refuge Restrooms — pending their review.
                The world thanks you.
              </div>
            )}
            {upstreamStatus === "error" && (
              <div className="upstream-banner upstream-error">
                Couldn't share upstream right now. Your local copy is
                fine. <a href={refugeSubmitUrl()} target="_blank" rel="noopener noreferrer">
                Submit it manually here.</a>
              </div>
            )}
            {upstreamStatus === null && !shareUpstream && (
              <div className="upstream-banner upstream-info">
                Saved on your device only. Want strangers to find it too?{" "}
                <a href={refugeSubmitUrl()} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackEvent("refuge_submit_clicked")}>
                  Share with Refuge Restrooms →
                </a>
              </div>
            )}

            <button
              className="cta-button"
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

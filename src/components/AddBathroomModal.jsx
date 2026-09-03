import { useState, useEffect } from "react";
import { addUserBathroom, refugeSubmitUrl } from "../services/userBathrooms";
import { contributeToRefuge } from "../services/refugeContribute";
import { reverseGeocode } from "../services/geocoder";
import { trackEvent } from "../utils/analytics";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [accessible, setAccessible] = useState(false);
  const [unisex, setUnisex] = useState(false);
  const [comment, setComment] = useState("");
  const [shareUpstream, setShareUpstream] = useState(true); // default ON — community good
  const [submitted, setSubmitted] = useState(null);
  const [upstreamStatus, setUpstreamStatus] = useState(null); // "pending" | "ok" | "error"

  // "Snap to nearest place" — direct response to user feedback that
  // most contributors don't know exact addresses. We reverse-geocode
  // their GPS via Nominatim and offer the result as a one-tap fill.
  const [nearby, setNearby] = useState(null); // { displayName, city, neighborhood }
  const posLat = position?.latitude;
  const posLng = position?.longitude;
  useEffect(() => {
    if (posLat == null || posLng == null) return;
    let cancelled = false;
    reverseGeocode(posLat, posLng).then((res) => {
      if (!cancelled) setNearby(res);
    });
    return () => { cancelled = true; };
  }, [posLat, posLng]);

  const useNearbyName = () => {
    if (!nearby?.displayName) return;
    // Use just the first 2 segments — "Starbucks, 123 Main St" not the whole "city, state, country"
    const short = nearby.displayName.split(",").slice(0, 2).join(",").trim();
    setName(short);
    trackEvent("snap_to_nearby_used");
  };

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
            <h2 className="modal-title">{t("add.button")}</h2>
            <p className="modal-address">
              📍 {t("add.usingLocation")} ({position?.latitude.toFixed(5)},{" "}
              {position?.longitude.toFixed(5)})
            </p>

            {nearby?.displayName && (
              <button
                type="button"
                className="snap-suggestion"
                onClick={useNearbyName}
                title="Use the nearest place's name"
              >
                <span className="snap-icon" aria-hidden="true">📌</span>
                <span className="snap-text">
                  <span className="snap-label">{t("add.nearestPlace")}</span>{" "}
                  <strong>{nearby.displayName.split(",").slice(0, 2).join(",")}</strong>
                </span>
                <span className="snap-cta">{t("add.use")}</span>
              </button>
            )}

            <form className="add-form" onSubmit={submit}>
              <div className="add-form-field">
                <label htmlFor="add-name">{t("add.nameLabel")}</label>
                <input
                  id="add-name"
                  type="text"
                  placeholder={t("add.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  maxLength={120}
                />
              </div>

              <div className="add-form-field">
                <label>{t("add.tags")}</label>
                <div className="add-form-checks">
                  <label className="add-form-check">
                    <input
                      type="checkbox"
                      checked={accessible}
                      onChange={(e) => setAccessible(e.target.checked)}
                    />
                    ♿ {t("filter.accessible")}
                  </label>
                  <label className="add-form-check">
                    <input
                      type="checkbox"
                      checked={unisex}
                      onChange={(e) => setUnisex(e.target.checked)}
                    />
                    ⚧ {t("filter.unisex")}
                  </label>
                </div>
              </div>

              <div className="add-form-field">
                <label htmlFor="add-comment">{t("add.notesLabel")}</label>
                <textarea
                  id="add-comment"
                  placeholder={t("add.notesPlaceholder")}
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
                  <strong>{t("add.shareTitle")}</strong> {t("add.shareBody")}
                </span>
              </label>

              <div className="add-form-actions">
                <button type="submit" className="add-form-submit">
                  {shareUpstream ? t("add.saveShare") : t("add.saveLocal")}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="modal-title">{t("add.savedTitle")}</h2>
            <p className="modal-address">
              {t("add.savedBody", { name: submitted.name })}
            </p>

            {/* Upstream contribution status */}
            {upstreamStatus === "pending" && (
              <div className="upstream-banner upstream-pending">
                <div className="spinner spinner-sm" />
                {t("add.upstreamPending")}
              </div>
            )}
            {upstreamStatus === "ok" && (
              <div className="upstream-banner upstream-ok">
                {t("add.upstreamOk")}
              </div>
            )}
            {upstreamStatus === "error" && (
              <div className="upstream-banner upstream-error">
                {t("add.upstreamError")}{" "}
                <a href={refugeSubmitUrl()} target="_blank" rel="noopener noreferrer">
                {t("add.submitManually")}</a>
              </div>
            )}
            {upstreamStatus === null && !shareUpstream && (
              <div className="upstream-banner upstream-info">
                {t("add.localOnly")}{" "}
                <a href={refugeSubmitUrl()} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackEvent("refuge_submit_clicked")}>
                  {t("add.shareLink")}
                </a>
              </div>
            )}

            <button
              className="cta-button"
              onClick={onClose}
            >
              {t("common.done")}
            </button>
          </>
        )}
      </div>
    </>
  );
}

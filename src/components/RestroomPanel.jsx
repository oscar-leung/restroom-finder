import { useState, useEffect, useRef } from "react";
import { formatDistance } from "../utils/distance";
import { formatLastVisit } from "../services/visitTracker";
import { isOpenNow, formatHours } from "../utils/hours";
import { isFavorite, toggleFavorite } from "../services/favorites";
import { tryUnlock } from "../services/achievements";
import { reportClean, getCleaningLog, formatRelative, getBountyStatus } from "../services/cleaningLog";
import { uploadPhoto, getPhotos } from "../services/photos";
import { trackEvent } from "../utils/analytics";
import Reviews from "./Reviews";

/**
 * RestroomPanel — full details modal for a selected restroom.
 * Slides up from the bottom on mobile, centered card on desktop.
 *
 * Props:
 *   restroom  – restroom object (or null)
 *   onClose   – close callback
 */
export default function RestroomPanel({ restroom, visitRecord, onClose, onAchievement }) {
  const [favorited, setFavorited] = useState(() =>
    restroom ? isFavorite(restroom.id) : false
  );
  const [cleaning, setCleaning] = useState(() =>
    restroom ? getCleaningLog(restroom.id) : null
  );
  const [photos, setPhotos] = useState(() =>
    restroom ? getPhotos(restroom.id) : []
  );
  const [uploadError, setUploadError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (restroom) {
      setCleaning(getCleaningLog(restroom.id));
      setPhotos(getPhotos(restroom.id));
      setFavorited(isFavorite(restroom.id));
    }
  }, [restroom]);

  if (!restroom) return null;

  const onClean = () => {
    const updated = reportClean(restroom.id);
    setCleaning(updated);
    trackEvent("clean_reported", { id: String(restroom.id) });
  };

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      await uploadPhoto(restroom.id, file);
      setPhotos(getPhotos(restroom.id));
      trackEvent("photo_uploaded", { id: String(restroom.id) });
    } catch (err) {
      setUploadError(err.message || "Couldn't upload that photo.");
    }
  };

  const bounty = getBountyStatus(restroom.id);

  const onToggleFav = () => {
    const isNow = toggleFavorite(restroom.id);
    setFavorited(isNow);
    trackEvent("favorite_toggled", { id: String(restroom.id), on: isNow });
    if (isNow) {
      const ach = tryUnlock("first_favorite");
      if (ach && onAchievement) onAchievement(ach);
    }
  };

  // Street View deep-link — works without an API key, opens
  // Google Maps' panorama view of the location.
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${restroom.latitude},${restroom.longitude}`;

  const address = [restroom.street, restroom.city, restroom.state]
    .filter(Boolean)
    .join(", ");
  const score = (restroom.upvote || 0) - (restroom.downvote || 0);

  // Universal map link: on iOS opens Apple Maps, on Android opens Google Maps,
  // everywhere else opens maps.google.com. The `geo:` scheme is understood by
  // Android; iOS falls back to Google Maps URL.
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}`;

  return (
    <>
      {/* Dark backdrop — tap to close */}
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal" role="dialog" aria-modal="true">
        {/* Grip handle for drag feel */}
        <div className="modal-grip" />

        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <button
          className={`modal-fav ${favorited ? "modal-fav-on" : ""}`}
          onClick={onToggleFav}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          title={favorited ? "Pinned to your speed dial" : "Pin to your speed dial"}
        >
          {favorited ? "★" : "☆"}
        </button>

        <h2 className="modal-title">{restroom.name || "Unnamed Restroom"}</h2>

        <div className="modal-meta">
          {restroom.distance != null && (
            <span className="meta-item">
              <span aria-hidden="true">📍</span> {formatDistance(restroom.distance)} away
            </span>
          )}
          {score !== 0 && (
            <span className="meta-item">
              {score > 0 ? "👍" : "👎"} {Math.abs(score)}
            </span>
          )}
          {visitRecord && visitRecord.count > 0 && (
            <span className="meta-item meta-visited">
              <span aria-hidden="true">👟</span> {visitRecord.count}× by you
              {visitRecord.lastVisited && ` · last ${formatLastVisit(visitRecord.lastVisited)}`}
            </span>
          )}
        </div>

        {address && <p className="modal-address">{address}</p>}

        <div className="modal-badges">
          {restroom.accessible && (
            <span className="badge badge-accessible">♿ Accessible</span>
          )}
          {restroom.unisex && (
            <span className="badge badge-unisex">⚧ Gender Neutral</span>
          )}
          {restroom.fee === false && (
            <span className="badge badge-free">💰 Free</span>
          )}
          {restroom.fee === true && (
            <span className="badge badge-paid">Paid</span>
          )}
          {(() => {
            const { isOpen, knownStatus } = isOpenNow(restroom.opening_hours);
            if (!knownStatus) return null;
            return isOpen
              ? <span className="badge badge-open">🟢 Open now</span>
              : <span className="badge badge-closed">🔴 Closed now</span>;
          })()}
          {!restroom.accessible && !restroom.unisex && restroom.fee == null && !restroom.opening_hours && (
            <span className="badge badge-none">No info</span>
          )}
        </div>

        {restroom.opening_hours && (
          <section className="modal-section">
            <h3>Hours</h3>
            <p>{formatHours(restroom.opening_hours)}</p>
          </section>
        )}

        {restroom.directions && (
          <section className="modal-section">
            <h3>Directions</h3>
            <p>{restroom.directions}</p>
          </section>
        )}

        {restroom.comment && (
          <section className="modal-section">
            <h3>Notes</h3>
            <p>{restroom.comment}</p>
          </section>
        )}

        {/* Photos section */}
        <section className="modal-section">
          <h3>Photos</h3>
          {photos.length > 0 ? (
            <div className="photo-grid">
              {photos.map((p) => (
                <a
                  key={p.id}
                  href={p.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="photo-thumb"
                >
                  <img src={p.dataUrl} alt="" loading="lazy" />
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">No photos yet — be the first.</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChange}
            hidden
          />
          <button className="btn-secondary" onClick={onPickFile}>
            📷 Upload a photo
          </button>
          {uploadError && <p className="upload-error">{uploadError}</p>}
        </section>

        {/* Cleaning log + bounty */}
        <section className="modal-section">
          <h3>Cleanliness</h3>
          {cleaning ? (
            <p className="muted">
              Last reported clean <strong>{formatRelative(cleaning.lastCleanedAt)}</strong>
              {cleaning.count > 1 && ` · ${cleaning.count} reports total`}
            </p>
          ) : (
            <p className="muted">No cleanliness reports yet.</p>
          )}
          {bounty.eligible && (
            <div className="bounty-banner" title="Future feature — not yet payable">
              💵 <strong>${bounty.value.toFixed(2)}</strong> bounty available · {bounty.reason}
              <span className="bounty-soon">coming soon</span>
            </div>
          )}
          <button className="btn-secondary" onClick={onClean}>
            🧼 Report it's clean now
          </button>
        </section>

        <a
          className="cta-button"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("directions_opened", { id: String(restroom.id) })}
        >
          Get Directions →
        </a>

        <a
          className="secondary-link"
          href={streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("street_view_opened", { id: String(restroom.id) })}
        >
          🛣️ See on Street View
        </a>

        <Reviews restroomId={restroom.id} />
      </div>
    </>
  );
}

import { formatDistance } from "../utils/distance";
import { formatLastVisit } from "../services/visitTracker";
import { isOpenNow, formatHours } from "../utils/hours";
import Reviews from "./Reviews";

/**
 * RestroomPanel — full details modal for a selected restroom.
 * Slides up from the bottom on mobile, centered card on desktop.
 *
 * Props:
 *   restroom  – restroom object (or null)
 *   onClose   – close callback
 */
export default function RestroomPanel({ restroom, visitRecord, onClose }) {
  if (!restroom) return null;

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

        <a
          className="cta-button"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Directions →
        </a>

        <Reviews restroomId={restroom.id} />
      </div>
    </>
  );
}

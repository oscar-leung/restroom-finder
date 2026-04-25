import { formatDistance } from "../utils/distance";

/**
 * RecentlyAdded — surfaces user-contributed bathrooms (newest first).
 *
 * Why: gives contributors a sense of "my submission landed", and gives
 * everyone else a feed of fresh data. Mirrors what Legal Walls does
 * with its "Recent additions" section.
 *
 * Hidden if there are no user-added bathrooms yet.
 */
export default function RecentlyAdded({ userBathrooms, onSelect }) {
  if (!userBathrooms || userBathrooms.length === 0) return null;

  // Newest first, top 5
  const recent = [...userBathrooms]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5);

  return (
    <section className="recent-added">
      <div className="recent-added-head">
        <h3 className="alts-title">Recently added by you</h3>
        <span className="recent-added-count">
          {userBathrooms.length} contributed
        </span>
      </div>
      <div className="recent-added-list">
        {recent.map((r) => (
          <button
            key={r.id}
            className="recent-row"
            onClick={() => onSelect(r)}
          >
            <div className="recent-row-main">
              <div className="recent-row-name">{r.name || "Unnamed"}</div>
              {r.street && <div className="recent-row-addr">{r.street}</div>}
              {r.comment && <div className="recent-row-note">"{r.comment}"</div>}
            </div>
            <div className="recent-row-side">
              {r.distance != null && (
                <span className="recent-row-dist">{formatDistance(r.distance)}</span>
              )}
              <span className="recent-row-badge">added by you</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

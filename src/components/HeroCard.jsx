import { formatDistance } from "../utils/distance";

/**
 * HeroCard — the big "here's the closest restroom" card shown front-and-center.
 *
 * Design intent: when someone opens this app, they NEED a restroom. They should
 * see the nearest one and a huge "GO" button without any hunting.
 *
 * Props:
 *   restroom   – the closest restroom (already has .distance)
 *   onDetails  – callback to open full details modal
 *   walkMins   – rough walking time in minutes
 */
export default function HeroCard({ restroom, onDetails }) {
  if (!restroom) return null;

  // Rough walking estimate: average human walks ~80 m/min
  const walkMins = Math.max(1, Math.round(restroom.distance / 80));
  const address = [restroom.street, restroom.city].filter(Boolean).join(", ");

  // Universal maps link — iOS opens Apple Maps, Android opens Google Maps,
  // desktop opens maps.google.com
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}&travelmode=walking`;

  return (
    <div className="hero">
      <div className="hero-label">
        <span className="hero-pulse" />
        CLOSEST RESTROOM
      </div>

      <h2 className="hero-name">{restroom.name || "Unnamed Restroom"}</h2>

      {address && <p className="hero-address">{address}</p>}

      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-num">{formatDistance(restroom.distance)}</div>
          <div className="hero-stat-label">away</div>
        </div>
        <div className="hero-stat-divider" />
        <div className="hero-stat">
          <div className="hero-stat-num">{walkMins}</div>
          <div className="hero-stat-label">min walk</div>
        </div>
      </div>

      <div className="hero-badges">
        {restroom.accessible && (
          <span className="badge badge-accessible">♿ Accessible</span>
        )}
        {restroom.unisex && (
          <span className="badge badge-unisex">⚧ Gender Neutral</span>
        )}
      </div>

      <a
        className="hero-go"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="hero-go-arrow">→</span>
        GO
      </a>

      <button className="hero-details" onClick={onDetails}>
        More details
      </button>
    </div>
  );
}

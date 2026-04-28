import { trackEvent } from "../utils/analytics";

/**
 * FilterBar — horizontal row of toggle chips.
 *
 * Props:
 *   filters   – { accessible, unisex, free, openNow }
 *   onChange  – callback receiving updated filters object
 *   onLocate  – callback for the "Near me" button (re-request location)
 */
export default function FilterBar({ filters, onChange, onLocate }) {
  const toggle = (key) => {
    const next = { ...filters, [key]: !filters[key] };
    trackEvent("filter_toggled", { filter: key, on: next[key] });
    onChange(next);
  };

  return (
    <div className="filter-bar">
      <button
        className={`chip ${filters.accessible ? "chip-active" : ""}`}
        onClick={() => toggle("accessible")}
        aria-pressed={!!filters.accessible}
      >
        <span className="chip-icon" aria-hidden="true">♿</span>
        Accessible
      </button>

      <button
        className={`chip ${filters.unisex ? "chip-active" : ""}`}
        onClick={() => toggle("unisex")}
        aria-pressed={!!filters.unisex}
      >
        <span className="chip-icon" aria-hidden="true">⚧</span>
        Gender Neutral
      </button>

      <button
        className={`chip ${filters.free ? "chip-active" : ""}`}
        onClick={() => toggle("free")}
        aria-pressed={!!filters.free}
        title="Hide bathrooms that charge a fee"
      >
        <span className="chip-icon" aria-hidden="true">✓</span>
        Free
      </button>

      <button
        className={`chip ${filters.openNow ? "chip-active" : ""}`}
        onClick={() => toggle("openNow")}
        aria-pressed={!!filters.openNow}
        title="Only show bathrooms open right now"
      >
        <span className="chip-icon" aria-hidden="true">🕐</span>
        Open now
      </button>

      <button
        className={`chip ${filters.singleOccupant ? "chip-active" : ""}`}
        onClick={() => toggle("singleOccupant")}
        aria-pressed={!!filters.singleOccupant}
        title="Locked single-person bathrooms only"
      >
        <span className="chip-icon" aria-hidden="true">🔒</span>
        Private
      </button>

      <button className="chip chip-locate" onClick={onLocate} title="Recenter on my location">
        <span className="chip-icon" aria-hidden="true">📍</span>
        Near me
      </button>
    </div>
  );
}

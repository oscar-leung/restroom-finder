/**
 * FilterBar — horizontal row of toggle chips.
 *
 * Props:
 *   filters   – { accessible: bool, unisex: bool }
 *   onChange  – callback receiving updated filters object
 *   onLocate  – callback for the "Near me" button (re-request location)
 */
export default function FilterBar({ filters, onChange, onLocate }) {
  const toggle = (key) => onChange({ ...filters, [key]: !filters[key] });

  return (
    <div className="filter-bar">
      <button
        className={`chip ${filters.accessible ? "chip-active" : ""}`}
        onClick={() => toggle("accessible")}
      >
        <span className="chip-icon" aria-hidden="true">♿</span>
        Accessible
      </button>

      <button
        className={`chip ${filters.unisex ? "chip-active" : ""}`}
        onClick={() => toggle("unisex")}
      >
        <span className="chip-icon" aria-hidden="true">⚧</span>
        Gender Neutral
      </button>

      <button className="chip chip-locate" onClick={onLocate} title="Recenter on my location">
        <span className="chip-icon" aria-hidden="true">📍</span>
        Near me
      </button>
    </div>
  );
}

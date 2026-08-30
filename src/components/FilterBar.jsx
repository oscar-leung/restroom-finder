import { trackEvent } from "../utils/analytics";
import { useI18n } from "../i18n";

/**
 * FilterBar — horizontal row of toggle chips.
 *
 * Props:
 *   filters        – { accessible, unisex, free, openNow, ... country }
 *   onChange       – callback receiving updated filters object
 *   onLocate       – callback for the "Near me" button (re-request location)
 *   countryOptions – distinct countries in the loaded results; the
 *                    dropdown renders only when there are 2+ (behind
 *                    the country_filter flag — pass undefined when off)
 */
export default function FilterBar({ filters, onChange, onLocate, countryOptions }) {
  const { t } = useI18n();

  const toggle = (key) => {
    const next = { ...filters, [key]: !filters[key] };
    trackEvent("filter_toggled", { filter: key, on: next[key] });
    onChange(next);
  };

  const pickCountry = (value) => {
    trackEvent("filter_toggled", { filter: "country", on: !!value, country: value });
    onChange({ ...filters, country: value });
  };

  // Declarative chip list keeps the markup in one place
  const chips = [
    { key: "accessible", icon: "♿", label: t("filter.accessible") },
    { key: "unisex", icon: "⚧", label: t("filter.unisex") },
    { key: "free", icon: "✓", label: t("filter.free"), title: "Hide bathrooms that charge a fee" },
    { key: "openNow", icon: "🕐", label: t("filter.openNow"), title: "Only show bathrooms open right now" },
    { key: "singleOccupant", icon: "🔒", label: t("filter.private"), title: "Locked single-person bathrooms only" },
    { key: "bench", icon: "🪑", label: t("filter.bench"), title: "Only show bathrooms with a bench within 60m — somewhere to rest on the way" },
    { key: "noStairs", icon: "🚷", label: t("filter.noStairs"), title: "Hide bathrooms known to be on another floor or underground" },
  ];

  return (
    <div className="filter-bar">
      {chips.map((c) => (
        <button
          key={c.key}
          className={`chip ${filters[c.key] ? "chip-active" : ""}`}
          onClick={() => toggle(c.key)}
          aria-pressed={!!filters[c.key]}
          title={c.title}
        >
          <span className="chip-icon" aria-hidden="true">{c.icon}</span>
          {c.label}
        </button>
      ))}

      {countryOptions && countryOptions.length >= 2 && (
        <select
          className={`chip chip-select ${filters.country ? "chip-active" : ""}`}
          value={filters.country || ""}
          onChange={(e) => pickCountry(e.target.value)}
          aria-label="Filter by country"
        >
          <option value="">🌍 {t("filter.allCountries")}</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <button className="chip chip-locate" onClick={onLocate} title="Recenter on my location">
        <span className="chip-icon" aria-hidden="true">📍</span>
        {t("filter.nearMe")}
      </button>
    </div>
  );
}

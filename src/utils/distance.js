/**
 * Haversine formula: computes great-circle distance between two GPS points.
 * Returns distance in METERS.
 *
 * https://en.wikipedia.org/wiki/Haversine_formula
 */
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Auto-detect imperial vs metric from the user's locale. US, Liberia,
 * and Myanmar use imperial (~feet/miles); everyone else uses metric.
 *
 * Cached on first call, persisted to localStorage so a user can
 * override later via a settings menu (future feature).
 */
let _unitCache = null;
function detectUnit() {
  if (_unitCache) return _unitCache;
  try {
    const override = localStorage.getItem("gg_distance_unit");
    if (override === "imperial" || override === "metric") {
      _unitCache = override;
      return override;
    }
  } catch {}
  if (typeof navigator !== "undefined") {
    const lang = (navigator.language || "").toLowerCase();
    const region = lang.split("-")[1] || "";
    if (region === "us" || region === "lr" || region === "mm") {
      _unitCache = "imperial";
      return "imperial";
    }
  }
  _unitCache = "metric";
  return "metric";
}

export function setDistanceUnit(unit) {
  if (unit !== "imperial" && unit !== "metric") return;
  _unitCache = unit;
  try { localStorage.setItem("gg_distance_unit", unit); } catch {}
}

export function getDistanceUnit() {
  return detectUnit();
}

/**
 * Format a distance in meters into a short human-readable string.
 * Auto-switches to imperial for US users.
 *   metric:   "350 m" / "1.2 km"
 *   imperial: "350 ft" / "0.6 mi"
 */
export function formatDistance(meters) {
  const unit = detectUnit();
  if (unit === "imperial") {
    const feet = meters * 3.28084;
    if (feet < 1000) return `${Math.round(feet)} ft`;
    return `${(feet / 5280).toFixed(1)} mi`;
  }
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

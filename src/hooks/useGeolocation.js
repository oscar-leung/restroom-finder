import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook that asks the browser for the user's GPS coordinates.
 *
 * Returns:
 *   position   – { latitude, longitude } once resolved, else null
 *   error      – error message string if denied / unavailable
 *   loading    – true while resolving
 *   refresh    – () → re-request the user's location
 */
export default function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wrap in useCallback so the reference is stable (safe to put in deps)
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Kick off on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { position, error, loading, refresh: getLocation };
}

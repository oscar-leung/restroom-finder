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

  // The subscription itself: registers browser callbacks and a soft
  // timeout, but flips NO state synchronously — `loading` starts true
  // on mount, and `refresh` (an event handler) flips it for re-requests.
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      // Async so the mount-effect body stays setState-free
      setTimeout(() => {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
      }, 0);
      return;
    }

    // Soft timeout: some browsers (and headless previews) never fire either
    // callback if the user doesn't interact with the permission prompt.
    // Fall back after 5s so the app doesn't hang on a blank screen.
    let settled = false;
    const softTimeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      setError("Location request timed out — using a default city.");
      setLoading(false);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(softTimeout);
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(softTimeout);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
    );
  }, []);

  // Re-request from a user action (the ↻ button): flip the flags in the
  // event handler, then re-subscribe.
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    locate();
  }, [locate]);

  // Kick off on mount — loading already initialized true
  useEffect(() => {
    locate();
  }, [locate]);

  return { position, error, loading, refresh };
}

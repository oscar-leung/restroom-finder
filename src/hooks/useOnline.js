import { useEffect, useState } from "react";

/**
 * useOnline — track navigator.onLine + attach offline/online events.
 * Returns true when the device thinks it has connectivity.
 *
 * Note: navigator.onLine returns "true" if the device is connected to
 * a network — it does NOT guarantee the internet is reachable. Real
 * dropped-API detection happens in the data layer (try/catch on fetch).
 */
export default function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine !== false : true
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

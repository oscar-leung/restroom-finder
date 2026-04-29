import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './utils/analytics.js'

// Fire the GA4 loader (no-op if VITE_GA_ID is not set)
initAnalytics()

// Migrate any pre-IndexedDB photos to the new store. Idempotent + best-effort.
import("./services/photos.js").then((m) => m.migrateLegacyPhotos?.());

// Register service worker for offline support — prod only.
// In dev the SW would aggressively cache stale code and confuse you.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

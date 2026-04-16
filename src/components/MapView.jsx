import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Build a custom Leaflet DivIcon from an SVG string.
 * Using SVG = crisp at any zoom + no external image files.
 */
function svgIcon(svg, size = [32, 40]) {
  return L.divIcon({
    html: svg,
    className: "custom-pin", // we strip default styles via this class
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // point of pin at bottom-center
    popupAnchor: [0, -size[1]],
  });
}

// Blue pulsing dot for the user's location (like Google / Apple Maps)
const userDotIcon = L.divIcon({
  html: `
    <div class="user-dot">
      <div class="user-dot-pulse"></div>
      <div class="user-dot-core"></div>
    </div>`,
  className: "custom-pin",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Restroom pin — different color if selected
function restroomPin(selected, accessible) {
  const fill = selected ? "#8b5cf6" : "#6366f1"; // violet vs indigo
  const accessibleDot = accessible
    ? `<circle cx="24" cy="10" r="5" fill="#10b981" stroke="white" stroke-width="1.5"/>`
    : "";
  return svgIcon(`
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24s16-13 16-24c0-8.8-7.2-16-16-16z"
            fill="${fill}" stroke="white" stroke-width="2"/>
      <text x="16" y="21" text-anchor="middle" fill="white"
            font-family="system-ui" font-size="14" font-weight="700">WC</text>
      ${accessibleDot}
    </svg>`);
}

/**
 * RecenterMap — smoothly pans the map when `center` changes.
 * We use flyTo for a nice animated transition rather than a hard jump.
 */
function RecenterMap({ center, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, 16, { duration: 0.6 });
  }, [trigger]); // re-run when trigger changes (e.g. user taps pin or locate btn)
  return null;
}

/**
 * MapView — renders the Leaflet map with user + restroom markers.
 *
 * Props:
 *   position     – { latitude, longitude } for user
 *   restrooms    – filtered + sorted array
 *   onSelect     – callback(restroom) when pin clicked
 *   selectedId   – id of currently selected restroom
 *   recenterKey  – change this number to force a recenter (e.g. "Near me" btn)
 */
export default function MapView({
  position,
  restrooms,
  onSelect,
  selectedId,
  recenterKey,
}) {
  const center = [position.latitude, position.longitude];

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="map-container"
      zoomControl={false} // we hide default zoom — looks cleaner on mobile
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} trigger={recenterKey} />

      {/* User's live location */}
      <Marker position={center} icon={userDotIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Restroom pins */}
      {restrooms.map((r) => (
        <Marker
          key={r.id}
          position={[r.latitude, r.longitude]}
          icon={restroomPin(r.id === selectedId, r.accessible)}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          <Popup>{r.name || "Unnamed restroom"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

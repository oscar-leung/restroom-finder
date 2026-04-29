import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchWalkingRoute } from "../services/routing";

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

// Restroom pin — color by selection / source, size by visit count.
// visitCount=0 → 32×40 (default); 1–2 → 38×48; 3+ → 46×58 ("frequent visit").
function restroomPin({ selected, accessible, source, visitCount = 0 }) {
  // Source-based coloring:
  //   - selected   → violet (highlighted hero)
  //   - user-added → amber (your contribution)
  //   - else       → indigo
  let fill = "#6366f1";
  if (selected) fill = "#8b5cf6";
  else if (source === "user") fill = "#f59e0b";

  // Size scales with personal visit count — your "concentration" hot spots
  let w = 32, h = 40;
  if (visitCount >= 3) { w = 46; h = 58; }
  else if (visitCount >= 1) { w = 38; h = 48; }

  const accessibleDot = accessible
    ? `<circle cx="${w * 0.75}" cy="${h * 0.25}" r="${w * 0.16}"
              fill="#10b981" stroke="white" stroke-width="1.5"/>`
    : "";

  // Visit-count badge for frequent spots (3+)
  const visitBadge = visitCount >= 3
    ? `<g transform="translate(${w - 14}, ${h - 28})">
         <circle cx="0" cy="0" r="9" fill="white" stroke="#f59e0b" stroke-width="2"/>
         <text x="0" y="3" text-anchor="middle" fill="#92400e"
               font-family="system-ui" font-size="10" font-weight="800">${visitCount}</text>
       </g>`
    : "";

  return svgIcon(`
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${w/2} 0C${w*0.225} 0 0 ${w*0.225} 0 ${w/2}c0 ${h*0.275} ${w/2} ${h*0.6} ${w/2} ${h*0.6}s${w/2} -${h*0.325} ${w/2} -${h*0.6}c0-${w*0.275}-${w*0.225}-${w/2}-${w/2}-${w/2}z"
            fill="${fill}" stroke="white" stroke-width="2"/>
      <text x="${w/2}" y="${h * 0.525}" text-anchor="middle" fill="white"
            font-family="system-ui" font-size="${Math.round(w * 0.44)}" font-weight="700">WC</text>
      ${accessibleDot}
      ${visitBadge}
    </svg>`, [w, h]);
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
  visits = {},
  onSelect,
  selectedId,
  recenterKey,
}) {
  const center = [position.latitude, position.longitude];
  const hasVisits = Object.keys(visits).length > 0;

  // Real walking-route polyline via OSRM. Falls back to straight line
  // if OSRM fails or returns nothing.
  const [routeCoords, setRouteCoords] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setRouteCoords(null);
    const sel = restrooms.find((r) => r.id === selectedId);
    if (!sel) return;
    fetchWalkingRoute(
      { lat: position.latitude, lng: position.longitude },
      { lat: sel.latitude, lng: sel.longitude }
    ).then((res) => {
      if (cancelled || !res) return;
      setRouteCoords(res.coordinates);
    });
    return () => { cancelled = true; };
  }, [selectedId, position.latitude, position.longitude]);

  return (
    <>
      <MapContainer
        center={center}
        zoom={15}
        className="map-container"
        zoomControl={false}
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

        {/* Walking route from user to currently-selected bathroom.
            We try OSRM (real walking path) first; while it's loading or
            if it fails, show the straight-line fallback. */}
        {(() => {
          const sel = restrooms.find((r) => r.id === selectedId);
          if (!sel) return null;
          const useReal = routeCoords && routeCoords.length > 1;
          const positions = useReal
            ? routeCoords
            : [center, [sel.latitude, sel.longitude]];
          return (
            <>
              {/* Soft halo behind the line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#6366f1",
                  weight: 8,
                  opacity: 0.18,
                  lineCap: "round",
                }}
              />
              {/* Main line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#6366f1",
                  weight: 4,
                  opacity: 0.95,
                  dashArray: useReal ? null : "8, 8",
                  lineCap: "round",
                }}
              />
            </>
          );
        })()}

        {/* Restroom pins */}
        {restrooms.map((r) => {
          const visitCount = visits[r.id]?.count || 0;
          return (
            <Marker
              key={r.id}
              position={[r.latitude, r.longitude]}
              icon={restroomPin({
                selected: r.id === selectedId,
                accessible: r.accessible,
                source: r.source,
                visitCount,
              })}
              eventHandlers={{ click: () => onSelect(r) }}
            >
              <Popup>
                {r.name || "Unnamed restroom"}
                {visitCount > 0 && <><br />Visited {visitCount}×</>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div className="map-legend" aria-hidden="true">
        <div className="map-legend-row">
          <span className="map-legend-pin map-legend-pin-default" />
          <span>Public</span>
        </div>
        <div className="map-legend-row">
          <span className="map-legend-pin map-legend-pin-user" />
          <span>Added by you</span>
        </div>
        {hasVisits && (
          <div className="map-legend-row">
            <span className="map-legend-pin map-legend-pin-visited" />
            <span>Your usuals (sized by visits)</span>
          </div>
        )}
      </div>
    </>
  );
}

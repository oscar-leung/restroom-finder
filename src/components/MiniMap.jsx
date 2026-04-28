/**
 * MiniMap — tiny static map thumbnail using OpenStreetMap's static
 * tile endpoint. ~64x64 default; useful as an at-a-glance "where is
 * this" indicator on alternative cards.
 *
 * Why not use Leaflet here too: 60 mini Leaflet instances on one page
 * tank performance. A single tile from OSM's standard server is a
 * single image fetch — much cheaper.
 *
 * Tile math: convert lat/lng to tile coords at a given zoom and pull
 * the surrounding tile. Returns an <img> at the requested size.
 */
function lngToTileX(lng, z) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}
function latToTileY(lat, z) {
  return Math.floor(
    (1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
        Math.PI) /
      2 *
      Math.pow(2, z)
  );
}

export default function MiniMap({ lat, lng, zoom = 16, size = 56 }) {
  const x = lngToTileX(lng, zoom);
  const y = latToTileY(lat, zoom);
  // Use the standard tile server. For production traffic add an ETag
  // cache or self-host tiles per OSM's tile usage policy:
  // https://operations.osmfoundation.org/policies/tiles/
  const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  return (
    <div
      className="mini-map"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={url}
        alt=""
        loading="lazy"
        width={size}
        height={size}
      />
      {/* Center pin overlay */}
      <span className="mini-map-pin" />
    </div>
  );
}

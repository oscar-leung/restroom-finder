/**
 * Photo storage — device-local MVP.
 *
 * For now we resize uploaded photos to 800px max edge, encode as
 * JPEG quality 0.7, and store in localStorage. Capped at 5 photos
 * per bathroom and ~2 MB total per device — anything bigger gets
 * dropped to keep us under localStorage's ~5 MB ceiling.
 *
 * When the backend ships:
 *   - Move storage to R2 / S3 / Cloudinary
 *   - Keep this same export shape so consumers don't change
 *   - Migrate localStorage photos by POSTing them on first load
 */

const KEY = "gg_photos_v1";
const MAX_PER_BATHROOM = 5;
const MAX_EDGE_PX = 800;
const JPEG_QUALITY = 0.72;
const MAX_TOTAL_BYTES = 2_000_000;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} }

function approxBytes(obj) {
  try { return JSON.stringify(obj).length; } catch { return 0; }
}

/**
 * Resize + compress a File to a JPEG dataURL.
 */
async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file);
  const longestEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longestEdge > MAX_EDGE_PX ? MAX_EDGE_PX / longestEdge : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export async function uploadPhoto(bathroomId, file) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Please pick an image file.");
  }
  const dataUrl = await fileToDataUrl(file);
  const all = read();
  const list = all[bathroomId] || [];
  const photo = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };
  // Newest first; cap per bathroom
  all[bathroomId] = [photo, ...list].slice(0, MAX_PER_BATHROOM);

  // Trim oldest bathrooms if total too big
  while (approxBytes(all) > MAX_TOTAL_BYTES) {
    const ids = Object.keys(all);
    if (ids.length <= 1) break;
    let oldestId = ids[0];
    let oldestStamp = Infinity;
    for (const id of ids) {
      const stamp = new Date(all[id]?.[0]?.uploadedAt || 0).getTime();
      if (stamp < oldestStamp && id !== bathroomId) {
        oldestStamp = stamp;
        oldestId = id;
      }
    }
    delete all[oldestId];
  }

  write(all);
  return photo;
}

export function getPhotos(bathroomId) {
  return read()[bathroomId] || [];
}

export function deletePhoto(bathroomId, photoId) {
  const all = read();
  if (!all[bathroomId]) return;
  all[bathroomId] = all[bathroomId].filter((p) => p.id !== photoId);
  write(all);
}

import { get, set, del, keys } from "idb-keyval";

/**
 * Photo storage — now backed by IndexedDB (via idb-keyval).
 *
 * Why we migrated from localStorage:
 *   - localStorage caps at ~5 MB total per origin (and JSON-stringifies
 *     every read/write — slow with embedded base64 images)
 *   - IndexedDB caps at the disk-quota tier (typically 50 MB+ on phones,
 *     gigs on desktop) and stores Blobs natively
 *
 * This keeps the same exported API (uploadPhoto / getPhotos /
 * deletePhoto) so consumers don't change. The store key is the
 * bathroom id; values are arrays of photo records.
 *
 * On-device-only until backend ships. Then this becomes the offline
 * cache and a sync engine pushes uploads to R2/S3.
 */

const KEY_PREFIX = "gg_photo_";
const MAX_PER_BATHROOM = 6;
const MAX_EDGE_PX = 1000; // bumped now that we have IDB headroom
const JPEG_QUALITY = 0.78;

async function fileToBlob(file) {
  const bitmap = await createImageBitmap(file);
  const longestEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longestEdge > MAX_EDGE_PX ? MAX_EDGE_PX / longestEdge : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
}

function k(bathroomId) {
  return `${KEY_PREFIX}${bathroomId}`;
}

export async function uploadPhoto(bathroomId, file) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Please pick an image file.");
  }
  const blob = await fileToBlob(file);
  const url = URL.createObjectURL(blob); // session-lived; we re-create on read
  const list = (await get(k(bathroomId))) || [];
  const photo = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    blob,
    uploadedAt: new Date().toISOString(),
  };
  const nextList = [photo, ...list].slice(0, MAX_PER_BATHROOM);
  await set(k(bathroomId), nextList);
  // Return a reading-friendly shape (with a fresh objectURL)
  return { ...photo, dataUrl: url };
}

/**
 * Returns an array of { id, dataUrl, uploadedAt }.
 * dataUrl is an object URL we revive from the stored Blob each call.
 *
 * Note: callers should treat dataUrl as ephemeral — if the user
 * re-mounts the modal the URLs will be regenerated. That's fine for
 * <img src=...>.
 */
export async function getPhotos(bathroomId) {
  const list = (await get(k(bathroomId))) || [];
  return list.map((p) => ({
    id: p.id,
    uploadedAt: p.uploadedAt,
    dataUrl: p.blob ? URL.createObjectURL(p.blob) : p.dataUrl,
  }));
}

export async function deletePhoto(bathroomId, photoId) {
  const list = (await get(k(bathroomId))) || [];
  const next = list.filter((p) => p.id !== photoId);
  if (next.length === 0) await del(k(bathroomId));
  else await set(k(bathroomId), next);
}

/**
 * Migrate photos previously stored in localStorage to IndexedDB.
 * Idempotent — safe to call on every load. Drops localStorage entries
 * after migration.
 */
export async function migrateLegacyPhotos() {
  try {
    const raw = localStorage.getItem("gg_photos_v1");
    if (!raw) return;
    const old = JSON.parse(raw) || {};
    for (const [bathroomId, list] of Object.entries(old)) {
      if (!Array.isArray(list)) continue;
      // The legacy entries had `dataUrl` (base64). Convert to Blob.
      const migrated = await Promise.all(
        list.map(async (p) => {
          if (!p.dataUrl) return null;
          try {
            const res = await fetch(p.dataUrl);
            const blob = await res.blob();
            return { id: p.id, blob, uploadedAt: p.uploadedAt };
          } catch {
            return null;
          }
        })
      );
      const valid = migrated.filter(Boolean);
      if (valid.length) await set(k(bathroomId), valid);
    }
    localStorage.removeItem("gg_photos_v1");
  } catch {
    /* swallow — migration is best-effort */
  }
}

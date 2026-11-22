export const MAX_SOURCE_PHOTO_BYTES = 15 * 1024 * 1024;
const UPLOAD_MAX_EDGE = 1200;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Returns an error message for an unsuitable file, or null if it can be used. */
export function checkPhotoFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Please choose a JPEG, PNG or WebP photo.';
  if (file.size > MAX_SOURCE_PHOTO_BYTES) return 'That photo is larger than 15 MB. Please choose a smaller one.';
  return null;
}

/** Downscale a photo in the browser (JPEG, max 1200px) so uploads stay small. */
export function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, UPLOAD_MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable image'));
    };
    img.src = url;
  });
}

/** Uploads a downscaled photo; returns its same-origin URL (/uploads/…). */
export async function uploadOwnerPhoto(ownerToken: string, dataUrl: string): Promise<string> {
  const resp = await fetch('/api/owner/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ dataUrl }),
  });
  const data = (await resp.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!resp.ok || !data.url) throw new Error(data.error || 'Could not upload the photo.');
  return data.url;
}

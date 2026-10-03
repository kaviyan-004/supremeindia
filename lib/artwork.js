// Shared helpers for customer artwork (Custom Print enquiries).
// Artwork lives in a PRIVATE Vercel Blob store (separate from the public product-photo store) and
// is only ever served to a signed-in admin through /api/admin/custom-orders/artwork.

export const ARTWORK_MAX_BYTES = 4 * 1024 * 1024; // Vercel Functions reject request bodies over 4.5 MB

// Token for the PRIVATE artwork store. Created by Vercel when a second (private) Blob store is
// connected with the env-var prefix "ARTWORK_BLOB".
export function getArtworkToken() {
  return process.env.ARTWORK_BLOB_READ_WRITE_TOKEN || '';
}

// Only paths we generated ourselves are accepted (stops anyone pointing an order at another file/URL).
export const ARTWORK_PATH_RE = /^artwork\/\d{13}-[a-f0-9]{12}\.(png|jpg|gif|webp)$/;

export const ARTWORK_TYPES = [
  { ext: 'png', mime: 'image/png', match: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', mime: 'image/jpeg', match: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', mime: 'image/gif', match: (b) => b.length > 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')) },
  {
    ext: 'webp',
    mime: 'image/webp',
    match: (b) => b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

// Admin-only URL that streams a private artwork file (this is what gets stored on the order).
export function artworkAdminUrl(pathname) {
  return `/api/admin/custom-orders/artwork?file=${encodeURIComponent(pathname)}`;
}

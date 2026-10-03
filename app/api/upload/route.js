import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { requireAdmin } from '../../../lib/auth';

// Vercel Functions reject request bodies over 4.5 MB, so keep a safe margin below that.
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

// Allowed image types, detected from the file's actual bytes (not the client-supplied
// name or Content-Type). The stored name/extension/type come from this table, never from the upload.
const TYPES = [
  { ext: 'png', mime: 'image/png', match: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'jpg', mime: 'image/jpeg', match: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', mime: 'image/gif', match: (b) => b.length > 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')) },
  {
    ext: 'webp',
    mime: 'image/webp',
    match: (b) => b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
  },
];

// Uploads go to Vercel Blob (permanent public URLs). Nothing is ever written to the website's local folder.
export async function POST(request) {
  // Admin only
  try {
    requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  // Fail clearly if Vercel Blob has not been connected to this project
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return NextResponse.json(
      {
        error:
          'Image storage is not configured. Connect a Vercel Blob store to this project (Vercel dashboard → Storage) and redeploy. You can also paste an image URL instead.',
      },
      { status: 503 }
    );
  }

  try {
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BYTES + 64 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = TYPES.find((t) => t.match(buffer));
    if (!type) {
      return NextResponse.json(
        { error: 'Only PNG, JPG, GIF or WebP images are allowed' },
        { status: 400 }
      );
    }

    const pathname = `products/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${type.ext}`;
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: type.mime,
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

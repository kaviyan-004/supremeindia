import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { getClientIp, checkRateLimit } from '../../../../lib/rateLimiter';
import { ARTWORK_MAX_BYTES, ARTWORK_TYPES, getArtworkToken } from '../../../../lib/artwork';

// Public endpoint for customers to attach artwork to a Custom Print enquiry.
// Files go to a PRIVATE Blob store and are never given a public URL.
export async function POST(request) {
  const token = getArtworkToken();
  if (!token) {
    return NextResponse.json(
      { error: "Artwork upload isn't available right now. Please remove the file and submit your request without it." },
      { status: 503 }
    );
  }

  // Spam protection: a few uploads per IP per 10 minutes
  const ip = getClientIp(request);
  const rate = checkRateLimit(`artwork-upload:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Please wait ${rate.resetInSeconds} seconds and try again.` },
      { status: 429, headers: { 'Retry-After': String(rate.resetInSeconds) } }
    );
  }

  try {
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > ARTWORK_MAX_BYTES + 64 * 1024) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > ARTWORK_MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 413 });
    }

    // Detect the real type from the file's bytes; ignore the client-supplied name/type.
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = ARTWORK_TYPES.find((t) => t.match(buffer));
    if (!type) {
      return NextResponse.json({ error: 'Only PNG, JPG, GIF or WebP images are allowed' }, { status: 400 });
    }

    const pathname = `artwork/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${type.ext}`;
    await put(pathname, buffer, {
      access: 'private',
      contentType: type.mime,
      addRandomSuffix: false,
      token,
    });

    // Only an opaque id is returned (no URL); the enquiry form passes it back when submitting.
    return NextResponse.json({ artworkId: pathname });
  } catch (err) {
    console.error('Artwork upload failed:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

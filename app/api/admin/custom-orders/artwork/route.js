import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { requireAdmin } from '../../../../../lib/auth';
import { ARTWORK_PATH_RE, getArtworkToken } from '../../../../../lib/artwork';

// Admin-only: streams a customer's private artwork file.
export async function GET(request) {
  try {
    requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  const token = getArtworkToken();
  if (!token) {
    return NextResponse.json({ error: 'Artwork storage is not configured.' }, { status: 503 });
  }

  const file = new URL(request.url).searchParams.get('file') || '';
  if (!ARTWORK_PATH_RE.test(file)) {
    return NextResponse.json({ error: 'Invalid file.' }, { status: 400 });
  }

  try {
    const result = await get(file, { access: 'private', token });
    if (!result || !result.stream) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob?.contentType || 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    });
  } catch (err) {
    console.error('Artwork fetch failed:', err);
    return NextResponse.json({ error: 'Could not load artwork.' }, { status: 500 });
  }
}

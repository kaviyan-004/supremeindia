import { NextResponse } from 'next/server';

// Server-side gate for the admin UI. Runs on the Edge runtime, so the session JWT
// (HS256, same format as lib/jwt.js) is verified with Web Crypto instead of Node's crypto.
// API routes still enforce requireAdmin() themselves.

function b64urlToBytes(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function verifyAdminToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('si_session')?.value;
  if (await verifyAdminToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

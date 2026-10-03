import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  
  // Clear secure session cookie
  response.cookies.set('si_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  // Clear legacy cookie if present
  response.cookies.set('si_auth_user', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}

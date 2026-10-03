import { NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/auth';
import { signSessionToken } from '../../../../lib/jwt';
import { getClientIp, checkLoginLimit, clearLoginLimit } from '../../../../lib/rateLimiter';

export async function POST(req) {
  const ip = getClientIp(req);

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Check Rate Limit (Anti-Brute Force Protection)
    const rateCheck = checkLoginLimit(ip, email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) },
        }
      );
    }

    // 2. Authenticate
    const user = await authenticateUser({ email, password });

    // Clear rate limit record upon successful login
    clearLoginLimit(ip, email);

    // 3. Issue Cryptographically Signed HttpOnly JWT Session Token
    const isAdmin = user.role === 'admin';
    const sessionLifespanSeconds = isAdmin ? 24 * 3600 : 7 * 24 * 3600; // 24h for admin, 7 days for customer

    const token = signSessionToken(
      {
        sub: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      sessionLifespanSeconds
    );

    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    // Set Secure HttpOnly Session Cookie (Cannot be accessed or modified via JavaScript)
    response.cookies.set('si_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionLifespanSeconds,
    });

    // Clean up any legacy unencrypted cookie
    response.cookies.set('si_auth_user', '', {
      httpOnly: false,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

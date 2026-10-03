import { NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';
import { signSessionToken } from '../../../../lib/jwt';
import { getClientIp, checkRegisterLimit } from '../../../../lib/rateLimiter';

export async function POST(req) {
  const ip = getClientIp(req);

  try {
    // 1. Rate Limit Registration (Anti-Spam / Bot Protection)
    const rateCheck = checkRegisterLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts from this network. Please wait ${rateCheck.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) },
        }
      );
    }

    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Phone, Password) are required.' },
        { status: 400 }
      );
    }

    // Input Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long for security.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // 2. Register user with bcrypt password hash
    const user = await registerUser({ name: name.trim(), email, phone, password });

    // 3. Issue Cryptographically Signed HttpOnly JWT Session Token
    const sessionLifespanSeconds = 7 * 24 * 3600; // 7 days
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

    // Set Secure HttpOnly Session Cookie
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

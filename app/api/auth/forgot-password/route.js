import { NextResponse } from 'next/server';
import { createPasswordResetToken } from '../../../../lib/auth';
import { getClientIp, checkForgotPasswordLimit } from '../../../../lib/rateLimiter';

export async function POST(req) {
  const ip = getClientIp(req);

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Rate limit password reset requests (Anti-Abuse)
    const rateCheck = checkForgotPasswordLimit(ip, email);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${rateCheck.resetInSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) },
        }
      );
    }

    const resetData = await createPasswordResetToken(email);

    // Uniform response to prevent account/email enumeration timing attacks
    const responsePayload = {
      success: true,
      message:
        'If an account exists with this email address, a password reset link has been generated (valid for 15 minutes).',
    };

    // In local development or testing mode, expose the test reset link for easy local verification
    if (process.env.NODE_ENV === 'development' && resetData?.rawToken) {
      responsePayload.devResetUrl = `/account/reset-password?token=${resetData.rawToken}&email=${encodeURIComponent(
        email
      )}`;
      responsePayload.token = resetData.rawToken;
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

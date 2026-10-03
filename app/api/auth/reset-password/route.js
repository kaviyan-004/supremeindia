import { NextResponse } from 'next/server';
import { resetPasswordWithToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Password reset token is missing.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken({ token, newPassword });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
      email: result.email,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

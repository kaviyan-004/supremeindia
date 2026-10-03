'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing or invalid. Please request a new password reset link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-borderDark rounded-2xl p-6 shadow-soft text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>
        <h2 className="font-heading font-black text-lg text-text-primary uppercase">
          Password Reset Complete
        </h2>
        <p className="text-xs text-text-muted">
          Your new password has been securely hashed and updated. You can now sign in with your new credentials.
        </p>
        <Link
          href="/account/login"
          className="btn-primary block w-full py-3 text-xs font-bold text-center"
        >
          Proceed to Login →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-brand-subtle border border-brand/20 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-brand text-[28px]">lock_reset</span>
        </div>
        <h1 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
          SET NEW PASSWORD
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {emailParam ? `Reset password for ${emailParam}` : 'Choose a secure new password for your account'}
        </p>
      </div>

      <form onSubmit={handleReset} className="bg-white border border-borderDark rounded-2xl p-5 shadow-soft space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {!token && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 text-xs font-medium">
            ⚠️ No reset token detected in the link. Please request a new link from the login page.
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            New Password (Min 8 Characters) *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            Confirm New Password *
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="btn-primary w-full text-xs py-3 font-bold disabled:opacity-50"
        >
          {loading ? 'Updating Password…' : 'UPDATE PASSWORD 🔒'}
        </button>

        <div className="text-center pt-2">
          <Link href="/account/login" className="text-xs text-text-muted hover:text-brand">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="px-4 py-10">
      <Suspense fallback={<div className="text-center text-xs text-text-muted py-12">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

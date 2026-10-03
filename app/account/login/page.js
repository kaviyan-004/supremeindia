'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register'
        ? form
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      // If admin logged in, take them straight to the Owner Admin Dashboard!
      if (data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/account';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setDevResetUrl('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request password reset');

      setForgotSuccess(data.message);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 max-w-md mx-auto">
      {/* Brand Header Banner */}
      <div className="bg-brand-subtle border border-brand/20 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-brand text-[28px]">
            {mode === 'register' ? 'person_add' : mode === 'forgot' ? 'lock_reset' : 'lock'}
          </span>
        </div>
        <h1 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
          {mode === 'register'
            ? 'CREATE AN ACCOUNT'
            : mode === 'forgot'
            ? 'RESET YOUR PASSWORD'
            : 'WELCOME BACK'}
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {mode === 'register'
            ? 'Sign up to track orders & unlock VIP member discounts!'
            : mode === 'forgot'
            ? 'Enter your registered email to receive a secure reset link'
            : 'Sign in to access your orders and saved addresses'}
        </p>
      </div>

      {/* Tabs Switcher (when not in forgot mode) */}
      {mode !== 'forgot' && (
        <div className="flex border-b border-borderDark text-sm font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-brand text-brand font-black'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-brand text-brand font-black'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            New Register
          </button>
        </div>
      )}

      {/* Forgot Password Flow */}
      {mode === 'forgot' ? (
        <form onSubmit={handleForgotPassword} className="bg-white border border-borderDark rounded-2xl p-5 shadow-soft space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                <span>Reset Link Generated</span>
              </div>
              <p>{forgotSuccess}</p>
              {devResetUrl && (
                <div className="pt-2 border-t border-emerald-200/60">
                  <p className="text-[11px] font-bold text-emerald-900 mb-1">Development Test Link:</p>
                  <Link
                    href={devResetUrl}
                    className="inline-block bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-emerald-700"
                  >
                    Click to Open Password Reset Screen →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Registered Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs py-3 font-black disabled:opacity-50"
          >
            {loading ? 'Generating Link…' : 'SEND RESET INSTRUCTIONS ✉️'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setForgotSuccess('');
              }}
              className="text-xs text-text-muted hover:text-brand font-semibold"
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        /* Standard Login / Register Form */
        <form onSubmit={handleSubmit} className="bg-white border border-borderDark rounded-2xl p-5 shadow-soft space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Sharma"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="input text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input text-xs"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input text-xs"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Password *
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                  }}
                  className="text-[11px] text-brand font-semibold hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs py-3 font-black mt-2 disabled:opacity-50"
          >
            {loading
              ? 'Processing…'
              : mode === 'register'
              ? 'CREATE MY ACCOUNT 🚀'
              : 'LOG IN TO ACCOUNT →'}
          </button>

          {/* Perks Note */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="material-symbols-outlined text-brand text-[20px]">verified</span>
            <span>Get instant <strong>₹100 Off</strong> voucher on your first order after sign up!</span>
          </div>
        </form>
      )}
    </div>
  );
}

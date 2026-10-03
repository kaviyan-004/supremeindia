'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (data.user?.role !== 'admin') {
        throw new Error('This account does not have store owner / admin privileges.');
      }

      try {
        localStorage.setItem('si_auth_user', JSON.stringify(data.user));
      } catch (e) {}

      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-narrow px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 text-center shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand flex items-center justify-center mb-3 shadow-md">
          <span className="material-symbols-outlined text-white text-[32px]">
            admin_panel_settings
          </span>
        </div>
        <h1 className="font-heading font-black text-xl tracking-tight">
          OWNER ADMIN PORTAL
        </h1>
        <p className="text-xs text-neutral-300 mt-1">
          Supreme India Store Management & Orders Dashboard
        </p>
      </div>

      {/* Login Card */}
      <form onSubmit={handleLogin} className="bg-white border border-borderDark rounded-2xl p-5 shadow-soft space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            Owner Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input text-xs"
            placeholder="Admin email"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            Secret Admin Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input text-xs"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-xs py-3 font-black disabled:opacity-50"
        >
          {loading ? 'Authenticating…' : 'LOG IN TO ADMIN DASHBOARD 🚀'}
        </button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-xs text-text-muted hover:text-brand">
          ← Return to Storefront
        </Link>
      </div>
    </div>
  );
}

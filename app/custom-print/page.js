'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GARMENTS = [
  'Printed Oversized Tee',
  'Regular Graphic Tee',
  'Heavyweight Pullover Hoodie',
  'Fleece Zipper Hoodie',
];

const PLACEMENTS = [
  { value: 'front', label: 'Front Center' },
  { value: 'back', label: 'Back Large Graphic' },
  { value: 'front_and_back', label: 'Both Front & Back' },
  { value: 'pocket_and_back', label: 'Chest Logo + Back Print' },
];

export default function CustomPrintPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    garmentType: 'Printed Oversized Tee',
    color: '',
    size: 'M',
    printPlacement: 'back',
    designFile: null,
    designDescription: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
  });

  // Auto-fill logged-in customer profile if available
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || data.user.name || '',
            email: prev.email || data.user.email || '',
            phone: prev.phone || data.user.phone || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      let artworkId = '';
      if (form.designFile) {
        // Customer artwork goes to private storage through its own public (rate-limited) route
        const fd = new FormData();
        fd.append('file', form.designFile);
        const uploadRes = await fetch('/api/custom-orders/artwork', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        artworkId = uploadData.artworkId;
      }

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: { name: form.name, email: form.email, phone: form.phone },
          garment: { type: form.garmentType, color: form.color, size: form.size },
          artworkId,
          designDescription: form.designDescription,
          printPlacement: form.printPlacement,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setReference(data.referenceId);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-700 text-[32px]">palette</span>
        </div>
        <h1 className="font-heading font-black text-xl text-text-primary">
          CUSTOM PRINT ORDER RECEIVED!
        </h1>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block">
          <p className="text-xs text-text-muted">Order Reference:</p>
          <p className="font-mono font-bold text-base text-brand">{reference}</p>
        </div>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Our print master will review your artwork and send a digital mock + price quote to your phone within 24 hours.
        </p>
        <div className="pt-4">
          <Link href="/" className="btn-primary inline-flex text-xs py-2.5 px-5">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow px-4 py-4 pb-20 space-y-5">
      {/* Title */}
      <div className="bg-brand-subtle border border-brand/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-brand text-[24px]">palette</span>
          <h1 className="font-heading font-black text-lg text-text-primary">
            CUSTOM PRINT STUDIO
          </h1>
        </div>
        <p className="text-xs text-text-secondary">
          Upload your design, anime artwork, or logo. We print high-definition DTF & screen graphics on 240 GSM tees and 320 GSM fleece hoodies!
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex gap-2 text-xs font-bold">
        {['1. Garment', '2. Artwork', '3. Contact'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 text-center pb-2 border-b-2 transition-all ${
              i === step ? 'border-brand text-brand' : 'border-slate-200 text-text-muted'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 0: Garment Selection */}
      {step === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-4">
          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Select Garment Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GARMENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update('garmentType', g)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    form.garmentType === g
                      ? 'border-brand bg-brand-subtle text-brand shadow-xs'
                      : 'border-slate-200 bg-white text-text-secondary hover:border-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Garment Base Color
            </p>
            <input
              className="input text-xs"
              placeholder="e.g. Jet Black, Vintage Cream, Forest Green, Sand"
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
            />
          </div>

          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Select Size
            </p>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('size', s)}
                  className={`w-11 h-11 rounded-xl text-xs font-black transition-all ${
                    form.size === s
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(1)} className="btn-primary w-full text-xs py-3">
            Next: Artwork & Placement →
          </button>
        </div>
      )}

      {/* Step 1: Artwork & Placement */}
      {step === 1 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-4">
          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
              Upload Design File (Optional)
            </p>
            <p className="text-[11px] text-text-muted mb-2">
              Accepts PNG, JPG, WebP or GIF up to 4 MB (High resolution recommended).
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update('designFile', e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light file:text-brand hover:file:bg-brand/20"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5">
              Describe Your Vision / Text to Print
            </p>
            <textarea
              className="input text-xs min-h-[90px]"
              placeholder="e.g. Back print with gothic lettering 'REBELS NEVER DIE' and front small anime logo..."
              value={form.designDescription}
              onChange={(e) => update('designDescription', e.target.value)}
            />
          </div>

          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Print Placement
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PLACEMENTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update('printPlacement', p.value)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    form.printPlacement === p.value
                      ? 'border-brand bg-brand-subtle text-brand'
                      : 'border-slate-200 bg-white text-text-secondary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(0)}
              className="btn-outline flex-1 text-xs py-2.5"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="btn-primary flex-1 text-xs py-2.5"
            >
              Next: Contact →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-4">
          <div>
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Customer Contact Details
            </h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Enter your details below so the store admin can contact you with the price quote & mockup.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                className="input text-xs"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider mb-1">
                Phone Number (For Call / Confirmation) *
              </label>
              <input
                className="input text-xs"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider mb-1">
                Email Address (Optional)
              </label>
              <input
                className="input text-xs"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-primary uppercase tracking-wider mb-1">
                Additional Notes or Special Requests
              </label>
              <textarea
                className="input text-xs"
                rows={3}
                placeholder="Any special requests (print size, t-shirt GSM, delivery deadline, etc.)"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-brand text-xs font-bold p-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="btn-outline flex-1 text-xs py-2.5"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim() || !form.phone.trim()}
              className="btn-primary flex-1 text-xs py-2.5 disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{submitting ? 'Submitting…' : 'Submit Custom Request'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

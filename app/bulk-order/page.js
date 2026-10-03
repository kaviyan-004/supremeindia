'use client';

import { useState } from 'react';
import Link from 'next/link';

const EMPTY_ROW = { productType: 'Printed Oversized Tee', size: 'M', quantity: 25 };
const PRODUCT_TYPES = [
  'Printed Oversized Tee',
  'Standard Graphic Tee',
  'Heavyweight Pullover Hoodie',
  'Fleece Zipper Hoodie',
];

export default function BulkOrderPage() {
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [form, setForm] = useState({
    organizationName: '',
    name: '',
    email: '',
    phone: '',
    expectedDate: '',
    budget: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateRow(idx, field, value) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((r) => [...r, { ...EMPTY_ROW }]);
  }

  function removeRow(idx) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const items = Object.values(
        rows.reduce((acc, row) => {
          if (!acc[row.productType]) acc[row.productType] = { productType: row.productType, sizeBreakdown: [] };
          acc[row.productType].sizeBreakdown.push({ size: row.size, quantity: Number(row.quantity) });
          return acc;
        }, {})
      );

      const res = await fetch('/api/bulk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: form.organizationName,
          contact: { name: form.name, email: form.email, phone: form.phone },
          items,
          expectedDate: form.expectedDate || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-700 text-[32px]">inventory_2</span>
        </div>
        <h1 className="font-heading font-black text-xl text-text-primary">
          BULK ORDER ENQUIRY SUBMITTED!
        </h1>
        <p className="text-xs text-text-secondary max-w-xs mx-auto">
          Thank you for reaching out. Our wholesale merchandiser will contact you via phone or email within 24 hours with custom catalog pricing & samples.
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
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-emerald-700 text-[26px]">inventory_2</span>
          <h1 className="font-heading font-black text-lg text-text-primary">
            BULK & COLLEGE ORDERS
          </h1>
        </div>
        <p className="text-xs text-text-secondary">
          Wholesale rates with custom screen printing & high-density embroidery for college fests, student clubs, startup teams, and batch hoodies.
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-4">
        <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
          1. Organization & Contact Info
        </p>
        <div className="space-y-2.5">
          <input className="input text-xs" placeholder="College / Fest / Company Name *" value={form.organizationName} onChange={(e) => updateForm('organizationName', e.target.value)} />
          <input className="input text-xs" placeholder="Coordinator Name *" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
          <input className="input text-xs" placeholder="Phone Number *" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
          <input className="input text-xs" placeholder="Email Address" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
              2. Items & Quantities
            </p>
            <button onClick={addRow} type="button" className="text-xs font-bold text-brand hover:underline">
              + Add Item
            </button>
          </div>

          <div className="space-y-2.5 mb-3">
            {rows.map((row, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                {rows.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Item {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      aria-label={`Remove item ${idx + 1}`}
                      className="min-h-[36px] px-2 -mr-2 text-[11px] font-bold text-slate-500 hover:text-brand"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                {/* Mobile: product on its own row, size + quantity side by side below. Tablet/desktop: one row. */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-[minmax(0,1fr)_7rem_7rem]">
                  <label className="col-span-2 sm:col-span-1 block min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted mb-1 block">Product</span>
                    <select className="input text-xs py-2.5 min-h-[44px]" value={row.productType} onChange={(e) => updateRow(idx, 'productType', e.target.value)}>
                      {PRODUCT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted mb-1 block">Size</span>
                    <select className="input text-xs py-2.5 min-h-[44px]" value={row.size} onChange={(e) => updateRow(idx, 'size', e.target.value)}>
                      {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted mb-1 block">Quantity</span>
                    <input
                      type="number"
                      className="input text-xs py-2.5 min-h-[44px] text-center font-bold"
                      value={row.quantity}
                      placeholder="Qty"
                      onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                      min={1}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
            3. Delivery & Specifications
          </p>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Expected Delivery Date:</label>
            <input type="date" className="input text-xs" value={form.expectedDate} onChange={(e) => updateForm('expectedDate', e.target.value)} />
          </div>
          <input type="number" className="input text-xs" placeholder="Estimated Total Budget (₹, optional)" value={form.budget} onChange={(e) => updateForm('budget', e.target.value)} />
          <textarea className="input text-xs min-h-[70px]" placeholder="Specific artwork details, fabric GSM preference, or comments..." value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} />
        </div>

        {error && <p className="text-brand text-xs font-bold">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !form.organizationName || !form.name || !form.phone}
            className="btn-primary w-full text-xs py-3 disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>{submitting ? 'Submitting…' : 'Submit Bulk Enquiry'}</span>
          </button>
      </div>
    </div>
  );
}

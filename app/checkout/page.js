'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../components/CartContext';
import { computeTotals } from '../../lib/pricing';

const STEPS = ['1. Address', '2. Payment & Confirm'];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, couponCode } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Display-only: the server recomputes prices and the coupon discount when the order is placed.
  // Delivery is location-based and confirmed by the owner by phone, so no delivery fee is shown.
  const { discount, total } = computeTotals({
    subtotal,
    couponCode,
  });

  // Pre-fill user data if already signed in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setForm((f) => ({
            ...f,
            name: f.name || data.user.name || '',
            email: f.email || data.user.email || '',
            phone: f.phone || data.user.phone || '',
          }));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addressValid() {
    return (
      form.name?.trim().length > 1 &&
      form.phone?.trim().length >= 10 &&
      form.line1?.trim().length > 3 &&
      form.city?.trim().length > 1 &&
      form.state?.trim().length > 1 &&
      form.pincode?.trim().length === 6
    );
  }

  async function handlePlaceOrder() {
    setLoading(true);
    setError('');

    try {
      // Strictly Cash on Delivery (COD)
      await completeOrderSubmission('cod', 'pending');
    } catch (e) {
      setError(e.message || 'Something went wrong while placing order');
      setLoading(false);
    }
  }

  async function completeOrderSubmission(method, payStatus, payId = null) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        couponCode,
        paymentMethod: method,
        guestContact: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        shippingAddress: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone: form.phone,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register order');
    }

    // Success! Clear bag and push to Confirmation Receipt Page
    try {
      // Lets the success page show the receipt to guests without putting contact details in the URL
      sessionStorage.setItem('si_last_order', JSON.stringify(data));
    } catch (e) {
      // ignore storage failures
    }
    clearCart();
    router.push(`/checkout/success?order=${data.orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-zinc-400 text-[36px]">shopping_bag</span>
        </div>
        <h1 className="font-heading font-black text-lg text-text-primary">YOUR BAG IS EMPTY</h1>
        <p className="text-xs text-text-muted">
          Add an oversized graphic tee or hoodie to proceed with checkout.
        </p>
        <Link href="/shop/tees" className="btn-primary inline-flex text-xs py-2.5 px-5">
          Browse Printed Drops →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-20 space-y-4 lg:max-w-5xl lg:mx-auto lg:py-8">
      {/* Checkout Top Wizard Stepper */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Link href="/cart" className="text-slate-400 hover:text-text-primary p-1 -ml-1">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
            Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className={step === 0 ? 'text-brand font-black' : 'text-emerald-700'}>
            {step > 0 ? '✓ Address' : '1. Address'}
          </span>
          <span className="text-slate-300">/</span>
          <span className={step === 1 ? 'text-brand font-black' : 'text-slate-400'}>
            2. Payment
          </span>
        </div>
      </div>

      {/* STEP 0: ADDRESS & CONTACT */}
      {step === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3.5 lg:max-w-2xl lg:mx-auto lg:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand text-[18px]">local_shipping</span>
              Delivery Address
            </p>
            <span className="text-[10px] text-text-muted">* Required fields</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-text-secondary mb-1 block">Full Name *</label>
              <input
                className="input text-xs"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-text-secondary mb-1 block">Mobile Number *</label>
                <input
                  className="input text-xs font-mono font-bold"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-secondary mb-1 block">Email ID</label>
                <input
                  className="input text-xs"
                  placeholder="For receipt & updates"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-secondary mb-1 block">House No., Building, Street *</label>
              <input
                className="input text-xs"
                placeholder="e.g. Flat 301, Lakeview Apartments, 5th Cross"
                value={form.line1}
                onChange={(e) => update('line1', e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-secondary mb-1 block">Landmark / Area (Optional)</label>
              <input
                className="input text-xs"
                placeholder="e.g. Near HDFC Bank, Koramangala"
                value={form.line2}
                onChange={(e) => update('line2', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-text-secondary mb-1 block">Pincode *</label>
                <input
                  className="input text-xs font-mono font-bold"
                  placeholder="6 digits"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => update('pincode', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-secondary mb-1 block">City *</label>
                <input
                  className="input text-xs"
                  placeholder="e.g. Bengaluru"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-secondary mb-1 block">State *</label>
                <input
                  className="input text-xs"
                  placeholder="e.g. Karnataka"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                />
              </div>
            </div>
          </div>

          {form.pincode.length === 6 && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold p-2.5 rounded-xl flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Delivery charge for {form.pincode} will be confirmed by phone after you place the order.</span>
            </div>
          )}

          <button
            type="button"
            disabled={!addressValid()}
            onClick={() => setStep(1)}
            className="btn-primary w-full text-xs py-3.5 mt-2 disabled:opacity-40 shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Payment</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* STEP 1: PAYMENT & REVIEW */}
      {step === 1 && (
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
          {/* Order Summary Dropdown */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Order Summary ({items.length} items)
              </p>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-[11px] text-brand font-bold hover:underline"
              >
                Change Address
              </button>
            </div>

            {/* Delivery address preview */}
            <div className="text-xs text-text-secondary bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <p className="font-bold text-text-primary">{form.name} • {form.phone}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {form.line1}{form.line2 ? `, ${form.line2}` : ''}, {form.city}, {form.state} - {form.pincode}
              </p>
            </div>

            {/* Items list */}
            <div className="divide-y divide-slate-100 text-xs">
              {items.map((it) => (
                <div key={`${it.productId}-${it.size}`} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-text-primary line-clamp-1">{it.name}</p>
                    <p className="text-[11px] text-text-muted">Size: {it.size} | Qty: {it.quantity}</p>
                  </div>
                  <span className="font-bold text-text-primary">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {discount > 0 && (
              <div className="border-t border-slate-100 pt-2 flex justify-between text-xs text-emerald-700 font-bold">
                <span>Coupon Discount</span>
                <span>− ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Delivery Charge</span>
              <span className="font-bold text-text-primary">To be confirmed by phone</span>
            </div>

            {/* Price Row */}
            <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-text-primary">
              <span>Items Total (excl. delivery)</span>
              <span className="text-brand">₹{total}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-snug">
              The delivery charge depends on your location. The owner will call you to confirm it and the final payable amount.
            </p>
          </div>

          {/* Payment Method - Cash on Delivery Only */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3">
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-brand text-[18px]">payments</span>
              Payment Method
            </p>

            <div className="p-3.5 rounded-2xl border border-brand bg-brand-subtle shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">local_shipping</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-black text-xs text-text-primary">
                    Cash on Delivery (COD)
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Enabled
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Cash on Delivery is the only payment method. You pay when your order is delivered.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-brand text-xs font-bold p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Place Order CTA Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handlePlaceOrder}
              className="btn-primary w-full py-4 text-xs font-black shadow-lg flex items-center justify-center gap-2 mt-2 active:scale-98 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>
                {loading
                  ? 'Placing Order…'
                  : 'PLACE ORDER (CASH ON DELIVERY)'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '../../components/CartContext';
import { computeTotals, evaluateCoupon } from '../../lib/pricing';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, couponCode: appliedCoupon, setCouponCode: setAppliedCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  // Discount is derived from the applied coupon + current subtotal, so it drops
  // automatically if the cart no longer qualifies. The server recomputes it at order time.
  const { discount: appliedDiscount, total } = computeTotals({
    subtotal,
    couponCode: appliedCoupon,
  });

  function handleApplyCoupon() {
    const result = evaluateCoupon(couponCode, subtotal);
    if (result.valid) {
      setAppliedCoupon(couponCode.trim().toUpperCase());
    }
    setCouponMessage(result.message);
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-zinc-400 text-[40px]">shopping_bag</span>
        </div>
        <div>
          <h1 className="font-heading font-black text-xl text-text-primary">
            YOUR BAG IS EMPTY
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            Explore our oversized graphic printed tees & heavyweight hoodies drops!
          </p>
        </div>
        <Link href="/shop/tees" className="btn-primary inline-flex text-xs py-3 px-6 shadow-md">
          Shop Trending Tees →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-36 space-y-4 lg:pb-10 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-8 lg:gap-y-5 lg:items-start lg:px-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 lg:col-span-2">
        <h1 className="font-heading font-black text-lg text-text-primary">
          MY SHOPPING BAG ({items.length})
        </h1>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
          Delivery charge confirmed by phone
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.size}-${item.color}`}
            className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-soft flex gap-3"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted">
                  No img
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h2 className="font-bold text-xs text-text-primary line-clamp-1">
                    {item.name}
                  </h2>
                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-slate-400 hover:text-brand text-sm leading-none p-1 flex items-center justify-center"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    Size: {item.size}
                  </span>
                  {item.color && (
                    <span className="text-[11px] text-text-muted">
                      {item.color}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                    }
                    className="px-2.5 py-0.5 text-xs font-bold text-text-secondary hover:bg-slate-200 active:scale-95"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-text-primary">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                    }
                    className="px-2.5 py-0.5 text-xs font-bold text-text-secondary hover:bg-slate-200 active:scale-95"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-text-primary">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary column (stacked under the items on mobile, sticky right column on desktop) */}
      <aside className="space-y-4 lg:sticky lg:top-28">
      {/* Coupon Box (Google local_offer icon) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
        <p className="font-bold text-xs text-text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-brand text-[18px]">local_offer</span>
          Have a Coupon Code?
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Try SUPREME100"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="input py-2 text-xs uppercase font-bold"
          />
          <button
            onClick={handleApplyCoupon}
            className="btn-secondary py-2 px-4 text-xs font-bold whitespace-nowrap"
          >
            Apply
          </button>
        </div>
        {couponMessage && (
          <p className="text-[11px] font-bold text-brand mt-1">{couponMessage}</p>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3 text-xs">
        <p className="font-black text-xs uppercase tracking-wider text-text-primary border-b border-slate-100 pb-2">
          Price Details
        </p>
        <div className="flex justify-between text-text-secondary">
          <span>Total MRP / Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-brand font-bold">
            <span>Coupon Discount</span>
            <span>− ₹{appliedDiscount}</span>
          </div>
        )}
        <div className="flex justify-between text-text-secondary">
          <span>Delivery Charges</span>
          <span className="font-bold text-text-primary">To be confirmed</span>
        </div>
        <div className="flex justify-between font-black text-sm text-text-primary border-t border-slate-100 pt-2.5">
          <span>Items Total</span>
          <span className="text-brand text-base">₹{total}</span>
        </div>
        <p className="text-[11px] text-text-muted leading-snug">
          Delivery depends on your location. The owner will call you to confirm the delivery charge and the final payable amount.
        </p>

        {/* In-Card Checkout Button */}
        <Link
          href="/checkout"
          className="btn-primary w-full py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2 mt-2"
        >
          <span>PROCEED TO CHECKOUT</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-text-secondary text-[11px] pt-1">
        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-brand text-[20px]">verified</span>
          <span className="font-bold">100% Cotton</span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-brand text-[20px]">local_shipping</span>
          <span className="font-bold">COD Available</span>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-brand text-[20px]">sync</span>
          <span className="font-bold">No Returns on Prints</span>
        </div>
      </div>

      </aside>

      {/* Fixed Sticky Checkout Button (Floating at bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 shadow-2xl">
        <div className="container-app flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-text-muted font-bold uppercase">Items Total</p>
            <p className="font-black text-lg text-text-primary leading-none">₹{total}</p>
          </div>
          <Link
            href="/checkout"
            className="btn-primary py-3 px-7 text-xs font-black shadow-lg flex items-center gap-1.5"
          >
            <span>PLACE ORDER</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

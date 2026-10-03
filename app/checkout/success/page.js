'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    // The order creator already received the full order in the POST response; use that copy
    // (guests can't pass the ownership check on the GET endpoint without contact details).
    try {
      const cached = JSON.parse(sessionStorage.getItem('si_last_order') || 'null');
      if (cached?.orderNumber === orderNumber) {
        setOrder(cached);
        setLoading(false);
        return;
      }
    } catch (e) {
      // fall through to the API fetch
    }

    fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.order) {
          setOrder(data.order);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  function copyOrderId() {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="page-narrow px-4 py-6 pb-24 space-y-4">
      {/* 1. Celebration Banner */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 text-center shadow-soft space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-in zoom-in-75 duration-300">
          <span className="material-symbols-outlined text-emerald-600 text-[38px]">check_circle</span>
        </div>

        <div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
            Order Confirmed
          </span>
          <h1 className="font-heading font-black text-xl text-text-primary mt-2">
            THANK YOU FOR YOUR ORDER!
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
            {order?.guestContact?.name
              ? `Hey ${order.guestContact.name}, your streetwear drop has been queued in our printing unit!`
              : 'Your streetwear drop has been queued in our printing unit!'}
          </p>
        </div>

        {/* Order Number Badge */}
        {orderNumber && (
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-text-muted font-bold">Order ID:</span>
            <span className="font-mono font-black text-text-primary">#{orderNumber}</span>
            <button
              onClick={copyOrderId}
              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-0.5 ml-1"
              title="Copy Order ID"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Order Tracking Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3">
        <p className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-brand text-[18px]">local_shipping</span>
          Delivery charge to be confirmed by phone
        </p>

        {/* Stepper */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between text-[11px] font-bold relative">
            <div className="flex flex-col items-center gap-1 text-emerald-700 z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <span>Placed</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 -mt-4 mx-1"></div>

            <div className="flex flex-col items-center gap-1 text-slate-500 z-10">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">palette</span>
              </div>
              <span>Printing</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 -mt-4 mx-1"></div>

            <div className="flex flex-col items-center gap-1 text-slate-500 z-10">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              </div>
              <span>Shipped</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 -mt-4 mx-1"></div>

            <div className="flex flex-col items-center gap-1 text-slate-500 z-10">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">home</span>
              </div>
              <span>Delivered</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Items & Order Summary (if loaded) */}
      {order && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-soft space-y-3">
          <p className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">
            Order Receipt & Items
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-2.5 flex items-center gap-3">
                <div className="relative w-14 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-text-muted">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary line-clamp-1">{it.name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Size: <strong className="text-text-primary">{it.size}</strong> • Qty: {it.quantity}
                  </p>
                </div>
                <div className="font-black text-text-primary">
                  ₹{it.price * it.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Payment Details */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200/60">
            <div className="flex justify-between">
              <span className="text-text-muted">Payment Mode:</span>
              <span className="font-bold text-text-primary uppercase">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Delivery Address:</span>
              <span className="font-bold text-text-primary text-right max-w-[200px] truncate">
                {order.shippingAddress?.line1}, {order.shippingAddress?.city}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-black text-sm text-text-primary">
              <span>{order.shippingPending ? 'Items Total:' : 'Total Amount:'}</span>
              <span className="text-brand">₹{order.total}</span>
            </div>
            {order.shippingPending && (
              <p className="text-[11px] text-text-muted leading-snug">
                Delivery charge depends on your location. The owner will call you to confirm it and the final payable amount.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Track in My Account Button */}
        <Link
          href="/account"
          className="btn-primary w-full py-3.5 text-xs font-black shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          <span>VIEW & TRACK IN MY ORDERS</span>
        </Link>

        {/* Continue Shopping Button */}
        <Link
          href="/shop/tees"
          className="btn-outline w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">apparel</span>
          <span>Continue Shopping Fresh Drops</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-text-muted">Loading order details...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

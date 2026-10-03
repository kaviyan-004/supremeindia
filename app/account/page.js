'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setOrders(data.orders || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOrders([]);
    router.push('/account/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="px-4 py-20 text-center text-text-muted text-xs">
        Loading account details…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-subtle flex items-center justify-center">
          <span className="material-symbols-outlined text-brand text-[36px]">account_circle</span>
        </div>
        <div>
          <h1 className="font-heading font-black text-xl text-text-primary uppercase">
            MY ACCOUNT
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            Sign in to check your order tracking, delivery status, and saved addresses.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
          <Link href="/account/login" className="btn-primary text-xs py-3 font-bold">
            Sign In / Register →
          </Link>
          <Link href="/shop/tees" className="btn-outline text-xs py-2.5 font-bold">
            Browse Printed Drops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 pb-24">
      {/* Profile Card */}
      <div className="bg-white border border-borderDark rounded-2xl p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand text-white font-black text-lg flex items-center justify-center shadow-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-black text-base text-text-primary">
                {user.name}
              </h1>
              <p className="text-xs text-text-muted">{user.email}</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{user.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-brand hover:underline p-1"
          >
            Logout
          </button>
        </div>

        {user.role === 'admin' && (
          <div className="mt-4 pt-3 border-t border-borderDark flex items-center justify-between">
            <span className="text-xs font-bold text-brand flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              Store Owner Access
            </span>
            <Link
              href="/admin"
              className="bg-brand text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs"
            >
              Open Owner Dashboard →
            </Link>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-black text-sm text-text-primary uppercase tracking-wider">
            MY ORDERS ({orders.length})
          </h2>
          <Link href="/shop/tees" className="text-xs text-brand font-bold">
            + Shop More
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-borderDark rounded-2xl p-8 text-center space-y-2">
            <span className="material-symbols-outlined text-zinc-300 text-[40px]">inventory_2</span>
            <p className="font-bold text-xs text-text-primary">No orders placed yet</p>
            <p className="text-[11px] text-text-muted">
              Once you checkout with an oversized tee or hoodie, tracking will appear here!
            </p>
            <div className="pt-2">
              <Link href="/shop/tees" className="btn-primary inline-flex text-xs py-2 px-4 font-bold">
                Explore Graphic Tees
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id || order.orderNumber}
                className="bg-white border border-borderDark rounded-2xl p-4 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold">Order ID:</span>
                    <p className="font-mono font-bold text-xs text-text-primary">#{order.orderNumber}</p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                      order.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus || 'Placed'}
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5 text-xs text-text-secondary">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.name} ({it.size}) × {it.quantity}</span>
                      <span className="font-bold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-text-muted">{order.shippingPending ? 'Items total (delivery TBC): ' : 'Total: '}</span>
                    <span className="font-black text-sm text-text-primary">₹{order.total}</span>
                    <span className="text-[10px] text-text-muted ml-1 uppercase">
                      ({order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services Shortcuts */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
        <p className="font-bold text-text-primary uppercase text-[10px] tracking-wider">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/custom-print"
            className="p-3 bg-white border border-slate-200/80 rounded-xl font-bold text-text-primary hover:border-brand transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-brand text-[18px]">palette</span>
            <span>Custom Print</span>
          </Link>
          <Link
            href="/bulk-order"
            className="p-3 bg-white border border-slate-200/80 rounded-xl font-bold text-text-primary hover:border-brand transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">inventory_2</span>
            <span>Bulk Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

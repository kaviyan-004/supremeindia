'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  const DESKTOP_LINKS = [
    { label: 'Tees', href: '/shop/tees' },
    { label: 'Hoodies', href: '/shop/hoodies' },
    { label: 'Custom Print', href: '/custom-print' },
    { label: 'Bulk Orders', href: '/bulk-order' },
    { label: 'About', href: '/about' },
  ];

  // Prevent background body from scrolling while menu drawer is open
  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [menuOpen]);

  return (
    <>
      {/* Top Announcement Bar (The Souled Store Style) */}
      <aside aria-label="Offers & Announcement" className="bg-text-primary text-white text-[11px] font-semibold tracking-wide py-1.5 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="bg-brand text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">NEW</span>
          <span>FLAT ₹100 OFF on 1st Order • Code: <strong className="text-yellow-400 font-bold">SUPREME100</strong></span>
        </div>
      </aside>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderCol">
        <div className="container-app flex items-center justify-between px-4 lg:px-6 py-2.5 lg:py-3">
          {/* Left: Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-1 -ml-1 text-text-primary hover:text-brand transition-colors flex items-center justify-center active:scale-95"
            >
              <span className={`material-symbols-outlined text-[24px] ${menuOpen ? 'text-brand' : ''}`}>
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-black border border-brand/40 shadow-xs">
                <Image src="/logo-circle.png" alt="Supreme India Logo" fill sizes="32px" className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base tracking-tight leading-none text-text-primary">
                  SUPREME <span className="text-brand">INDIA</span>
                </span>
                <span className="text-[8px] font-bold tracking-widest text-text-muted uppercase">
                  Printed Tees & Hoodies
                </span>
              </div>
            </Link>

            {/* Desktop primary navigation (the mobile drawer / bottom nav take over below lg) */}
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 ml-6">
              {DESKTOP_LINKS.map((l) => {
                const active = pathname === l.href || pathname?.startsWith(l.href + '/');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-colors hover:text-brand hover:bg-slate-50 ${
                      active ? 'text-brand' : 'text-text-primary'
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Account & Cart */}
          <div className="flex items-center gap-0.5">
            {/* Desktop inline search */}
            <form action="/search" method="GET" role="search" className="hidden lg:flex relative items-center mr-2">
              <input
                type="text"
                name="q"
                placeholder="Search printed tees, hoodies…"
                aria-label="Search"
                className="w-64 xl:w-80 bg-slate-50 border border-borderCol rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-brand"
              />
              <span className="material-symbols-outlined absolute left-3 text-text-muted text-[20px]">search</span>
            </form>

            <button
              type="button"
              aria-label="Toggle Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="lg:hidden p-2 text-text-secondary hover:text-brand transition-colors flex items-center justify-center active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            <Link
              href="/account"
              aria-label="My Account"
              className="p-2 text-text-secondary hover:text-brand transition-colors flex items-center justify-center active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping Bag"
              className="relative p-2 text-text-secondary hover:text-brand transition-colors flex items-center justify-center active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="lg:hidden border-t border-borderCol bg-white px-4 py-2.5 shadow-sm">
            <form action="/search" method="GET" className="relative flex items-center">
              <input
                type="text"
                name="q"
                autoFocus
                placeholder="Search printed tees, anime drops, hoodies…"
                className="w-full bg-slate-50 border border-borderCol rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand"
              />
              <span className="material-symbols-outlined absolute left-3 text-text-muted text-[20px]">
                search
              </span>
            </form>
          </div>
        )}
      </header>

      {/* Fullscreen Mobile Navigation Drawer (Rendered OUTSIDE <header> to avoid backdrop-blur containment bug) */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex overscroll-contain" role="dialog" aria-modal="true">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity animate-in fade-in duration-200 touch-none"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sidebar Drawer */}
          <nav
            className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto overscroll-contain animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Branding & Close Button */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-brand/5 border border-brand/20">
                  <Image src="/logo.png" alt="Logo" fill sizes="28px" className="object-contain p-0.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-sm text-text-primary leading-tight">
                    SUPREME <span className="text-brand">INDIA</span>
                  </span>
                  <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
                    Official Streetwear
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-text-secondary active:scale-90 transition-transform"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1">
              {/* Special Promotion Pill */}
              <div className="bg-brand-subtle border border-brand/20 rounded-xl p-3">
                <p className="font-heading text-xs font-bold text-brand uppercase">Supreme Club Special</p>
                <p className="text-[11px] text-text-secondary mt-0.5">VIP pricing on select drops!</p>
              </div>

              {/* Main Categories */}
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-text-muted uppercase mb-2">Shop Categories</p>
                <div className="space-y-1">
                  <Link
                    href="/shop/tees"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs text-text-primary hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-brand">apparel</span>
                      Graphic & Oversized Tees
                    </span>
                    <span className="bg-brand text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">HOT</span>
                  </Link>

                  <Link
                    href="/shop/hoodies"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl font-bold text-xs text-text-primary hover:bg-slate-50 active:bg-slate-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-brand">layers</span>
                      Heavyweight Hoodies
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                  </Link>
                </div>
              </div>

              {/* Special Printing Services */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-extrabold tracking-widest text-text-muted uppercase mb-2">Printing Services</p>
                <div className="space-y-2">
                  <Link
                    href="/custom-print"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:border-brand transition-colors"
                  >
                    <p className="font-bold text-xs text-text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-brand">palette</span>
                      Custom Print Studio
                    </p>
                    <p className="text-[11px] text-text-muted mt-1">
                      Upload your artwork for single piece & custom batch printing.
                    </p>
                  </Link>

                  <Link
                    href="/bulk-order"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:border-brand transition-colors"
                  >
                    <p className="font-bold text-xs text-text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-brand">inventory_2</span>
                      Bulk & College Orders
                    </p>
                    <p className="text-[11px] text-text-muted mt-1">
                      Special wholesale rates for college fests, clubs, and startups.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Support & Account */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-medium text-text-secondary">
                <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 py-1.5 hover:text-brand">
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">person</span>
                  Track Orders & Account
                </Link>
                <Link href="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 py-1.5 hover:text-brand">
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">info</span>
                  About Supreme India
                </Link>
                <Link href="/policies/shipping" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 py-1.5 hover:text-brand">
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">local_shipping</span>
                  Shipping & Return Policy
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts } from '../lib/data';
import ProductCard from '../components/ProductCard';

// Always read the live catalog so admin price/product changes show without a rebuild
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getAllProducts();
  const tees = products.filter((p) => p.category === 'tees');
  const hoodies = products.filter((p) => p.category === 'hoodies');
  const bestsellers = products.filter((p) => p.tags?.includes('bestseller'));

  const CATEGORY_CIRCLES = [
    { label: 'All Drops', href: '#all', icon: 'bolt', bg: 'bg-brand/10 border-brand/30 text-brand' },
    { label: 'Oversized Tees', href: '/shop/tees', icon: 'apparel', bg: 'bg-amber-50 border-amber-200 text-amber-600' },
    { label: 'Hoodies', href: '/shop/hoodies', icon: 'layers', bg: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
    { label: 'Custom Print', href: '/custom-print', icon: 'palette', bg: 'bg-pink-50 border-pink-200 text-pink-600' },
    { label: 'Bulk Orders', href: '/bulk-order', icon: 'inventory_2', bg: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Category Stories Tray (With Google Material Icons) */}
      <section className="px-4 pt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 w-max py-1 lg:w-full lg:justify-center lg:gap-12">
          {CATEGORY_CIRCLES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div
                className={`w-14 h-14 rounded-full border-2 ${c.bg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
              >
                <span className="material-symbols-outlined text-[26px]">
                  {c.icon}
                </span>
              </div>
              <span className="text-[11px] font-bold text-text-secondary text-center leading-tight">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Hero Promotional Banner */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950 text-white p-5 lg:p-14 lg:flex lg:items-center lg:min-h-[340px] shadow-card">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 lg:w-96 lg:h-96 bg-brand/30 rounded-full blur-2xl" />
          <div className="absolute top-2 right-4 text-xs font-black tracking-widest text-brand uppercase bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">
            SEASON DROP
          </div>

          <div className="relative z-10 max-w-[260px] lg:max-w-xl">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 mb-1">
              100% Combed Heavy Cotton
            </p>
            <h1 className="font-heading font-black text-2xl lg:text-5xl leading-tight mb-2 lg:mb-4">
              OVERSIZED GRAPHIC TEES
            </h1>
            <p className="text-xs lg:text-base text-slate-300 mb-4 lg:mb-6 line-clamp-2">
              Drop-shoulder fits, aesthetic back prints & bold anime illustrations crafted for the culture.
            </p>
            <div className="flex items-center gap-2.5">
              <Link
                href="/shop/tees"
                className="btn-primary text-xs py-2.5 px-4 rounded-xl shadow-lg inline-flex"
              >
                Explore Drops →
              </Link>
              <span className="text-[11px] font-semibold text-slate-300">
                Starts ₹699
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Explore T-Shirts Model Photo-shoot Banner (The Souled Store Style) */}
      <section className="px-4">
        <div className="rounded-2xl overflow-hidden border border-borderDark bg-white shadow-soft">
          <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
            <div>
              <p className="font-heading font-black text-sm text-text-primary tracking-tight uppercase">
                EXPLORE T-SHIRTS
              </p>
              <p className="text-[10px] text-text-muted">Official merchandise, anime & streetwear</p>
            </div>
            <Link href="/shop/tees" className="text-xs font-bold text-brand hover:underline">
              View All →
            </Link>
          </div>

          <Link href="/shop/tees" className="block relative aspect-[1/1] lg:aspect-[16/7] w-full bg-slate-50">
            <Image
              src="/images/explore-tshirts-banner.png"
              alt="Explore T-Shirts Photo-shoot Collection"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-contain"
              priority
            />
          </Link>

          {/* Sub-category Tabs (From user reference) */}
          <div className="flex border-t border-neutral-100 text-xs font-bold text-center">
            <Link href="/shop/tees" className="flex-1 py-2.5 hover:text-brand hover:bg-neutral-50 border-r border-neutral-100">
              VESTS
            </Link>
            <Link href="/shop/tees" className="flex-1 py-2.5 hover:text-brand hover:bg-neutral-50 border-r border-neutral-100">
              REGULAR
            </Link>
            <Link href="/shop/tees" className="flex-1 py-2.5 text-brand font-black hover:bg-neutral-50">
              OVERSIZED
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Trending Graphic Printed Tees (2 Column Mobile Grid) */}
      <section className="px-4" id="all">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading font-black text-base text-text-primary tracking-tight">
              TRENDING PRINTED TEES
            </h2>
            <p className="text-[11px] text-text-muted">High-density prints on 240 GSM cotton</p>
          </div>
          <Link
            href="/shop/tees"
            className="text-xs font-bold text-brand hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tees.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Custom Print Studio Highlight Banner */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-brand text-white p-5 shadow-md">
          <div className="relative z-10 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                STUDIO SERVICE
              </span>
              <span className="text-[11px] text-white/90">Single Piece or Batches</span>
            </div>
            <h2 className="font-heading font-black text-lg leading-tight mb-1">
              PRINT YOUR OWN DESIGN
            </h2>
            <p className="text-xs text-white/90 mb-4 max-w-xs">
              Upload your personal artwork, logo or meme. We print on premium 240 GSM tees & 320 GSM hoodies!
            </p>
            <Link
              href="/custom-print"
              className="bg-white text-brand font-black text-xs py-2.5 px-4 rounded-xl text-center shadow-md active:scale-95 transition-transform self-start flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">palette</span>
              <span>Upload Artwork Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Heavyweight Hoodies Section */}
      {hoodies.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-heading font-black text-base text-text-primary tracking-tight">
                HEAVYWEIGHT HOODIES
              </h2>
              <p className="text-[11px] text-text-muted">320 GSM brushed fleece pullovers</p>
            </div>
            <Link
              href="/shop/hoodies"
              className="text-xs font-bold text-brand hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {hoodies.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Community Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-heading font-black text-base text-text-primary tracking-tight">
                COMMUNITY BESTSELLERS
              </h2>
              <p className="text-[11px] text-text-muted">Top-rated streetwear drops</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Bulk Orders for Colleges & Events */}
      <section className="px-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              COLLEGE SPECIAL
            </span>
            <p className="font-heading font-black text-sm text-text-primary mt-1">
              BULK MERCH FOR FESTS & CLUBS
            </p>
            <p className="text-[11px] text-text-muted">
              Wholesale pricing with custom embroidery & screen printing.
            </p>
          </div>
          <Link
            href="/bulk-order"
            className="btn-secondary text-xs px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1"
          >
            <span>Enquire</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

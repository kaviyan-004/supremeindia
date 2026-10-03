import Link from 'next/link';
import { getAllProducts } from '../../lib/data';
import ProductCard from '../../components/ProductCard';

// Always read the live catalog so admin price/product changes show without a rebuild
export const dynamic = 'force-dynamic';

export default async function ShopIndexPage() {
  const products = await getAllProducts();

  return (
    <div className="px-4 py-4 space-y-4 pb-20">
      {/* Category Header */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-brand text-[24px]">
            shopping_bag
          </span>
          <h1 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
            All Streetwear Drops
          </h1>
        </div>
        <p className="text-xs text-text-muted">
          High-density printed graphic tees & heavyweight 320 GSM winter hoodies.
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-brand">
          <span>{products.length} Drops Available</span>
          <span>•</span>
          <span>Cash on Delivery</span>
        </div>
      </div>

      {/* Filter Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <Link
          href="/shop"
          className="chip chip-active flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          <span>All Drops</span>
        </Link>
        <Link
          href="/shop/tees"
          className="chip flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">apparel</span>
          <span>Printed Tees</span>
        </Link>
        <Link
          href="/shop/hoodies"
          className="chip flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">layers</span>
          <span>Hoodies</span>
        </Link>
        <Link
          href="/custom-print"
          className="chip flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">palette</span>
          <span>Custom Print</span>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

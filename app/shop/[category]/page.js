import Link from 'next/link';
import { getAllProducts } from '../../../lib/data';
import ProductCard from '../../../components/ProductCard';

const LABELS = {
  tees: 'Printed T-Shirts',
  hoodies: 'Heavyweight Hoodies',
};

const DESCRIPTIONS = {
  tees: 'High-density graphic prints, oversized fits, and 240 GSM combed cotton.',
  hoodies: '320 GSM warm brushed fleece pullovers with aesthetic back typography.',
};

export default async function CategoryPage({ params }) {
  const { category } = params;
  const products = await getAllProducts({ category });
  const label = LABELS[category] || 'Collection';
  const description = DESCRIPTIONS[category] || 'Explore the latest printed streetwear drops.';

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Category Header */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-brand text-[24px]">
            {category === 'hoodies' ? 'layers' : 'apparel'}
          </span>
          <h1 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
            {label}
          </h1>
        </div>
        <p className="text-xs text-text-muted">{description}</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-brand">
          <span>{products.length} Designs Available</span>
          <span>•</span>
          <span>Cash on Delivery</span>
        </div>
      </div>

      {/* Filter Switcher Tabs with Google Material Icons */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <Link
          href="/shop/tees"
          className={`chip flex items-center gap-1.5 ${category === 'tees' ? 'chip-active' : ''}`}
        >
          <span className="material-symbols-outlined text-[16px]">apparel</span>
          <span>Printed Tees</span>
        </Link>
        <Link
          href="/shop/hoodies"
          className={`chip flex items-center gap-1.5 ${category === 'hoodies' ? 'chip-active' : ''}`}
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
      {products.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-zinc-400 text-[32px]">inventory_2</span>
          </div>
          <p className="font-bold text-sm text-text-primary">No drops in this category yet</p>
          <p className="text-xs text-text-muted mt-1 mb-4">Fresh graphics are in the printing press.</p>
          <Link href="/shop/tees" className="btn-primary inline-flex text-xs py-2 px-4">
            Browse Printed Tees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

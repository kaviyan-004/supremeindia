import Link from 'next/link';
import { getAllProducts } from '../../lib/data';
import ProductCard from '../../components/ProductCard';

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').toLowerCase();
  const all = await getAllProducts();
  const results = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const POPULAR_SEARCHES = ['Oversized', 'Spiderverse', 'Hoodie', 'Samurai', 'Vintage', 'Printed'];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search Input Box */}
      <form className="relative" action="/search" method="GET" role="search">
        <input
          name="q"
          defaultValue={q}
          autoFocus={!q}
          placeholder="Search printed tees, anime, hoodies…"
          className="input pl-10 pr-4 py-3 text-xs"
        />
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-text-muted text-[20px]">
          search
        </span>
        <button type="submit" className="sr-only">Search</button>
      </form>

      {/* Suggested Search Pills */}
      {!q && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Popular Searches
          </p>
          <div className="flex gap-2 flex-wrap">
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="chip hover:border-brand transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {q && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted">
              Found <strong className="text-text-primary">{results.length}</strong> drops for "{q}"
            </p>
            {results.length > 0 && (
              <Link href="/search" className="text-xs text-brand font-bold">
                Clear
              </Link>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-zinc-400 text-[40px] mb-2 block">
                search_off
              </span>
              <p className="font-bold text-sm text-text-primary">No drops matched your search</p>
              <p className="text-xs text-text-muted mt-1 mb-4">Try searching for "Oversized", "Tee", or "Hoodie"</p>
              <Link href="/shop/tees" className="btn-primary inline-flex text-xs py-2 px-4">
                Explore All Tees
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const onSale = product.mrp && product.mrp > product.price;
  const discountPercent = onSale ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between">
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-slate-50 overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs bg-slate-100">
            Image Preview
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.badgeText ? (
            <span className="bg-text-primary/90 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider">
              {product.badgeText}
            </span>
          ) : product.tags?.includes('bestseller') ? (
            <span className="bg-brand text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-xs tracking-wider">
              BESTSELLER
            </span>
          ) : null}
        </div>

        {/* Wishlist Button (Google Material Icon) */}
        <button
          type="button"
          aria-label="Wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted(!wishlisted);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs z-10 active:scale-90 transition-transform"
        >
          <span
            className={`material-symbols-outlined text-[17px] leading-none transition-colors ${
              wishlisted ? 'text-brand' : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Ratings hidden until the client supplies approved reviews. */}
      </Link>

      {/* Product Details Section */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {product.subCategory || (product.category === 'hoodies' ? 'Hoodie' : 'T-Shirt')}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h2 className="font-bold text-xs text-text-primary line-clamp-1 mt-0.5 hover:text-brand transition-colors">
              {product.name}
            </h2>
          </Link>
        </div>

        {/* Pricing */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-black text-sm text-text-primary">
              ₹{product.price}
            </span>
            {onSale && (
              <>
                <span className="text-text-muted text-xs line-through">
                  ₹{product.mrp}
                </span>
                <span className="text-brand font-extrabold text-[11px]">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Club price: only shown when a member price is explicitly set on the product */}
          {product.memberPrice > 0 && product.memberPrice < product.price && (
            <div className="mt-1.5 bg-brand-subtle border border-brand/20 rounded-md px-2 py-0.5 text-[10px] font-semibold text-brand flex items-center justify-between">
              <span>₹{product.memberPrice} for Club</span>
              <span className="text-[9px] font-bold uppercase bg-brand text-white px-1 rounded">VIP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../lib/data';
import AddToCartBar from './AddToCartBar';
import ProductGallery from './ProductGallery';

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const onSale = product.mrp && product.mrp > product.price;
  const discountPercent = onSale ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="pb-8 lg:grid lg:grid-cols-2 lg:gap-10 lg:px-6 lg:pt-6 lg:pb-12 lg:items-start">
      {/* 1. Image Gallery with clean rounded frame */}
      <div className="relative bg-slate-50 border-b border-slate-100 overflow-hidden lg:border lg:rounded-2xl lg:sticky lg:top-24">
        <ProductGallery images={product.images} name={product.name} />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.badgeText && (
            <span className="bg-text-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
              {product.badgeText}
            </span>
          )}
        </div>
      </div>

      {/* 2. Product Information Block */}
      <div className="px-4 pt-4 space-y-4 lg:px-0 lg:pt-0">
        {/* Title & Category */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            {product.subCategory || (product.category === 'hoodies' ? 'Heavyweight Hoodie' : 'Printed Oversized Tee')}
          </p>
          <h1 className="font-heading font-black text-lg text-text-primary mt-0.5">
            {product.name}
          </h1>

          {/* Ratings/reviews intentionally hidden until the client supplies approved reviews. */}
        </div>

        {/* Pricing Block */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-primary">
              ₹{product.price}
            </span>
            {onSale && (
              <>
                <span className="text-text-muted line-through text-sm">
                  ₹{product.mrp}
                </span>
                <span className="text-brand font-black text-sm">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">Inclusive of all taxes</p>

          {/* Club price: only shown when a member price is explicitly set on the product */}
          {product.memberPrice > 0 && product.memberPrice < product.price && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <span className="bg-brand text-white text-[9px] font-black px-1.5 py-0.5 rounded">CLUB</span>
              <span>₹{product.memberPrice} for Club Members</span>
            </div>
          )}
        </div>

        {/* 3. Add to Cart & Size Selection Bar */}
        <AddToCartBar product={product} />

        {/* 4. Special Offers & Coupons (The Souled Store Style) */}
        <div className="border border-brand/20 bg-brand-subtle rounded-2xl p-3.5 space-y-2">
          <p className="font-bold text-xs text-text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-brand text-[18px]">local_offer</span>
            Available Offers
          </p>
          <div className="text-[11px] text-text-secondary space-y-1.5 pl-5 list-disc">
            <p>• <strong>SUPREME100:</strong> Flat ₹100 off on your first order above ₹699.</p>
          </div>
        </div>

        {/* 5. Product Specifications Accordions */}
        <div className="border-t border-slate-100 divide-y divide-slate-100 text-xs">
          <details className="py-3 group" open>
            <summary className="font-bold text-text-primary flex justify-between items-center cursor-pointer list-none">
              <span>Fabric & Fit Details</span>
              <span className="group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-2 text-text-secondary space-y-1 pl-1">
              <p>• <strong>Fabric:</strong> {product.fabric || '100% Combed Heavy Cotton'}</p>
              <p>• <strong>Fit:</strong> {product.fit || 'Drop Shoulder Oversized Fit'}</p>
              <p>• <strong>Print:</strong> High-density, fade-resistant DTF & screen print</p>
              <p>• <strong>Wash Care:</strong> Machine wash cold, do not iron directly on print</p>
            </div>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-text-primary flex justify-between items-center cursor-pointer list-none">
              <span>Product Description</span>
              <span className="group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <p className="mt-2 text-text-secondary pl-1 leading-relaxed">
              {product.description}
            </p>
          </details>

          <details className="py-3 group">
            <summary className="font-bold text-text-primary flex justify-between items-center cursor-pointer list-none">
              <span>Delivery & Returns</span>
              <span className="group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-2 text-text-secondary space-y-1 pl-1">
              <p>• Cash on Delivery only. The delivery charge depends on your location and is confirmed by the owner by phone.</p>
              <p>• Printed products cannot be returned or refunded.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

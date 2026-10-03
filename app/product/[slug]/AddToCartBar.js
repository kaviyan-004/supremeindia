'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../components/CartContext';

export default function AddToCartBar({ product }) {
  const [selectedSize, setSelectedSize] = useState('M'); // default to popular size M
  const [error, setError] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  function buildItem() {
    return {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || '',
      size: selectedSize,
      color: product.colors?.[0]?.name || 'Original',
      price: product.price,
      quantity: 1,
    };
  }

  function handleAdd() {
    if (!selectedSize) {
      setError('Please select a size first');
      return;
    }
    addItem(buildItem());
    setError('');
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  }

  function handleBuyNow() {
    if (!selectedSize) {
      setError('Please select a size first');
      return;
    }
    addItem(buildItem());
    router.push('/cart');
  }

  return (
    <div className="space-y-4">
      {/* Size Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Select Size
          </span>
          {/* Size Guide link intentionally omitted until the client supplies the real size chart. */}
        </div>

        {error && (
          <p className="text-xs text-brand font-bold mb-2">
            {error}
          </p>
        )}

        <div className="flex gap-2.5 flex-wrap">
          {(product.sizes || [{ size: 'S' }, { size: 'M' }, { size: 'L' }, { size: 'XL' }]).map((s) => {
            const isSelected = selectedSize === s.size;
            const isOutOfStock = s.stock === 0;

            return (
              <button
                key={s.size}
                type="button"
                onClick={() => {
                  if (!isOutOfStock) {
                    setSelectedSize(s.size);
                    setError('');
                  }
                }}
                disabled={isOutOfStock}
                className={`w-12 h-12 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-brand text-white shadow-md scale-105 border-2 border-brand'
                    : 'bg-white border-2 border-slate-200 text-text-primary hover:border-slate-300'
                } ${isOutOfStock ? 'opacity-30 cursor-not-allowed line-through' : 'active:scale-95'}`}
              >
                <span>{s.size}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Fixed to bottom, above bottom dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-float lg:static lg:z-auto lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:p-0 lg:shadow-none">
        <div className="container-app flex items-center gap-3 lg:max-w-none">
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-text-primary font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>{addedAnimation ? 'Added to Bag! ✓' : 'ADD TO BAG'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 btn-primary py-3 px-4 text-xs font-black flex items-center justify-center gap-1.5"
          >
            <span>BUY NOW</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

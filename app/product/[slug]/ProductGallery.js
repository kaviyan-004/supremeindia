'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, name }) {
  const list = images?.length ? images : [''];
  const [current, setCurrent] = useState(0);
  const scroller = useRef(null);

  function handleScroll() {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrent(Math.min(list.length - 1, Math.max(0, idx)));
  }

  function go(dir) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: (current + dir) * el.clientWidth, behavior: 'smooth' });
  }

  return (
    <>
      <div
        ref={scroller}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {list.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full flex-shrink-0 snap-center aspect-[3/4] bg-slate-100"
          >
            {img ? (
              <Image
                src={img}
                alt={name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority={idx === 0}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                No preview available
              </div>
            )}
          </div>
        ))}
      </div>

      {images?.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            disabled={current === 0}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md items-center justify-center text-text-primary hover:text-brand disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            disabled={current === images.length - 1}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md items-center justify-center text-text-primary hover:text-brand disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>
        </>
      )}

      {images?.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
          {current + 1} / {images.length}
        </div>
      )}
    </>
  );
}

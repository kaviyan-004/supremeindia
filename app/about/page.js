import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="page-narrow px-4 py-6 space-y-6">
      <div className="bg-brand-subtle border border-brand/20 rounded-2xl p-5 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-brand text-[32px]">apparel</span>
        </div>
        <h1 className="font-heading font-black text-xl text-text-primary">
          ABOUT SUPREME INDIA
        </h1>
        <p className="text-xs text-brand font-bold mt-1">
          Printed Graphic Tees & Heavyweight Hoodies
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-soft space-y-4 text-xs leading-relaxed text-text-secondary">
        <h2 className="font-heading font-black text-sm text-text-primary">
          OUR STORY
        </h2>
        <p>
          Supreme India was born out of a simple love for high-quality streetwear that doesn't cost a fortune. As college students and creators, we were tired of thin, faded graphic tees that shrink after two washes.
        </p>
        <p>
          We set out to build an authentic clothing brand dedicated exclusively to <strong>printed oversized graphic tees</strong> and <strong>heavyweight hoodies</strong> that feel heavy, premium, and durable.
        </p>

        <h2 className="font-heading font-black text-sm text-text-primary pt-2">
          WHAT MAKES US DIFFERENT
        </h2>
        <div className="space-y-2.5">
          <div className="flex gap-2.5 items-start">
            <span className="material-symbols-outlined text-brand text-[18px] flex-shrink-0">check_circle</span>
            <div>
              <p className="font-bold text-text-primary">240+ GSM Combed Cotton:</p>
              <p className="text-[11px] text-text-muted">Heavy, structured drape that holds its boxy streetwear silhouette.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="material-symbols-outlined text-brand text-[18px] flex-shrink-0">check_circle</span>
            <div>
              <p className="font-bold text-text-primary">Fade-Resistant High-Density Prints:</p>
              <p className="text-[11px] text-text-muted">Crafted with state-of-the-art DTF & screen print inks.</p>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="material-symbols-outlined text-brand text-[18px] flex-shrink-0">check_circle</span>
            <div>
              <p className="font-bold text-text-primary">Custom Studio & Bulk Merch:</p>
              <p className="text-[11px] text-text-muted">Single-piece custom printing and wholesale fest merch for colleges.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <Link href="/shop/tees" className="btn-primary flex-1 text-xs py-2.5">
            Explore Tees
          </Link>
          <Link href="/custom-print" className="btn-outline flex-1 text-xs py-2.5">
            Custom Print
          </Link>
        </div>
      </div>
    </div>
  );
}

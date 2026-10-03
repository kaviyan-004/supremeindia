import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-borderCol bg-white mt-10 pt-8 pb-28 lg:pb-10 px-4 text-xs text-text-secondary">
      <div className="container-app px-0">
        {/* Trust Badges with Google Material Symbols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="material-symbols-outlined text-brand text-[24px]">verified</span>
            <div>
              <p className="font-bold text-text-primary text-[11px]">100% Genuine Quality</p>
              <p className="text-[10px] text-text-muted">240+ GSM Combed Cotton</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="material-symbols-outlined text-brand text-[24px]">assignment_return</span>
            <div>
              <p className="font-bold text-text-primary text-[11px]">No Returns on Prints</p>
              <p className="text-[10px] text-text-muted">Printed items are non-refundable</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="material-symbols-outlined text-brand text-[24px]">local_shipping</span>
            <div>
              <p className="font-bold text-text-primary text-[11px]">Cash on Delivery</p>
              <p className="text-[10px] text-text-muted">Delivery charge confirmed by phone</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="material-symbols-outlined text-brand text-[24px]">workspace_premium</span>
            <div>
              <p className="font-bold text-text-primary text-[11px]">Direct From Factory</p>
              <p className="text-[10px] text-text-muted">Crafted for the culture</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 lg:flex lg:gap-32">
          <div>
            <p className="text-text-primary font-bold text-xs uppercase tracking-wider mb-2.5">
              Categories
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/tees" className="hover:text-brand transition-colors">
                  Printed T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop/hoodies" className="hover:text-brand transition-colors">
                  Heavyweight Hoodies
                </Link>
              </li>
              <li>
                <Link href="/custom-print" className="hover:text-brand transition-colors">
                  Custom Print Studio
                </Link>
              </li>
              <li>
                <Link href="/bulk-order" className="hover:text-brand transition-colors">
                  College & Bulk Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-text-primary font-bold text-xs uppercase tracking-wider mb-2.5">
              Customer Support
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/policies/shipping" className="hover:text-brand transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-brand transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-brand transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="font-heading font-black text-sm text-text-primary tracking-tight">
            SUPREME <span className="text-brand">INDIA</span>
          </p>
          <p className="text-[11px] text-text-muted mt-1 max-w-xs mx-auto">
            Independent streetwear & apparel brand specializing in premium printed tees and heavyweight hoodies.
          </p>
          <p className="mt-4 text-[10px] text-text-light">
            © {new Date().getFullYear()} Supreme India Apparel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

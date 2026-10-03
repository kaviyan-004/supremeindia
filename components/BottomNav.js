'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Hide bottom nav on product details, cart, checkout wizard, and admin portal
  // so action buttons (Place Order, Add to Bag, Payment) are completely unobstructed
  if (
    pathname?.startsWith('/product/') ||
    pathname === '/cart' ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: 'home',
    },
    {
      label: 'Tees',
      href: '/shop/tees',
      icon: 'apparel',
    },
    {
      label: 'Hoodies',
      href: '/shop/hoodies',
      icon: 'layers',
    },
    {
      label: 'Custom',
      href: '/custom-print',
      icon: 'palette',
    },
    {
      label: 'Bag',
      href: '/cart',
      icon: 'shopping_bag',
      badge: itemCount,
    },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-borderCol/80">
      <div className="mx-auto w-full max-w-xl flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
                isActive ? 'text-brand font-bold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <div className="relative h-6 flex items-center justify-center">
                <span
                  className={`material-symbols-outlined transition-transform ${
                    isActive ? 'font-bold scale-110 text-brand' : 'text-zinc-600'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
                >
                  {item.icon}
                </span>
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-brand text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-brand' : 'font-medium text-zinc-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'si_cart_v1';
const COUPON_KEY = 'si_coupon_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      setCouponCode(localStorage.getItem(COUPON_KEY) || '');
    } catch (e) {
      // ignore — start with empty cart if storage is unavailable/corrupt
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(COUPON_KEY, couponCode);
    } catch (e) {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [items, couponCode, hydrated]);

  function addItem(newItem) {
    setItems((prev) => {
      const key = (i) => `${i.productId}-${i.size}-${i.color}`;
      const existing = prev.find((i) => key(i) === key(newItem));
      if (existing) {
        return prev.map((i) =>
          key(i) === key(newItem) ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
  }

  function updateQuantity(productId, size, color, quantity) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId, size, color) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
    );
  }

  function clearCart() {
    setItems([]);
    setCouponCode('');
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        couponCode,
        setCouponCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

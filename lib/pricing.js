// Shared pricing rules. Pure functions (no Node/DB imports) so the cart UI and the
// order API compute totals identically. The server never trusts browser-supplied totals.
//
// Delivery charge: it depends on the customer's location and is confirmed by the owner by phone
// after the order is placed, so no delivery fee is calculated or stored here. `total` is the
// ITEMS total (subtotal minus any coupon discount); the final payable amount is confirmed separately.

const COUPONS = {
  SUPREME100: { minSubtotal: 699, amount: 100 },
};

export function normalizeCoupon(code) {
  return String(code || '').trim().toUpperCase();
}

// Returns { valid, discount, message }
export function evaluateCoupon(code, subtotal) {
  const key = normalizeCoupon(code);
  if (!key) return { valid: false, discount: 0, message: '' };
  const rule = COUPONS[key];
  if (!rule) return { valid: false, discount: 0, message: 'Invalid coupon code. Try "SUPREME100"' };
  if (subtotal < rule.minSubtotal) {
    return {
      valid: false,
      discount: 0,
      message: 'Add items worth ₹' + (rule.minSubtotal - subtotal) + ' more to use ' + key,
    };
  }
  return { valid: true, discount: Math.min(rule.amount, subtotal), message: `Coupon ${key} applied! You saved ₹${rule.amount}` };
}

export function computeTotals({ subtotal, couponCode }) {
  const coupon = evaluateCoupon(couponCode, subtotal);
  const discount = coupon.valid ? coupon.discount : 0;
  return {
    discount,
    couponCode: coupon.valid ? normalizeCoupon(couponCode) : '',
    total: Math.max(0, subtotal - discount),
  };
}

# App Flow Document
## Supreme India (SI)

**Version:** 1.0 · **Date:** September 14, 2026

---

## 1. Site Map

```
Home (/)
├─ Shop
│  ├─ /shop/tees
│  ├─ /shop/hoodies
│  ├─ /shop/caps
│  ├─ /shop/joggers
│  └─ /shop/jackets
├─ /product/[slug]              (Product Detail Page)
├─ /cart
├─ /checkout
│  └─ /checkout/success
├─ /custom-print                (Custom Design Order flow)
│  └─ /custom-print/status/[id]
├─ /bulk-order                  (Bulk Order intake form)
├─ /account
│  ├─ /account/orders
│  ├─ /account/orders/[id]
│  ├─ /account/wishlist
│  └─ /account/addresses
├─ /login, /signup
├─ /search?q=
├─ /about
└─ /policies (shipping, returns, terms, privacy)
```

## 2. Primary User Journeys

### 2.1 Standard Purchase Journey
1. User lands on **Home** → browses hero banner / New Arrivals / Bestsellers, or taps a category chip.
2. User lands on a **Category page** → applies filters (size/price/color) → taps a product card.
3. **Product Detail Page** → views images, selects color + size → taps **Add to Cart** (toast confirms) or **Buy Now** (skips to cart directly).
4. **Cart** → reviews items, applies coupon → taps **Proceed to Checkout**.
5. **Checkout Step 1** → enters/selects shipping address, pincode validated for serviceability.
6. **Checkout Step 2** → reviews order summary (items, shipping, total).
7. **Checkout Step 3** → taps **Pay Now** → Razorpay checkout sheet opens → completes payment.
8. Redirect to **Order Confirmation** → order ID shown, confirmation email/SMS sent.
9. User can view the order anytime under **Account → Orders**.

*Guest users can complete this entire flow without an account; account creation is offered but not required at checkout.*

### 2.2 Custom Design Order Journey
1. User taps **"Get Your Own Design Printed"** from Home banner or main nav.
2. **Step 1 – Garment:** choose product type (tee/hoodie/etc.), color, size.
3. **Step 2 – Design:** upload an image file and/or type a description; choose print placement (front/back/sleeve).
4. **Step 3 – Contact:** name, phone, email, optional notes.
5. Submits → confirmation screen with a **reference ID** and message that SI's team will confirm pricing & timeline within 24 hours.
6. SI's team reviews the submission (via admin dashboard/email), sets a price, and contacts the customer to confirm.
7. Once confirmed, an order record is created and the customer can track status (submitted → in review → quoted → approved → in production → shipped) at `/custom-print/status/[id]`.
8. Payment for custom orders is collected once quoted/approved (a payment link or a checkout step is triggered at that stage).

*This flow is intentionally decoupled from the standard cart, since pricing isn't fixed until SI reviews the request.*

### 2.3 Bulk Order Journey
1. User taps **"Bulk Orders for Colleges & Events"** from Home banner or nav/footer.
2. Fills a single-page form: organization/contact details, product(s) with quantity per size (can add multiple rows), expected delivery date, optional budget/notes.
3. Submits → confirmation screen: "Our team will reach out within 24–48 hours."
4. Submission is routed to SI's team (email notification + saved in the admin dashboard) for manual quoting and follow-up — not processed through standard checkout.

### 2.4 Account & Auth Journey
1. User taps **Login/Signup** (from nav or prompted at checkout).
2. Chooses email or phone-OTP method.
3. On success, redirected back to where they were (cart/checkout/account).
4. From **Account**, user can view order history, track a specific order, manage wishlist, and manage saved addresses.

### 2.5 Search Journey
1. User taps the search icon → search bar with autocomplete suggestions as they type.
2. Submits → **Search results page** (same layout as a category listing, with filters).

## 3. Navigation Structure (mobile)
- **Top bar:** logo, search icon, cart icon (badge count), menu (hamburger).
- **Hamburger menu:** Shop (expandable by category), Custom Print, Bulk Orders, About, Account/Login, Policies, socials.
- **Bottom of PDP/Cart:** sticky action bar for primary CTA (Add to Cart / Proceed to Checkout).
- No persistent bottom tab bar is assumed for v1 (kept to a top-nav + hamburger pattern, matching typical mobile e-commerce like TheSouledStore); can be revisited if usage data suggests a bottom nav would help.

## 4. Error & Edge States
- Empty cart → CTA back to Shop.
- Out-of-stock size → disabled pill + "Notify me" option (future enhancement).
- Payment failure → return to Checkout Step 3 with a retry option; order remains in "payment pending" state.
- Pincode not serviceable → inline message at address step, checkout blocked until a valid address is entered.
- Custom-print upload failure (file too large/wrong type) → inline validation before submission.

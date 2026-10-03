# Implementation Plan
## Supreme India (SI)

**Version:** 1.0 · **Date:** September 14, 2026

---

## 1. Reality Check on Scope

A full production e-commerce platform — real Razorpay payments, order fulfillment, admin tooling, auth, reviews, custom-order operations — is realistically a multi-week build, not a single day, even with AI-assisted development. Payment go-live alone depends on SI completing Razorpay's business KYC, which is outside this project's control.

What's achievable **today** is a strong, working foundation: a mobile-first Next.js codebase with the real page structure, working cart logic, a catalog wired to MongoDB, and a checkout flow built against Razorpay's test mode — something demo-ready and directly extensible, not a throwaway mockup.

## 2. Phased Plan

### Phase 0 — Today (this delivery)
- Project scaffold: Next.js 14 (App Router) + Tailwind, configured with SI's brand colors/type.
- MongoDB models per the Backend Schema doc (`products`, `orders`, `customOrders`, `bulkOrders`).
- Pages: Home, Category/Shop listing, Product Detail, Cart, Checkout (test-mode Razorpay), Custom Print request form, Bulk Order form.
- Cart logic via React Context (add/remove/update quantity, persisted in `localStorage`).
- API routes: list/get products, create order, create custom-order request, create bulk-order request, create Razorpay order (test mode).
- Seed script with sample products so the site is browsable immediately.
- All UI mobile-first per the Design Doc.

**Explicitly out of scope for today** (flagged, not silently skipped):
- Live Razorpay payments (needs SI's real API keys post-KYC).
- User authentication / account system (login, order history, wishlist persistence).
- Admin dashboard for managing products, custom-order quoting, and bulk-order follow-up (today, new custom/bulk submissions land in MongoDB and can be viewed directly in Atlas; a proper admin UI is Phase 2).
- Real product photography (placeholders used until Kaviyan supplies final images).
- Shipping/logistics integration.
- Reviews system UI (schema exists; UI is Phase 2).
- SMS/email order confirmations.

### Phase 1 — Before Public Launch
- Swap Razorpay test keys for live keys once SI's account is verified.
- Replace placeholder product images with real photography.
- Basic auth (email/phone OTP) + account pages (orders, wishlist, addresses).
- Email/SMS order confirmations (e.g., via Resend/SendGrid + an SMS provider).
- Pincode serviceability check wired to a real logistics partner or a static serviceable-pincode list.
- Deploy to Vercel + MongoDB Atlas with a custom domain.

### Phase 2 — Post-Launch Enhancements
- Admin dashboard: manage products/stock, review and quote custom orders, respond to bulk inquiries, view/update order statuses.
- Reviews & ratings UI on PDP.
- Coupon management UI.
- Wishlist sync across devices (tied to account).
- Search improvements (autocomplete, fuzzy matching).
- Analytics (conversion tracking, funnel drop-off) to inform the metrics in the PRD.

### Phase 3 — Growth Features
- "Notify me when back in stock."
- Limited-drop countdown timers for exclusive releases.
- Referral/loyalty program.
- Shipping API integration for real-time tracking.

## 3. Today's Build Order
1. Scaffold project (Next.js + Tailwind config with SI tokens).
2. Data layer: MongoDB connection + Mongoose models.
3. Seed sample product data.
4. Build Home, Category, and Product Detail pages against seeded data.
5. Build Cart (context + UI).
6. Build Checkout UI + Razorpay test-mode order creation API.
7. Build Custom Print and Bulk Order forms + their API routes.
8. Final pass: mobile responsiveness check, package and deliver.

## 4. Handoff Notes
- The codebase is delivered with a `README.md` covering setup (env vars, `npm install`, `npm run dev`, seeding the database).
- All secrets (MongoDB URI, Razorpay keys) are left as placeholders in `.env.example` — Kaviyan supplies real values.
- Once real product photography and copy are ready, they replace the seeded placeholder data via the same `products` collection — no schema changes needed.

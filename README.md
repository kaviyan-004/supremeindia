# Supreme India (SI) — Website

Mobile-first e-commerce site for Supreme India, a streetwear clothing brand. Built with Next.js 14, Tailwind CSS, MongoDB, and Razorpay.

See the `docs/` folder for the full documentation set: PRD, Design Doc, Tech Stack, App Flow, Backend Schema, and Implementation Plan.

## What's included in this build (Phase 0)

- Mobile-first storefront: home, category listing, product detail, cart, checkout (Razorpay test mode).
- Custom design print request flow (with image upload).
- Bulk order enquiry flow.
- MongoDB models for products, orders, custom orders, and bulk orders.
- 8 sample products pre-loaded (seeded from your reference images) so the site is browsable immediately, even before a database is connected.

**Not included yet** — see `docs/06-Implementation-Plan.md` for the full phased plan:
- Live payments (needs your real Razorpay keys after KYC — test mode works out of the box).
- User accounts/login, order history, wishlist persistence.
- Admin dashboard (today, custom/bulk submissions land straight in MongoDB — view them in Atlas).
- Real product photography (placeholders used from the reference images you shared).

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in:
- `MONGODB_URI` — a MongoDB Atlas connection string (free tier is fine to start: https://www.mongodb.com/cloud/atlas/register)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — generate **test mode** keys from the Razorpay dashboard (no business KYC required for test mode): https://dashboard.razorpay.com/app/keys
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as `RAZORPAY_KEY_ID`

**Note:** the site works even without `MONGODB_URI` set — it falls back to the bundled sample product data (`lib/sampleProducts.json`) so you can preview the UI immediately. Checkout still requires Razorpay test keys to fully complete a payment.

### 3. Seed the database (optional, once MONGODB_URI is set)
```bash
npm run seed
```
This loads the 8 sample products into your MongoDB `products` collection. Edit `lib/sampleProducts.json` or use MongoDB Atlas directly to add your real catalog.

### 4. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000 — resize your browser or open dev tools device mode to see the mobile-first layout (it's designed for ~360–420px width first).

### 5. Testing Razorpay checkout
Use Razorpay's test card numbers (e.g., `4111 1111 1111 1111`, any future expiry, any CVV) — see https://razorpay.com/docs/payments/payments/test-card-upi-details/

## Deploying
1. Push this project to a GitHub repository.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the same environment variables in the Vercel project settings.
4. In MongoDB Atlas, allow network access from Vercel (or "Allow access from anywhere" to start).
5. Deploy — Vercel auto-builds on every push to `main`.

## Project Structure
```
app/                — Next.js App Router pages & API routes
  api/               — backend endpoints (products, orders, razorpay, custom-orders, bulk-orders, upload)
  shop/[category]/   — category listing pages
  product/[slug]/    — product detail pages
  cart/, checkout/   — cart & checkout flow
  custom-print/      — custom design order flow
  bulk-order/        — bulk order enquiry form
components/          — shared React components (Header, Footer, ProductCard, CartContext)
lib/                 — DB connection, Mongoose models, sample product data
public/              — logo, product images, uploaded custom-print designs
docs/                — PRD, Design Doc, Tech Stack, App Flow, Backend Schema, Implementation Plan
scripts/seed.js      — seeds sample products into MongoDB
```

## A few things worth knowing
- **Trademark note:** "Supreme India" shares its name with the internationally trademarked "Supreme" streetwear brand. Worth a trademark search before investing heavily in this brand name.
- Several of the reference images you shared (Spider-Man, footballer likenesses) are licensed characters/IP — they were used only for style reference in the Design Doc, **not** included as seeded catalog products, since selling those commercially without a license is a real legal risk. The 8 seeded products use your original/faith-based-style graphic designs instead.
- Colors, copy, and placeholder text throughout are meant to be replaced with your real brand content before launch.

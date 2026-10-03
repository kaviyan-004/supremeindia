# Tech Stack Document
## Supreme India (SI)

**Version:** 1.0 · **Date:** September 14, 2026

---

## 1. Summary

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router, React 18)** | SSR/SSG for fast mobile loads + good SEO for product pages, file-based routing, API routes built in |
| Styling | **Tailwind CSS** | Fast to build mobile-first responsive UI, easy to encode the SI design tokens (colors/type) as a config |
| Backend | **Next.js API Routes / Route Handlers** | Keeps frontend + backend in one deployable codebase — simplest path to ship fast |
| Database | **MongoDB (via Mongoose)** | Flexible schema good for a catalog with variable product attributes (sizes, colors, custom-order fields); works well with Next.js |
| Payments | **Razorpay** | India-first gateway — UPI, cards, netbanking, wallets; test mode available without business KYC, switch to live keys once SI's Razorpay account is verified |
| Image handling | **Next.js `<Image>` + Cloudinary or S3-compatible storage (later)** | For v1, product images can be static/local; Cloudinary/S3 recommended once real catalog photography scales up |
| Auth | **NextAuth.js (credentials/email OTP) or phone-OTP via a provider (e.g., MSG91/Firebase)** | Lightweight auth for guest-first checkout + optional accounts |
| Hosting (frontend+API) | **Vercel** | Native fit for Next.js, generous free tier, instant deploys |
| Hosting (database) | **MongoDB Atlas (free/shared tier to start)** | Managed, no server maintenance, scales later |
| State management | **React Context + hooks (Cart context)** | App is not complex enough to need Redux/Zustand at this stage |
| Package manager | **npm** | Default, no strong reason to deviate |

## 2. Architecture Overview

```
Browser (mobile-first React/Next.js app)
        │
        ▼
Next.js server (Vercel)
  ├─ Pages/UI (App Router, SSR + client components)
  └─ API Routes (/api/*)
        │
        ├─── MongoDB Atlas (products, orders, custom-orders, bulk-orders, users, coupons)
        └─── Razorpay API (order creation, payment verification via webhook)
```

- Product pages are server-rendered for SEO and fast first paint; cart/checkout interactions are client-side.
- Payment flow: server creates a Razorpay order → client opens Razorpay Checkout → Razorpay confirms payment → server verifies signature via webhook/callback → order status updated in MongoDB.
- Custom design uploads are handled via a file upload endpoint; files are stored (local `/uploads` for the initial build, migrating to Cloudinary/S3 storage before production launch).

## 3. Environment & Config
- `.env.local` holds secrets: `MONGODB_URI`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXTAUTH_SECRET`, etc. — never committed to source control.
- Razorpay starts in **test mode** (test key pair) until SI completes business verification with Razorpay and swaps in live keys — no code changes needed, only env vars.

## 4. Why not other options (brief)
- **Separate Express backend:** more moving parts to deploy/host for no real benefit at this stage; Next.js API routes cover the needs.
- **PostgreSQL/Supabase:** a fine alternative, but MongoDB was chosen per your preference and fits the catalog's semi-flexible schema (custom-order fields, product variants) well.
- **Stripe:** better for international payments, but Razorpay is the standard choice for an India-first D2C brand (UPI support is essential here).

## 5. Local Development Requirements
- Node.js 20+, npm
- A MongoDB Atlas connection string (or local MongoDB for dev)
- Razorpay test API keys (free to generate from the Razorpay dashboard, no KYC required for test mode)

## 6. Deployment Path
1. Push code to a GitHub repository.
2. Connect the repo to Vercel (auto-deploys on push to `main`).
3. Set environment variables in Vercel's dashboard.
4. Point MongoDB Atlas network access to allow Vercel's IPs (or use "allow from anywhere" for simplicity initially).
5. Add a custom domain once purchased.

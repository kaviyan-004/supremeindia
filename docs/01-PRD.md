# Product Requirements Document (PRD)
## Supreme India (SI) — E-commerce Website

**Version:** 1.0
**Date:** September 14, 2026
**Owner:** Kaviyan (S. Kaviyan)

---

## 1. Overview

Supreme India (SI) is a streetwear clothing brand targeting college students and streetwear collectors across India. The brand's visual identity is bold, monochrome (black/white), and graphic-driven — built around a masked-figure logo and a wide catalog of graphic-print apparel spanning pop culture, faith-based, sports, band/vintage, and fully custom designs.

This document defines the requirements for SI's e-commerce website: a mobile-first online store where customers can browse the catalog, buy off-the-shelf designs, request fully custom prints, and place bulk orders — modeled in tone and shopping experience after [TheSouledStore.com](https://www.thesouledstore.com), India's leading pop-culture streetwear retailer.

## 2. Goals & Objectives

**Business goals**
- Establish SI's online storefront as the primary sales channel, reducing dependence on WhatsApp/Instagram DM-based selling.
- Support three revenue streams from day one: catalog sales, customer-submitted custom prints, and bulk/institutional orders.
- Build a brand experience that feels premium and youth-oriented, competitive with established streetwear retailers.

**Product goals**
- A fast, mobile-first shopping experience (most traffic will be on phones).
- A frictionless path from "see a design" to "checkout" in as few taps as possible.
- A clear, guided flow for customers who want a custom design printed, separate from standard catalog checkout.
- A simple bulk-order intake flow for colleges, events, and resellers.

**Non-goals (for this phase)**
- Multi-vendor marketplace features.
- International shipping/currency support.
- Native mobile apps (the website itself is mobile-first and installable-web-app-capable, not a separate iOS/Android app).

## 3. Target Users

| Segment | Description | Primary need |
|---|---|---|
| College students | Ages 18–24, price-conscious, buy trend-driven graphic tees/hoodies | Fast browsing, trending drops, affordable pricing, easy checkout |
| Streetwear collectors | Slightly older, seek limited/unique prints, band tees, niche graphics | Product depth, quality detail, restock/drop alerts |
| Custom-order customers | Want a specific design (personal, event, gifting) printed on apparel | Simple upload flow, clear pricing/turnaround, order tracking |
| Bulk buyers | College fests, clubs, corporates, resellers | Quantity-based pricing, easy multi-item/multi-size intake, direct contact |

## 4. Requirements

### 4.1 Functional Requirements

**Catalog & browsing**
- Home page with featured/new-arrival products, category shortcuts, and brand storytelling.
- Category pages: Tees, Hoodies, Caps, Joggers, Jackets (extensible for future categories).
- Filters: category, size, color, price range, sort (newest, price, popularity).
- Search with autocomplete.
- Product detail page: multiple images, size chart, color/size selection, price, description, related products, reviews.

**Cart & checkout**
- Persistent cart (survives page reload/session).
- Guest checkout + optional account creation.
- Address entry with pincode-based serviceability check.
- Coupon code field.
- Razorpay payment integration (cards, UPI, netbanking, wallets).
- Order confirmation page + email/SMS confirmation.

**Custom design orders**
- Dedicated "Custom Print" flow: customer uploads their design (image file) or describes what they want.
- Garment type, color, size, and print-placement (front/back/sleeve) selection.
- Optional note field for special instructions.
- Price estimate shown before submission; final confirmation handled by SI team (manual review, since custom pricing can vary).
- Order status tracking (submitted → in review → approved/quoted → in production → shipped).

**Bulk orders**
- Dedicated "Bulk Order" intake form: organization name, contact details, product(s), quantity per size, expected delivery date, budget (optional).
- Submissions routed to SI's team (email/dashboard) for manual quoting — not processed through the standard cart.

**Account & orders**
- Sign up/login (email or phone OTP).
- Order history, order status, reorder.
- Wishlist.

**Content & trust**
- Size guide (accessible from every product page).
- Customer reviews & ratings on products.
- FAQ / Shipping & Returns policy pages.
- About/brand story page.

### 4.2 Non-Functional Requirements
- Mobile-first responsive design; must look and perform well down to ~360px width.
- Page load under 2.5s on 4G for key pages (home, category, PDP).
- Secure payment handling (PCI compliance delegated to Razorpay; no raw card data touches SI's servers).
- Basic SEO (meta tags, semantic HTML, sitemap) so products are discoverable via search.
- Admin-manageable product catalog (no code changes needed to add/edit products).

## 5. User Experience Principles
- **Mobile-first, thumb-friendly:** primary actions (Add to Cart, Buy Now, filters) reachable with one hand.
- **Visual-first browsing:** large product imagery, minimal text until the user taps into a product — streetwear is bought on visual appeal.
- **Bold, confident brand voice:** short, punchy copy in line with SI's graphic, monochrome identity — playful and youth-oriented, similar to TheSouledStore's tone.
- **Low-friction custom & bulk paths:** these are distinct from standard shopping and should never feel bolted on — give them their own clear entry points (nav + home page banners).
- **Trust signals throughout:** reviews, size guide, clear return policy, and order status visibility reduce cart abandonment.

## 6. Success Metrics
- **Conversion rate:** % of sessions resulting in a completed order (catalog checkout).
- **Cart abandonment rate:** target under industry average (~70%) within 3 months of launch.
- **Custom order submission → confirmed order rate:** how many custom submissions convert to paid orders.
- **Bulk inquiry response time:** time from submission to SI team's first quote response.
- **Mobile traffic share & mobile conversion rate:** since the site is mobile-first, mobile conversion should not lag desktop.
- **Repeat purchase rate:** % of customers who order more than once within 90 days.
- **Average order value (AOV).**

## 7. Assumptions & Constraints
- Real Razorpay production credentials and business KYC are not yet available; checkout will be built against Razorpay's test mode and switched to live keys once SI completes onboarding with Razorpay.
- Product photography for the initial catalog will be supplied by Kaviyan/SI; placeholders are used only where real images aren't yet available.
- Shipping/logistics partner is not yet finalized — the order flow is designed to be logistics-provider-agnostic (manual fulfillment initially, pluggable shipping API later).
- "Supreme India" as a brand name carries a trademark-collision risk with the global "Supreme" streetwear brand; this PRD does not address legal/naming risk — that is a business decision outside this document's scope.

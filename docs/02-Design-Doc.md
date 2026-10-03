# Design Doc (UI/UX)
## Supreme India (SI)

**Version:** 1.0 · **Date:** September 14, 2026

---

## 1. Design Direction

SI's visual identity, taken from the logo, is bold, high-contrast, monochrome streetwear — a masked figure in a cap, aggressive wordmark, graphic energy. The site should feel like a digital extension of that: dark, confident, minimal chrome, letting product graphics do the talking. Shopping-experience pacing and information density are modeled after **TheSouledStore.com**: big hero banners, dense but organized product grids, bold sale/drop callouts, playful microcopy.

Design priority order: **mobile first → tablet → desktop.** Every screen is designed at 360–420px width first; larger breakpoints are an expansion, not an afterthought.

## 2. Visual Identity

**Color palette**
| Token | Hex | Use |
|---|---|---|
| `bg-primary` | `#0A0A0A` | Base background (near-black) |
| `bg-surface` | `#161616` | Cards, nav, sheets |
| `text-primary` | `#FFFFFF` | Primary text/icons |
| `text-muted` | `#A3A3A3` | Secondary text |
| `accent` | `#FFFFFF` on black / inverted blocks | CTAs, buttons — monochrome-first |
| `accent-alert` | `#E63946` | Sale badges, error states, "limited drop" tags |
| `success` | `#2ECC71` | Order success, in-stock indicators |
| `border` | `#2A2A2A` | Dividers, card borders |

Light mode is not a priority for v1 — the brand's identity is dark/monochrome; if a light theme is added later, it inverts the same tokens.

**Typography**
- Headings: a bold, condensed grotesque (e.g., "Anton", "Archivo Black", or similar free Google Font) to echo the logo's chunky wordmark.
- Body/UI text: a clean grotesque (e.g., "Inter" or "Work Sans") for legibility at small sizes.
- Scale (mobile): H1 28px / H2 22px / H3 18px / Body 15px / Caption 12px, all at 1.3–1.5 line-height.

**Logo usage**
- Full logo (figure + wordmark) on splash/home hero and marketing banners.
- Wordmark-only or "SI" monogram in the nav bar and favicon, to stay legible at small sizes.
- Always on a solid dark background per the supplied logo file; never recolor the figure artwork.

**Imagery style**
- Product photography on hangers/flat-lay or worn, consistent with the reference images supplied (dark or neutral backdrops, centered garment, print clearly visible).
- Front + back shots for every graphic tee/hoodie (back prints are a big part of SI's catalog).

## 3. Core Screens (mobile-first)

### 3.1 Home
- Sticky top bar: logo (center or left), search icon, cart icon with item-count badge, menu (hamburger).
- Full-bleed hero banner (carousel): current drop/campaign, CTA button.
- Horizontal category shortcuts (Tees, Hoodies, Caps, Joggers, Jackets) as tappable chips/icons.
- "New Arrivals" horizontal scroll product row.
- "Bestsellers" horizontal scroll product row.
- Banner: "Get Your Own Design Printed" → links to Custom Print flow.
- Banner: "Bulk Orders for Colleges & Events" → links to Bulk Order flow.
- Footer: policy links, socials, contact.

### 3.2 Category / Listing Page
- Category title + result count.
- Filter/sort bar (sticky under header): opens a bottom sheet on mobile (Category, Size, Price, Color, Sort).
- 2-column product grid (mobile) — image, name, price, "New"/"Sale" badge, wishlist heart icon.
- Infinite scroll or "Load more" pagination.

### 3.3 Product Detail Page (PDP)
- Swipeable image gallery (front/back/detail shots), dot indicator.
- Product name, price (with strikethrough MRP if discounted), rating summary.
- Color swatches (if variants exist).
- Size selector as pill buttons; "Size Guide" link opens a modal/sheet with the chart.
- Sticky bottom bar on mobile: "Add to Cart" + "Buy Now" buttons.
- Expandable sections: Description, Fabric & Care, Shipping & Returns.
- Reviews section with rating breakdown + individual reviews.
- "You may also like" related-products row.

### 3.4 Cart
- Line items: image, name, size, qty stepper, price, remove.
- Coupon code input.
- Order summary: subtotal, shipping, discount, total.
- Sticky "Proceed to Checkout" button.
- Empty-cart state with a CTA back to shop.

### 3.5 Checkout
- Step 1: Contact + shipping address (with pincode serviceability check).
- Step 2: Order review.
- Step 3: Payment via Razorpay (opens Razorpay's own secure checkout sheet).
- Progress indicator at top (3 short steps, not a long form) — minimize steps for mobile.
- Order confirmation screen with order ID and summary.

### 3.6 Custom Print Order Flow
- Step 1: Choose garment (type, color, size).
- Step 2: Upload design file (image) and/or describe the design; select print placement (front/back/sleeve).
- Step 3: Contact details + notes.
- Confirmation screen: "Your request has been submitted — our team will confirm pricing & timeline within 24 hours," with a reference ID to track status.
- Simple status tracker page (submitted → in review → quoted → approved → in production → shipped), reachable from the customer's account/orders section.

### 3.7 Bulk Order Flow
- Single-page form: organization/name, contact (phone + email), product(s) + quantities per size (repeatable rows), expected date, notes/budget.
- Confirmation screen: "Our team will reach out within 24–48 hours."

### 3.8 Account
- Login/signup (phone OTP or email).
- Order history list → order detail/status.
- Wishlist grid.
- Saved addresses.

## 4. Component Library (summary)
- **Buttons:** primary (solid white-on-black / black-on-white), secondary (outline), destructive (remove/cancel).
- **Product Card:** image, badge, name, price, wishlist toggle.
- **Bottom Sheet:** used for filters, size guide, and size/qty pickers — mobile-native pattern rather than modals wherever possible.
- **Sticky Action Bar:** used on PDP and Cart for primary CTAs, always reachable by thumb.
- **Badges/Tags:** "New," "Sale," "Limited Drop," "Custom," "Bestseller."
- **Toast/Snackbar:** cart add confirmations, errors.

## 5. Accessibility & Responsiveness
- Minimum tap target 44×44px.
- Color contrast checked against the dark palette (white text on `#0A0A0A`/`#161616` passes WCAG AA).
- All interactive elements reachable via keyboard/focus states for desktop users.
- Breakpoints: `sm` 360–639px (primary target), `md` 640–1023px, `lg` 1024px+.

## 6. Reference Assets
- Brand logo: monochrome masked-figure mark with "SUPREME INDIA" wordmark (provided).
- Product reference images: graphic tees/hoodies across faith, pop-culture, sports, band, and custom categories (provided) — these establish the print-heavy, oversized-fit merchandising style to carry through product photography and PDP layout.

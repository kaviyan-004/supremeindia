# Backend Schema Document
## Supreme India (SI) — MongoDB / Mongoose

**Version:** 1.0 · **Date:** September 14, 2026

---

## 1. Collections Overview

| Collection | Purpose |
|---|---|
| `products` | Catalog items (tees, hoodies, caps, joggers, jackets) |
| `users` | Customer accounts |
| `orders` | Standard catalog orders (cart checkout) |
| `customOrders` | Custom design print requests |
| `bulkOrders` | Bulk order inquiries |
| `coupons` | Discount codes |
| `reviews` | Product reviews |

## 2. Schema Definitions

### 2.1 `products`
```js
{
  _id: ObjectId,
  name: String,                     // "Keep God First Oversized Tee"
  slug: String,                     // unique, URL-safe
  category: String,                 // 'tees' | 'hoodies' | 'caps' | 'joggers' | 'jackets'
  description: String,
  price: Number,                    // in INR (paise or rupees — use paise for precision)
  mrp: Number,                      // original price, for showing discount
  images: [String],                 // URLs, front/back/detail
  colors: [{ name: String, hex: String }],
  sizes: [{ size: String, stock: Number }],  // e.g. S/M/L/XL/XXL with per-size stock
  fabric: String,
  fit: String,                      // 'Regular' | 'Oversized'
  tags: [String],                   // 'new', 'bestseller', 'sale', 'limited'
  isCustomizable: Boolean,          // reserved for future "customize this base product"
  ratingAvg: Number,
  ratingCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 `users`
```js
{
  _id: ObjectId,
  name: String,
  email: String,            // unique, optional if phone-based
  phone: String,            // unique, optional if email-based
  passwordHash: String,     // only if credentials auth used
  addresses: [{
    label: String,          // 'Home', 'Hostel', etc.
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    isDefault: Boolean
  }],
  wishlist: [ObjectId],     // ref: products
  createdAt: Date
}
```

### 2.3 `orders` (standard catalog checkout)
```js
{
  _id: ObjectId,
  orderNumber: String,          // human-readable, e.g. SI-100234
  user: ObjectId,                // ref: users (nullable for guest checkout)
  guestContact: { name, email, phone },  // used when user is null
  items: [{
    product: ObjectId,           // ref: products
    name: String,                // snapshot at time of order
    image: String,
    size: String,
    color: String,
    quantity: Number,
    price: Number                // snapshot price at time of order
  }],
  shippingAddress: { line1, line2, city, state, pincode, phone },
  subtotal: Number,
  discount: Number,
  couponCode: String,
  shippingFee: Number,
  total: Number,
  paymentStatus: String,         // 'pending' | 'paid' | 'failed' | 'refunded'
  paymentProvider: String,       // 'razorpay'
  razorpayOrderId: String,
  razorpayPaymentId: String,
  orderStatus: String,           // 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 `customOrders` (custom design print requests)
```js
{
  _id: ObjectId,
  referenceId: String,           // e.g. SI-CUSTOM-8841, shown to customer for tracking
  user: ObjectId,                 // nullable for guest submissions
  contact: { name, email, phone },
  garment: { type: String, color: String, size: String },  // type: 'tee'|'hoodie'|etc.
  designFileUrl: String,          // uploaded design image
  designDescription: String,      // free-text description as an alternative/supplement
  printPlacement: String,         // 'front' | 'back' | 'sleeve' | 'front_and_back'
  notes: String,
  quotedPrice: Number,            // set by SI team after review
  status: String,                 // 'submitted' | 'in_review' | 'quoted' | 'approved' | 'in_production' | 'shipped' | 'rejected'
  linkedOrder: ObjectId,          // ref: orders, once payment is collected
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 `bulkOrders`
```js
{
  _id: ObjectId,
  organizationName: String,
  contact: { name, email, phone },
  items: [{ productType: String, sizeBreakdown: [{ size: String, quantity: Number }] }],
  expectedDate: Date,
  budget: Number,               // optional
  notes: String,
  status: String,                // 'new' | 'contacted' | 'quoted' | 'confirmed' | 'closed'
  createdAt: Date
}
```

### 2.6 `coupons`
```js
{
  _id: ObjectId,
  code: String,               // unique, e.g. 'WELCOME10'
  type: String,                // 'percentage' | 'flat'
  value: Number,
  minOrderValue: Number,
  maxDiscount: Number,         // cap for percentage coupons
  expiresAt: Date,
  usageLimit: Number,
  usedCount: Number,
  isActive: Boolean
}
```

### 2.7 `reviews`
```js
{
  _id: ObjectId,
  product: ObjectId,        // ref: products
  user: ObjectId,             // ref: users
  rating: Number,             // 1–5
  comment: String,
  images: [String],           // optional customer photos
  createdAt: Date
}
```

## 3. Relationships
- `orders.items[].product` → `products._id`
- `orders.user` → `users._id` (nullable, guest checkout supported)
- `customOrders.linkedOrder` → `orders._id` (set once a custom order is quoted and paid)
- `reviews.product` → `products._id`, `reviews.user` → `users._id`
- `users.wishlist[]` → `products._id`

## 4. Indexing Notes
- `products.slug` — unique index (used for PDP routing).
- `orders.orderNumber` — unique index.
- `customOrders.referenceId` — unique index.
- `users.email` / `users.phone` — unique, sparse indexes (either may be null depending on signup method).
- `products.category`, `products.tags` — indexed for fast category/filter queries.

## 5. Data Integrity Notes
- Order line items **snapshot** product name/price/image at time of purchase, so later catalog edits don't retroactively change historical orders.
- Stock is decremented at successful payment confirmation (not at "Add to Cart"), to avoid holding stock hostage from abandoned carts.
- Custom and bulk orders deliberately live in separate collections from `orders` since their lifecycle (manual quoting before payment) differs from standard checkout.

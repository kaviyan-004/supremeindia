import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Order from '../../../lib/models/Order';
import Product from '../../../lib/models/Product';
import sampleProducts from '../../../lib/sampleProducts.json';
import { computeTotals } from '../../../lib/pricing';
import { getAuthenticatedUser } from '../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_ORDERS_FILE = path.join(process.cwd(), 'lib', 'devOrders.json');

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SI-${rand}`;
}

function readDevOrders() {
  try {
    if (fs.existsSync(DEV_ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

function writeDevOrders(orders) {
  try {
    fs.writeFileSync(DEV_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {
    console.error(e);
  }
}

/**
 * Validates whether the requester has permission to view the order
 */
function verifyOrderOwnership(order, sessionUser, verifyParam) {
  // 1. Admin can view all orders
  if (sessionUser?.role === 'admin') {
    return { allowed: true };
  }

  // 2. Logged-in customer can view their own orders
  if (sessionUser) {
    const isOwnerById = order.user && String(order.user) === String(sessionUser.sub);
    const isOwnerByEmail =
      order.guestContact?.email &&
      order.guestContact.email.toLowerCase() === (sessionUser.email || '').toLowerCase();

    if (isOwnerById || isOwnerByEmail) {
      return { allowed: true };
    }

    return {
      allowed: false,
      status: 403,
      error: 'Access denied: You do not have permission to view this order.',
    };
  }

  // 3. Guest (unauthenticated): Must verify ownership via matching email or phone
  if (!verifyParam) {
    return {
      allowed: false,
      status: 403,
      error:
        'Access denied: Verification required. Provide the email or phone number used at checkout to track this order (e.g. ?verify=...).',
    };
  }

  const cleanVerify = verifyParam.toLowerCase().trim();
  const cleanPhoneInput = cleanVerify.replace(/[^0-9]/g, '');

  const orderEmail = (order.guestContact?.email || '').toLowerCase().trim();
  const orderPhone = (order.guestContact?.phone || '').replace(/[^0-9]/g, '');
  const shippingPhone = (order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');

  const emailMatches = orderEmail && cleanVerify === orderEmail;
  const phoneMatches =
    cleanPhoneInput && (cleanPhoneInput === orderPhone || cleanPhoneInput === shippingPhone);

  if (emailMatches || phoneMatches) {
    return { allowed: true };
  }

  return {
    allowed: false,
    status: 403,
    error: 'Access denied: The provided verification email/phone does not match this order.',
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const verifyParam = searchParams.get('verify') || searchParams.get('phone') || searchParams.get('email');

    if (!orderNumber) {
      return NextResponse.json({ error: 'orderNumber is required' }, { status: 400 });
    }

    // Authenticate user session if present
    const sessionUser = getAuthenticatedUser(request);

    let order = null;
    if (process.env.MONGODB_URI) {
      await connectDB();
      order = await Order.findOne({ orderNumber }).lean();
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      order = JSON.parse(JSON.stringify(order));
    } else {
      const orders = readDevOrders();
      order = orders.find((o) => o.orderNumber === orderNumber);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // STRICT OWNERSHIP CHECK
    const check = verifyOrderOwnership(order, sessionUser, verifyParam);
    if (!check.allowed) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

const MAX_QTY_PER_ITEM = 10;
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

// Resolve the authoritative catalog product for a cart line. Prices always come
// from here, never from the browser.
async function findCatalogProduct(productId, slug) {
  const id = String(productId || '');
  if (process.env.MONGODB_URI) {
    await connectDB();
    let product = null;
    if (OBJECT_ID_RE.test(id)) {
      product = await Product.findOne({ _id: id, isActive: true }).lean();
    }
    if (!product && slug) {
      product = await Product.findOne({ slug: String(slug), isActive: true }).lean();
    }
    if (product) return JSON.parse(JSON.stringify(product));
  }
  // Bundled sample catalog (used by the storefront when the DB has no products)
  return (
    sampleProducts.find(
      (p) => p.isActive !== false && (p._id === id || (slug && p.slug === String(slug)))
    ) || null
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, guestContact, shippingAddress, couponCode } = body;

    if (!Array.isArray(items) || !items.length || items.length > 50) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const addr = shippingAddress || {};
    if (
      !String(addr.line1 || '').trim() ||
      !String(addr.city || '').trim() ||
      !String(addr.state || '').trim() ||
      !/^\d{6}$/.test(String(addr.pincode || '')) ||
      String(addr.phone || '').replace(/\D/g, '').length < 10
    ) {
      return NextResponse.json({ error: 'A complete shipping address is required' }, { status: 400 });
    }

    // Cash on Delivery is the only payment method; any browser-supplied method is ignored.
    const paymentMethod = 'cod';

    // Rebuild every line from the catalog: price/name/image come from the server.
    const orderItems = [];
    for (const i of items) {
      const quantity = Number(i?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
      }
      const product = await findCatalogProduct(i?.productId, i?.slug);
      if (!product) {
        return NextResponse.json(
          { error: `"${String(i?.name || 'An item').slice(0, 80)}" is no longer available` },
          { status: 400 }
        );
      }
      const size = String(i?.size || '');
      const sizeEntry = product.sizes?.find((s) => s.size === size);
      if (product.sizes?.length && !sizeEntry) {
        return NextResponse.json({ error: `Size ${size} is not available for ${product.name}` }, { status: 400 });
      }
      if (sizeEntry && typeof sizeEntry.stock === 'number' && sizeEntry.stock < quantity) {
        return NextResponse.json({ error: `${product.name} (${size}) is out of stock` }, { status: 400 });
      }
      orderItems.push({
        product: OBJECT_ID_RE.test(String(product._id)) ? String(product._id) : undefined,
        name: product.name,
        image: product.images?.[0] || '',
        size,
        color: String(i?.color || '').slice(0, 40),
        quantity,
        price: product.price,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totals = computeTotals({ subtotal, couponCode });

    // Cryptographically verified user session (no spoofing)
    const sessionUser = getAuthenticatedUser(request);

    const isValidId = sessionUser?.sub && OBJECT_ID_RE.test(sessionUser.sub);
    const orderNumber = generateOrderNumber();

    const orderData = {
      orderNumber,
      // If user is authenticated, strictly bind to their verified user ID
      user: isValidId ? sessionUser.sub : null,
      guestContact: {
        name: guestContact?.name || sessionUser?.name || 'Valued Customer',
        // Enforce verified email if logged in
        email: sessionUser?.email || guestContact?.email || '',
        phone: sessionUser?.phone || guestContact?.phone || '',
      },
      items: orderItems,
      shippingAddress: {
        line1: String(addr.line1),
        line2: String(addr.line2 || ''),
        city: String(addr.city),
        state: String(addr.state),
        pincode: String(addr.pincode),
        phone: String(addr.phone),
      },
      subtotal,
      discount: totals.discount,
      couponCode: totals.couponCode,
      // Delivery depends on location and is confirmed by the owner by phone, so no fee is stored yet.
      // `total` is the items total (after discount), excluding delivery.
      shippingFee: null,
      shippingPending: true,
      total: totals.total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      createdAt: new Date().toISOString(),
    };

    if (!process.env.MONGODB_URI) {
      // Local dev file storage
      const existing = readDevOrders();
      const newOrder = {
        _id: `ord_${Date.now()}`,
        ...orderData,
      };
      existing.unshift(newOrder);
      writeDevOrders(existing);
      return NextResponse.json(newOrder);
    }

    await connectDB();
    const order = await Order.create(orderData);
    return NextResponse.json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: 'Could not place order. Please try again.' }, { status: 500 });
  }
}

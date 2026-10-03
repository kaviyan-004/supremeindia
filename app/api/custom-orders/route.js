import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import CustomOrder from '../../../lib/models/CustomOrder';
import { getAuthenticatedUser } from '../../../lib/auth';
import { getClientIp, checkRateLimit } from '../../../lib/rateLimiter';
import { ARTWORK_PATH_RE, artworkAdminUrl } from '../../../lib/artwork';
import fs from 'fs';
import path from 'path';

const DEV_FILE = path.join(process.cwd(), 'lib', 'devCustomOrders.json');

function generateReferenceId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SI-CUSTOM-${rand}`;
}

const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const PLACEMENTS = ['front', 'back', 'sleeve', 'front_and_back'];

export async function POST(request) {
  try {
    // Spam protection for the public enquiry form
    const rate = checkRateLimit(`custom-order:${getClientIp(request)}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rate.resetInSeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rate.resetInSeconds) } }
      );
    }

    const body = await request.json();
    const referenceId = generateReferenceId();

    // Bind authenticated user identity if logged in
    const sessionUser = getAuthenticatedUser(request);

    // Only known customer-supplied fields are accepted (no status/price/user overrides from the browser).
    const artworkId = str(body.artworkId, 200);
    const orderPayload = {
      contact: {
        name: str(body.contact?.name, 200),
        email: sessionUser?.email || str(body.contact?.email, 200),
        phone: str(body.contact?.phone, 40),
      },
      garment: {
        type: str(body.garment?.type, 60),
        color: str(body.garment?.color, 60),
        size: str(body.garment?.size, 20),
      },
      // Private artwork is referenced by an admin-only URL; arbitrary URLs from the browser are ignored.
      designFileUrl: ARTWORK_PATH_RE.test(artworkId) ? artworkAdminUrl(artworkId) : '',
      designDescription: str(body.designDescription),
      printPlacement: PLACEMENTS.includes(body.printPlacement) ? body.printPlacement : 'front',
      notes: str(body.notes),
      referenceId,
      user: sessionUser ? sessionUser.sub : null,
    };

    if (!process.env.MONGODB_URI) {
      let orders = [];
      try {
        if (fs.existsSync(DEV_FILE)) {
          orders = JSON.parse(fs.readFileSync(DEV_FILE, 'utf8'));
        }
      } catch (e) {}

      const newOrder = {
        _id: `cust_${Date.now()}`,
        ...orderPayload,
        createdAt: new Date().toISOString(),
      };
      orders.unshift(newOrder);
      try {
        fs.writeFileSync(DEV_FILE, JSON.stringify(orders, null, 2), 'utf8');
      } catch (e) {}

      return NextResponse.json({ referenceId, status: 'submitted', order: newOrder });
    }

    await connectDB();
    const doc = await CustomOrder.create(orderPayload);
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '../../../../lib/db';
import Order from '../../../../lib/models/Order';
import { verifySessionToken } from '../../../../lib/jwt';
import fs from 'fs';
import path from 'path';

const DEV_ORDERS_FILE = path.join(process.cwd(), 'lib', 'devOrders.json');

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('si_session');

  // Verify Cryptographically Signed Session Token
  if (!sessionCookie?.value) {
    return NextResponse.json({ user: null, orders: [] });
  }

  const payload = verifySessionToken(sessionCookie.value);
  if (!payload || !payload.email) {
    // Tampered or expired token
    const res = NextResponse.json({ user: null, orders: [] });
    res.cookies.set('si_session', '', { maxAge: 0, path: '/' });
    return res;
  }

  const user = {
    _id: payload.sub,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
  };

  try {
    let orders = [];

    if (process.env.MONGODB_URI) {
      await connectDB();
      orders = await Order.find({
        $or: [
          { 'guestContact.email': user.email },
          { 'guestContact.phone': user.phone },
          { user: user._id },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      if (fs.existsSync(DEV_ORDERS_FILE)) {
        const allOrders = JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, 'utf8'));
        orders = allOrders.filter(
          (o) =>
            o.user === user._id ||
            o.guestContact?.email === user.email ||
            o.guestContact?.phone === user.phone
        );
      }
    }

    return NextResponse.json({ user, orders });
  } catch (e) {
    return NextResponse.json({ user, orders: [] });
  }
}

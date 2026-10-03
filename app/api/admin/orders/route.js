import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Order from '../../../../lib/models/Order';
import { requireAdmin } from '../../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_ORDERS_FILE = path.join(process.cwd(), 'lib', 'devOrders.json');

function getDevOrders() {
  try {
    if (fs.existsSync(DEV_ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function GET(req) {
  // Enforce Admin Authorization
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ orders: JSON.parse(JSON.stringify(orders)) });
    }
    const orders = getDevOrders();
    return NextResponse.json({ orders });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import Order from '../../../../../lib/models/Order';
import { requireAdmin } from '../../../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_ORDERS_FILE = path.join(process.cwd(), 'lib', 'devOrders.json');

export async function PATCH(req, { params }) {
  // Enforce Admin Authorization
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { orderStatus, paymentStatus } = await req.json();

    if (process.env.MONGODB_URI) {
      await connectDB();
      const update = {};
      if (orderStatus) update.orderStatus = orderStatus;
      if (paymentStatus) update.paymentStatus = paymentStatus;

      const order = await Order.findByIdAndUpdate(id, update, { new: true }).lean();
      return NextResponse.json({ success: true, order });
    }

    // Dev fallback
    let orders = [];
    if (fs.existsSync(DEV_ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, 'utf8'));
    }
    const idx = orders.findIndex((o) => o._id === id);
    if (idx !== -1) {
      if (orderStatus) orders[idx].orderStatus = orderStatus;
      if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
      fs.writeFileSync(DEV_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
      return NextResponse.json({ success: true, order: orders[idx] });
    }

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  // Enforce Admin Authorization
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const { id } = params;

    if (process.env.MONGODB_URI) {
      await connectDB();
      await Order.findByIdAndDelete(id);
    }

    // Dev fallback
    if (fs.existsSync(DEV_ORDERS_FILE)) {
      let orders = [];
      try {
        orders = JSON.parse(fs.readFileSync(DEV_ORDERS_FILE, 'utf8'));
      } catch (e) {}
      const filtered = orders.filter((o) => o._id !== id && o.orderNumber !== id);
      fs.writeFileSync(DEV_ORDERS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully from backend.' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

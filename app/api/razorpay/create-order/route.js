import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { connectDB } from '../../../../lib/db';
import Order from '../../../../lib/models/Order';
import { getAuthenticatedUser } from '../../../../lib/auth';

export async function POST(request) {
  // Online payment is disabled: Cash on Delivery is the only payment method.
  if (process.env.ENABLE_ONLINE_PAYMENT !== 'true') {
    return NextResponse.json({ error: 'Online payment is not available.' }, { status: 410 });
  }

  try {
    const { orderId, amount } = await request.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          error:
            'Razorpay keys are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (test mode) to .env.local.',
        },
        { status: 500 }
      );
    }

    // Ownership Verification
    const sessionUser = getAuthenticatedUser(request);

    // The charge amount is always the server-stored order total, never a browser value.
    let chargeAmount = Number(amount);

    if (process.env.MONGODB_URI && !orderId.startsWith('mock-')) {
      await connectDB();
      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If order belongs to an authenticated user, confirm session user matches
      if (order.user && (!sessionUser || String(order.user) !== String(sessionUser.sub))) {
        if (sessionUser?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Unauthorized: You do not own this order.' },
            { status: 403 }
          );
        }
      }

      chargeAmount = order.total;

      // Check payment status
      if (order.paymentStatus === 'paid') {
        return NextResponse.json(
          { error: 'This order has already been paid.' },
          { status: 400 }
        );
      }
    }

    if (!Number.isFinite(chargeAmount) || chargeAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(chargeAmount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: String(orderId),
    });

    if (process.env.MONGODB_URI && !orderId.startsWith('mock-')) {
      await connectDB();
      await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rpOrder.id });
    }

    return NextResponse.json(rpOrder);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

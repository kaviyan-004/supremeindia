import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '../../../../lib/db';
import Order from '../../../../lib/models/Order';

export async function POST(request) {
  // Online payment is disabled: Cash on Delivery is the only payment method.
  if (process.env.ENABLE_ONLINE_PAYMENT !== 'true') {
    return NextResponse.json({ error: 'Online payment is not available.' }, { status: 410 });
  }

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing required payment verification parameters' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server payment configuration missing' }, { status: 500 });
    }

    // 1. Verify Razorpay Cryptographic Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuffer = Buffer.from(razorpay_signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // 2. Strict Composite Record Match: Order ID must bind to the exact Razorpay Order ID
    if (process.env.MONGODB_URI && !orderId.startsWith('mock-')) {
      await connectDB();
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          razorpayOrderId: razorpay_order_id, // Ensures payment cannot be bound to an unrelated order
        },
        {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayPaymentId: razorpay_payment_id,
        },
        { new: true }
      );

      if (!updatedOrder) {
        return NextResponse.json(
          { error: 'Payment verification error: Order does not match the payment receipt.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

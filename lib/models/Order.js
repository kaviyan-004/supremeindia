import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    size: String,
    color: String,
    quantity: { type: Number, default: 1 },
    price: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestContact: {
      name: String,
      email: String,
      phone: String,
    },
    items: { type: [OrderItemSchema], default: [] },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    shippingFee: { type: Number, default: 0 },
    // true until the owner confirms the location-based delivery charge by phone
    shippingPending: { type: Boolean, default: false },
    total: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentProvider: { type: String, default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'in_printing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

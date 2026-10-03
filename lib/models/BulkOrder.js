import mongoose from 'mongoose';

const SizeBreakdownSchema = new mongoose.Schema(
  { size: String, quantity: Number },
  { _id: false }
);

const BulkItemSchema = new mongoose.Schema(
  {
    productType: String,
    sizeBreakdown: { type: [SizeBreakdownSchema], default: [] },
  },
  { _id: false }
);

const BulkOrderSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    items: { type: [BulkItemSchema], default: [] },
    expectedDate: Date,
    budget: Number,
    notes: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'quoted', 'confirmed', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export default mongoose.models.BulkOrder || mongoose.model('BulkOrder', BulkOrderSchema);

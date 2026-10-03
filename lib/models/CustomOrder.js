import mongoose from 'mongoose';

const CustomOrderSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    garment: {
      type: { type: String }, // tee, hoodie, cap, joggers, jacket
      color: String,
      size: String,
    },
    designFileUrl: String,
    designDescription: String,
    printPlacement: {
      type: String,
      enum: ['front', 'back', 'sleeve', 'front_and_back'],
      default: 'front',
    },
    notes: String,
    quotedPrice: Number,
    status: {
      type: String,
      enum: [
        'submitted',
        'in_review',
        'quoted',
        'approved',
        'in_production',
        'shipped',
        'rejected',
      ],
      default: 'submitted',
    },
    linkedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.CustomOrder ||
  mongoose.model('CustomOrder', CustomOrderSchema);

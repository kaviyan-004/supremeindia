import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const ColorSchema = new mongoose.Schema(
  {
    name: String,
    hex: String,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['tees', 'hoodies', 'caps', 'joggers', 'jackets'],
    },
    subCategory: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    mrp: { type: Number },
    memberPrice: { type: Number },
    images: { type: [String], default: [] },
    colors: { type: [ColorSchema], default: [] },
    sizes: { type: [SizeSchema], default: [] },
    fabric: { type: String, default: '' },
    fit: { type: String, enum: ['Regular', 'Oversized'], default: 'Oversized' },
    tags: { type: [String], default: [] },
    badgeText: { type: String, default: '' },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

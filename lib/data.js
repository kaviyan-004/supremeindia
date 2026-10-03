import { connectDB } from './db';
import Product from './models/Product';

// Central place used by pages to fetch products. Falls back to bundled
// sample data if MONGODB_URI isn't configured yet, so the UI is always
// browsable even before a database is connected.
import sampleProducts from './sampleProducts.json';

export async function getAllProducts({ category } = {}) {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const query = { isActive: true };
      if (category) query.category = category;
      const products = await Product.find(query).sort({ createdAt: -1 }).lean();
      if (products?.length) {
        return JSON.parse(JSON.stringify(products));
      }
    }
  } catch (err) {
    console.error('MongoDB query error, using bundled products:', err.message);
  }

  const activeSamples = sampleProducts.filter((p) => p.isActive !== false);
  return category
    ? activeSamples.filter((p) => p.category === category)
    : activeSamples;
}

export async function getProductBySlug(slug) {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const product = await Product.findOne({ slug, isActive: true }).lean();
      if (product) {
        return JSON.parse(JSON.stringify(product));
      }
    }
  } catch (err) {
    console.error('MongoDB query error, using bundled product:', err.message);
  }

  return sampleProducts.find((p) => p.slug === slug) || null;
}

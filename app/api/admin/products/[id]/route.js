import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import Product from '../../../../../lib/models/Product';
import { requireAdmin } from '../../../../../lib/auth';
import fs from 'fs';
import path from 'path';

const SAMPLE_PRODUCTS_FILE = path.join(process.cwd(), 'lib', 'sampleProducts.json');

function getSampleProducts() {
  try {
    if (fs.existsSync(SAMPLE_PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(SAMPLE_PRODUCTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading sampleProducts.json:', e);
  }
  return [];
}

function saveSampleProducts(products) {
  try {
    fs.writeFileSync(SAMPLE_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing sampleProducts.json:', e);
  }
}

export async function PATCH(req, { params }) {
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  const { id } = params;
  try {
    const body = await req.json();

    for (const key of ['price', 'mrp', 'memberPrice']) {
      if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
        const n = Number(body[key]);
        if (!Number.isFinite(n) || n <= 0) {
          return NextResponse.json({ error: `${key} must be a positive number.` }, { status: 400 });
        }
        body[key] = n;
      }
    }

    if (process.env.MONGODB_URI) {
      await connectDB();
      const updated = await Product.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
      if (updated) {
        return NextResponse.json({ success: true, product: JSON.parse(JSON.stringify(updated)) });
      }
    }

    // Local sampleProducts fallback
    const samples = getSampleProducts();
    const idx = samples.findIndex((p) => p._id === id || p.slug === id);
    if (idx !== -1) {
      samples[idx] = { ...samples[idx], ...body };
      saveSampleProducts(samples);
      return NextResponse.json({ success: true, product: samples[idx] });
    }

    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  const { id } = params;
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      await Product.findByIdAndDelete(id);
    }

    const samples = getSampleProducts();
    const filtered = samples.filter((p) => p._id !== id && p.slug !== id);
    saveSampleProducts(filtered);

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

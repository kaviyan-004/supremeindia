import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Product from '../../../../lib/models/Product';
import { requireAdmin } from '../../../../lib/auth';
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

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET(req) {
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      if (products && products.length > 0) {
        return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
      }
    }
    const products = getSampleProducts();
    return NextResponse.json({ products });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      category = 'tees',
      subCategory = '',
      description = '',
      price,
      mrp,
      memberPrice,
      images = [],
      fabric = '',
      fit = 'Oversized',
      sizes,
      colors,
      tags = ['new'],
      badgeText = 'NEW DROP',
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'At least one product image is required.' }, { status: 400 });
    }

    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 });
    }
    // MRP and club price are only stored when the admin enters them (no invented 'discounts').
    const numMrp = mrp ? Number(mrp) : undefined;
    const numMemberPrice = memberPrice ? Number(memberPrice) : undefined;

    let baseSlug = generateSlug(name) || `drop-${Date.now()}`;
    let finalSlug = baseSlug;

    // Check slug collision in MongoDB or sampleProducts
    let slugExists = true;
    let counter = 0;
    while (slugExists) {
      if (process.env.MONGODB_URI) {
        await connectDB();
        const existing = await Product.findOne({ slug: finalSlug });
        if (!existing) {
          slugExists = false;
        } else {
          counter += 1;
          finalSlug = `${baseSlug}-${counter}`;
        }
      } else {
        const samples = getSampleProducts();
        const existing = samples.find((p) => p.slug === finalSlug);
        if (!existing) {
          slugExists = false;
        } else {
          counter += 1;
          finalSlug = `${baseSlug}-${counter}`;
        }
      }
    }

    const defaultSizes = sizes && sizes.length > 0 ? sizes : [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 10 },
    ];

    const defaultColors = colors && colors.length > 0 ? colors : [
      { name: 'Standard', hex: '#18181b' },
    ];

    const productPayload = {
      name: name.trim(),
      slug: finalSlug,
      category,
      subCategory: subCategory.trim() || (category === 'hoodies' ? 'Heavyweight Printed Hoodie' : 'Oversized Graphic Tee'),
      description: description.trim() || `Streetwear collection crafted with premium materials. Designed for all-day comfort and long-lasting print vibrant colors.`,
      price: numPrice,
      mrp: numMrp,
      memberPrice: numMemberPrice,
      images,
      colors: defaultColors,
      sizes: defaultSizes,
      fabric: fabric.trim() || (category === 'hoodies' ? '320 GSM Brushed Fleece' : '240 GSM Combed Cotton'),
      fit: fit === 'Regular' ? 'Regular' : 'Oversized',
      tags: tags.length ? tags : ['new'],
      badgeText: badgeText.trim() || 'NEW DROP',
      ratingAvg: 0,
      ratingCount: 0,
      isActive: true,
    };

    let savedProduct = null;

    if (process.env.MONGODB_URI) {
      await connectDB();
      const created = await Product.create(productPayload);
      savedProduct = JSON.parse(JSON.stringify(created));
    }

    // Always keep sampleProducts.json updated as persistent local backup
    const samples = getSampleProducts();
    const fallbackId = `p${Date.now()}`;
    const localEntry = {
      _id: savedProduct?._id || fallbackId,
      ...productPayload,
    };
    samples.unshift(localEntry);
    saveSampleProducts(samples);

    return NextResponse.json({
      success: true,
      message: 'Product launched successfully!',
      product: savedProduct || localEntry,
    });
  } catch (e) {
    console.error('Error creating product:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

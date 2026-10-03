import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import CustomOrder from '../../../../lib/models/CustomOrder';
import { requireAdmin } from '../../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_FILE = path.join(process.cwd(), 'lib', 'devCustomOrders.json');

export async function GET(req) {
  // Enforce Admin Authorization
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const customOrders = await CustomOrder.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ customOrders: JSON.parse(JSON.stringify(customOrders)) });
    }

    let customOrders = [];
    try {
      if (fs.existsSync(DEV_FILE)) {
        customOrders = JSON.parse(fs.readFileSync(DEV_FILE, 'utf8'));
      }
    } catch (e) {}

    return NextResponse.json({ customOrders });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import BulkOrder from '../../../../lib/models/BulkOrder';
import { requireAdmin } from '../../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_FILE = path.join(process.cwd(), 'lib', 'devBulkOrders.json');

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
      const bulkOrders = await BulkOrder.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ bulkOrders: JSON.parse(JSON.stringify(bulkOrders)) });
    }

    let bulkOrders = [];
    try {
      if (fs.existsSync(DEV_FILE)) {
        bulkOrders = JSON.parse(fs.readFileSync(DEV_FILE, 'utf8'));
      }
    } catch (e) {}

    return NextResponse.json({ bulkOrders });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

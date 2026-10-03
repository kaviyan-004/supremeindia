import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import BulkOrder from '../../../lib/models/BulkOrder';
import { getAuthenticatedUser } from '../../../lib/auth';
import fs from 'fs';
import path from 'path';

const DEV_FILE = path.join(process.cwd(), 'lib', 'devBulkOrders.json');

export async function POST(request) {
  try {
    const body = await request.json();

    // Bind authenticated user identity if logged in
    const sessionUser = getAuthenticatedUser(request);
    const bulkPayload = {
      ...body,
      user: sessionUser ? sessionUser.sub : null,
      email: sessionUser?.email || body.email,
    };

    if (!process.env.MONGODB_URI) {
      let bulkOrders = [];
      try {
        if (fs.existsSync(DEV_FILE)) {
          bulkOrders = JSON.parse(fs.readFileSync(DEV_FILE, 'utf8'));
        }
      } catch (e) {}

      const newBulk = {
        _id: `bulk_${Date.now()}`,
        ...bulkPayload,
        createdAt: new Date().toISOString(),
      };
      bulkOrders.unshift(newBulk);
      try {
        fs.writeFileSync(DEV_FILE, JSON.stringify(bulkOrders, null, 2), 'utf8');
      } catch (e) {}

      return NextResponse.json({ status: 'received', bulkOrder: newBulk });
    }

    await connectDB();
    const doc = await BulkOrder.create(bulkPayload);
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

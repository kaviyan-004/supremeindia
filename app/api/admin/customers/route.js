import { NextResponse } from 'next/server';
import { getAllCustomers, requireAdmin } from '../../../../lib/auth';

export async function GET(req) {
  // Enforce Admin Authorization
  try {
    requireAdmin(req);
  } catch (authError) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const customers = await getAllCustomers();
    return NextResponse.json({ customers });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAllProducts } from '../../../lib/data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const products = await getAllProducts({ category });
  return NextResponse.json(products);
}

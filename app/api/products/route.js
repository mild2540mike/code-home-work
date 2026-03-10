import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/app/lib/constants.js';

export function GET() {
  return NextResponse.json(PRODUCTS);
}

import { NextResponse } from 'next/server';
import { calculateOrder, checkRedOnlyOneOrder, checkRedSetCooldown, recordRedSetOrder } from '@/app/lib/calculator.js';


export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { items, memberCardNumber } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items must be a non-empty array.' }, { status: 400 });
  }

  const hasRedSet = items.some((i) => i.id === 'red' && i.quantity > 0);
  if (hasRedSet) {
    const cooldownError = checkRedSetCooldown();
    if (cooldownError) {
      return NextResponse.json({ error: cooldownError }, { status: 409 });
    }
    if (checkRedOnlyOneOrder(items)) {
      return NextResponse.json({ error: 'Only one Red set can be ordered at a time.' }, { status: 400 });
    }
  }

  try {
    const result = calculateOrder(items, memberCardNumber ?? null);
    if (hasRedSet) recordRedSetOrder();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

import { PRODUCTS, PAIR_DISCOUNT_IDS, PAIR_DISCOUNT_RATE, MEMBER_DISCOUNT_RATE } from './constants.js';
import { RED_SET_COOLDOWN_MS } from './constants.js';
let lastRedSetOrderTime = null;

export function buildOrderItems(quantities) {
  return Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => ({ id, quantity }));
}

export function calculateOrder(items, memberCardNumber) {
  const productMap = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  let subtotal = 0;
  const pairDiscounts = [];
  let totalPairDiscount = 0;

  for (const { id, quantity } of items) {
    if (!quantity || quantity <= 0) continue;

    const product = productMap[id];
    if (!product) throw new Error(`Unknown product: ${id}`);

    subtotal += product.price * quantity;

    if (PAIR_DISCOUNT_IDS.has(id)) {
      const pairs = Math.floor(quantity / 2);
      if (pairs > 0) {
        const discount = pairs * 2 * product.price * PAIR_DISCOUNT_RATE;
        totalPairDiscount += discount;
        pairDiscounts.push({ id, name: product.name, quantity, pairs, discount });
      }
    }
  }

  const afterPairDiscount = subtotal - totalPairDiscount;
  const hasMemberCard = Boolean(memberCardNumber && memberCardNumber.trim());
  const memberDiscount = hasMemberCard ? afterPairDiscount * MEMBER_DISCOUNT_RATE : 0;
  const total = afterPairDiscount - memberDiscount;

  return { subtotal, pairDiscounts, totalPairDiscount, memberDiscount, total, hasMemberCard };
}

export function checkRedSetCooldown() {
  const now = Date.now();
  if (lastRedSetOrderTime !== null && now - lastRedSetOrderTime < RED_SET_COOLDOWN_MS) {
    const remainingMin = Math.ceil((RED_SET_COOLDOWN_MS - (now - lastRedSetOrderTime)) / 60_000);
    return `Red set is currently unavailable. Please try again in ${remainingMin} minute(s).`;
  }
  return null;
}

export function checkRedOnlyOneOrder(items) {
  const redItem = items.find((i) => i.id === "red");
  return redItem && redItem.quantity > 1;
}

export function recordRedSetOrder() {
  lastRedSetOrderTime = Date.now();
}

export function resetRedSetCooldown() {
  lastRedSetOrderTime = null;
}
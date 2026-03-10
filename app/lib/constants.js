export const PRODUCTS = [
  { id: 'red',    name: 'Red set',    price: 50,  color: '#ef4444' },
  { id: 'green',  name: 'Green set',  price: 40,  color: '#22c55e' },
  { id: 'blue',   name: 'Blue set',   price: 30,  color: '#3b82f6' },
  { id: 'yellow', name: 'Yellow set', price: 50,  color: '#eab308' },
  { id: 'pink',   name: 'Pink set',   price: 80,  color: '#ec4899' },
  { id: 'purple', name: 'Purple set', price: 90,  color: '#a855f7' },
  { id: 'orange', name: 'Orange set', price: 120, color: '#f97316' },
];

export const PAIR_DISCOUNT_IDS = new Set(['orange', 'pink', 'green']);

export const PAIR_DISCOUNT_RATE = 0.05;
export const MEMBER_DISCOUNT_RATE = 0.10;
export const RED_SET_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

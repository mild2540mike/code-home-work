import {
  buildOrderItems,
  calculateOrder,
  checkRedSetCooldown,
  recordRedSetOrder,
  resetRedSetCooldown,
} from "../app/lib/calculator.js";
import {
  PRODUCTS,
  PAIR_DISCOUNT_IDS,
  PAIR_DISCOUNT_RATE,
  MEMBER_DISCOUNT_RATE,
  RED_SET_COOLDOWN_MS,
} from "../app/lib/constants.js";

describe("calculateOrder — basic pricing (all 7 products)", () => {
  test.each([
    ["red", 1, 50],
    ["green", 1, 40],
    ["blue", 1, 30],
    ["yellow", 1, 50],
    ["pink", 1, 80],
    ["purple", 1, 90],
    ["orange", 1, 120],
  ])("%s x1 = %i THB (no discount)", (id, qty, expected) => {
    const result = calculateOrder([{ id, quantity: qty }], null);
    expect(result.subtotal).toBe(expected);
    expect(result.total).toBe(expected);
    expect(result.totalPairDiscount).toBe(0);
  });
});

describe("calculateOrder — pair discount (Orange / Pink / Green only)", () => {
  test("Orange x2 → 1 pair: (120+120) - 5% = 228 THB", () => {
    const result = calculateOrder([{ id: "orange", quantity: 2 }], null);
    expect(result.subtotal).toBe(240);
    expect(result.pairDiscounts).toHaveLength(1);
    expect(result.pairDiscounts[0].pairs).toBe(1);
    expect(result.pairDiscounts[0].discount).toBe(240 * PAIR_DISCOUNT_RATE);
    expect(result.totalPairDiscount).toBe(12);
    expect(result.total).toBe(228);
  });

  test("Pink x4 → 2 pairs: (80+80)-5% + (80+80)-5% = 304 THB", () => {
    const result = calculateOrder([{ id: "pink", quantity: 4 }], null);
    expect(result.subtotal).toBe(320);
    expect(result.pairDiscounts[0].pairs).toBe(2);
    expect(result.totalPairDiscount).toBe(16);
    expect(result.total).toBe(304);
  });

  test("Green x3 → 1 pair + 1 single: (40+40)-5% + 40 = 116 THB", () => {
    const result = calculateOrder([{ id: "green", quantity: 3 }], null);
    expect(result.subtotal).toBe(120);
    expect(result.pairDiscounts[0].pairs).toBe(1);
    expect(result.totalPairDiscount).toBe(4);
    expect(result.total).toBe(116);
  });

  test("Orange x6 → 3 pairs discount", () => {
    const result = calculateOrder([{ id: "orange", quantity: 6 }], null);
    expect(result.subtotal).toBe(720);
    expect(result.pairDiscounts[0].pairs).toBe(3);
    expect(result.totalPairDiscount).toBe(36);
    expect(result.total).toBe(684);
  });

  test("pair discount quantity x1 (odd single) → no discount", () => {
    const result = calculateOrder([{ id: "orange", quantity: 1 }], null);
    expect(result.totalPairDiscount).toBe(0);
    expect(result.pairDiscounts).toHaveLength(0);
  });

  test("non-eligible items (Red, Blue, Yellow, Purple) x2 → no pair discount", () => {
    for (const id of ["red", "blue", "yellow", "purple"]) {
      const result = calculateOrder([{ id, quantity: 2 }], null);
      expect(result.totalPairDiscount).toBe(0);
      expect(result.pairDiscounts).toHaveLength(0);
    }
  });

  test("pairDiscounts list contains only eligible items", () => {
    const result = calculateOrder(
      [
        { id: "orange", quantity: 2 },
        { id: "red", quantity: 2 },
      ],
      null,
    );
    expect(result.pairDiscounts).toHaveLength(1);
    expect(result.pairDiscounts[0].id).toBe("orange");
  });
});

describe("calculateOrder — member card discount (10%)", () => {
  test("10% applied on total after pair discounts", () => {
    const result = calculateOrder([{ id: "red", quantity: 1 }], "MEMBER123");
    expect(result.memberDiscount).toBe(5);
    expect(result.total).toBe(45);
    expect(result.hasMemberCard).toBe(true);
  });

  test("member discount applies after pair discount (Orange x2)", () => {
    const result = calculateOrder([{ id: "orange", quantity: 2 }], "CARD001");
    expect(result.totalPairDiscount).toBe(12);
    expect(result.memberDiscount).toBeCloseTo(22.8);
    expect(result.total).toBeCloseTo(205.2);
  });

  test("null card number → no member discount", () => {
    const result = calculateOrder([{ id: "blue", quantity: 1 }], null);
    expect(result.hasMemberCard).toBe(false);
    expect(result.memberDiscount).toBe(0);
  });

  test("empty string card → no member discount", () => {
    const result = calculateOrder([{ id: "blue", quantity: 1 }], "");
    expect(result.hasMemberCard).toBe(false);
    expect(result.memberDiscount).toBe(0);
  });

  test("whitespace-only card → no member discount", () => {
    const result = calculateOrder([{ id: "red", quantity: 1 }], "   ");
    expect(result.hasMemberCard).toBe(false);
    expect(result.memberDiscount).toBe(0);
    expect(result.total).toBe(50);
  });
});

describe("calculateOrder — combined discounts", () => {
  test("multiple pair-eligible items each get their own pair discount", () => {
    const result = calculateOrder(
      [
        { id: "orange", quantity: 2 },
        { id: "pink", quantity: 2 },
      ],
      null,
    );
    expect(result.subtotal).toBe(400);
    expect(result.pairDiscounts).toHaveLength(2);
    expect(result.totalPairDiscount).toBe(20);
    expect(result.total).toBe(380);
  });

  test("mixed items: Red x1 + Orange x2 + Blue x1, no member card", () => {
    const result = calculateOrder(
      [
        { id: "red", quantity: 1 },
        { id: "orange", quantity: 2 },
        { id: "blue", quantity: 1 },
      ],
      null,
    );
    expect(result.subtotal).toBe(320);
    expect(result.totalPairDiscount).toBe(12);
    expect(result.total).toBe(308);
  });

  test("mixed items with member card", () => {
    const result = calculateOrder(
      [
        { id: "red", quantity: 1 },
        { id: "orange", quantity: 2 },
        { id: "blue", quantity: 1 },
      ],
      "CARD999",
    );
    expect(result.memberDiscount).toBeCloseTo(30.8);
    expect(result.total).toBeCloseTo(277.2);
  });
});

describe("calculateOrder — edge cases", () => {
  test("throws for unknown product id", () => {
    expect(() => calculateOrder([{ id: "black", quantity: 1 }], null)).toThrow(
      "Unknown product",
    );
  });

  test("skips items with quantity 0", () => {
    const result = calculateOrder(
      [
        { id: "red", quantity: 0 },
        { id: "blue", quantity: 2 },
      ],
      null,
    );
    expect(result.subtotal).toBe(60);
  });

  test("skips items with negative quantity", () => {
    const result = calculateOrder(
      [
        { id: "red", quantity: -1 },
        { id: "blue", quantity: 2 },
      ],
      null,
    );
    expect(result.subtotal).toBe(60);
  });

  test("single item returns zero discounts", () => {
    const result = calculateOrder([{ id: "yellow", quantity: 1 }], null);
    expect(result.pairDiscounts).toHaveLength(0);
    expect(result.totalPairDiscount).toBe(0);
    expect(result.memberDiscount).toBe(0);
    expect(result.total).toBe(result.subtotal);
  });
});

describe("checkRedSetCooldown", () => {
  beforeEach(() => resetRedSetCooldown());
  afterAll(() => resetRedSetCooldown());

  test("returns null when no order has been recorded yet", () => {
    expect(checkRedSetCooldown()).toBeNull();
  });

  test("returns null immediately after cooldown period expires", () => {
    const realNow = Date.now;
    const base = 1_000_000;
    Date.now = jest
      .fn()
      .mockReturnValueOnce(base)
      .mockReturnValueOnce(base + RED_SET_COOLDOWN_MS);
    recordRedSetOrder();
    expect(checkRedSetCooldown()).toBeNull();
    Date.now = realNow;
  });

  test("returns error string when within cooldown period", () => {
    const realNow = Date.now;
    const base = 1_000_000;
    Date.now = jest
      .fn()
      .mockReturnValueOnce(base)
      .mockReturnValueOnce(base + 30 * 60 * 1000);
    recordRedSetOrder();
    const msg = checkRedSetCooldown();
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/Red set is currently unavailable/);
    expect(msg).toMatch(/30 minute/);
    Date.now = realNow;
  });

  test("remaining minutes rounds up correctly (1 ms remaining → 1 minute)", () => {
    const realNow = Date.now;
    const base = 1_000_000;
    Date.now = jest
      .fn()
      .mockReturnValueOnce(base)
      .mockReturnValueOnce(base + RED_SET_COOLDOWN_MS - 1);
    recordRedSetOrder();
    const msg = checkRedSetCooldown();
    expect(msg).toMatch(/1 minute/);
    Date.now = realNow;
  });

  test("returns null again after reset", () => {
    recordRedSetOrder();
    resetRedSetCooldown();
    expect(checkRedSetCooldown()).toBeNull();
  });
});

describe("buildOrderItems", () => {
  test("filters out items with quantity 0", () => {
    const result = buildOrderItems({ red: 0, blue: 2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ id: "blue", quantity: 2 });
  });

  test("returns empty array when all quantities are 0", () => {
    expect(buildOrderItems({ red: 0, blue: 0 })).toEqual([]);
  });

  test("returns empty array for empty input", () => {
    expect(buildOrderItems({})).toEqual([]);
  });

  test("includes all positive quantities", () => {
    const result = buildOrderItems({ red: 1, green: 2, blue: 3 });
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: "red", quantity: 1 });
    expect(result).toContainEqual({ id: "green", quantity: 2 });
    expect(result).toContainEqual({ id: "blue", quantity: 3 });
  });

  test("output shape has id and quantity only", () => {
    const result = buildOrderItems({ orange: 5 });
    expect(Object.keys(result[0])).toEqual(["id", "quantity"]);
  });
});

describe("products constants", () => {
  test("PRODUCTS has exactly 7 items", () => {
    expect(PRODUCTS).toHaveLength(7);
  });

  test("all products have required fields with correct types", () => {
    for (const p of PRODUCTS) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.name).toBe("string");
      expect(typeof p.price).toBe("number");
      expect(p.price).toBeGreaterThan(0);
      expect(typeof p.color).toBe("string");
    }
  });

  test("PAIR_DISCOUNT_IDS contains only orange, pink, green", () => {
    expect(PAIR_DISCOUNT_IDS.size).toBe(3);
    expect(PAIR_DISCOUNT_IDS.has("orange")).toBe(true);
    expect(PAIR_DISCOUNT_IDS.has("pink")).toBe(true);
    expect(PAIR_DISCOUNT_IDS.has("green")).toBe(true);
  });

  test("PAIR_DISCOUNT_RATE is 5%", () => {
    expect(PAIR_DISCOUNT_RATE).toBe(0.05);
  });

  test("MEMBER_DISCOUNT_RATE is 10%", () => {
    expect(MEMBER_DISCOUNT_RATE).toBe(0.1);
  });

  test("RED_SET_COOLDOWN_MS is 1 hour", () => {
    expect(RED_SET_COOLDOWN_MS).toBe(60 * 60 * 1000);
  });
});

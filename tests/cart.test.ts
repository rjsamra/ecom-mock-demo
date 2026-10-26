import { formatMoney } from "@/lib/money";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  quoteCart,
  shippingFor,
} from "@/features/cart/pricing";
import {
  addItem,
  reconcileCart,
  removeItem,
  setQuantity,
} from "@/features/cart/operations";
import type { Product } from "@/types/product";
import { describe, expect, it } from "vitest";

const lamp: Product = {
  id: "lamp",
  name: "Desk Lamp",
  description: "A lamp",
  category: "home",
  priceCents: 2000,
  rating: 4.5,
  stock: 2,
  image: "/products/lamp.svg",
  featured: false,
};

const candle: Product = {
  id: "candle",
  name: "Cedar Candle",
  description: "A candle",
  category: "home",
  priceCents: 2800,
  rating: 4,
  stock: 0,
  image: "/products/candle.svg",
  featured: false,
};

const catalog = [lamp, candle];

describe("cart operations", () => {
  it("adds a product and merges a second add up to the stock limit", () => {
    const first = addItem([], "lamp", 1, catalog);
    expect(first).toMatchObject({
      status: "ok",
      lines: [{ productId: "lamp", quantity: 1 }],
    });

    const second = addItem(first.lines, "lamp", 1, catalog);
    expect(second).toMatchObject({
      status: "ok",
      lines: [{ productId: "lamp", quantity: 2 }],
    });

    const third = addItem(second.lines, "lamp", 1, catalog);
    expect(third.status).toBe("adjusted");
    expect(third.lines).toEqual([{ productId: "lamp", quantity: 2 }]);
  });

  it("rejects unknown products, sold-out products, and invalid quantities", () => {
    expect(addItem([], "missing", 1, catalog).status).toBe("unknown-product");
    expect(addItem([], "candle", 1, catalog)).toMatchObject({
      status: "out-of-stock",
      lines: [],
    });
    expect(addItem([], "lamp", 1.5, catalog).lines).toEqual([]);
    expect(addItem([], "lamp", 0, catalog).status).toBe("invalid-quantity");
  });

  it("updates, clamps, and removes quantities", () => {
    const updated = setQuantity([{ productId: "lamp", quantity: 1 }], "lamp", 2, catalog);
    expect(updated.lines).toEqual([{ productId: "lamp", quantity: 2 }]);

    const clamped = setQuantity(updated.lines, "lamp", 8, catalog);
    expect(clamped).toMatchObject({
      status: "adjusted",
      quantity: 2,
      lines: [{ productId: "lamp", quantity: 2 }],
    });

    expect(setQuantity(clamped.lines, "lamp", 0, catalog).lines).toEqual([]);
    expect(removeItem([{ productId: "lamp", quantity: 2 }], "lamp")).toEqual([]);
  });

  it("reconciles stored lines against current stock", () => {
    expect(
      reconcileCart(
        [
          { productId: "lamp", quantity: 9 },
          { productId: "candle", quantity: 1 },
          { productId: "missing", quantity: 1 },
          { productId: "lamp", quantity: 0 },
        ],
        catalog,
      ),
    ).toEqual([{ productId: "lamp", quantity: 2 }]);
  });
});

describe("pricing", () => {
  it("formats USD from integer cents", () => {
    expect(formatMoney(895)).toBe("$8.95");
    expect(formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)).toBe("$75.00");
  });

  it("charges flat shipping below $75 and nothing at the threshold", () => {
    expect(shippingFor(0)).toBe(0);
    expect(shippingFor(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(STANDARD_SHIPPING_CENTS);
    expect(shippingFor(FREE_SHIPPING_THRESHOLD_CENTS)).toBe(0);
  });

  it("prices lines from the catalog and ignores a forged unit price", () => {
    const quote = quoteCart(
      [
        {
          productId: "lamp",
          quantity: 2,
          unitPriceCents: 1,
        } as { productId: string; quantity: number },
      ],
      catalog,
    );
    expect(quote).toMatchObject({
      ok: true,
      subtotalCents: 4000,
      shippingCents: STANDARD_SHIPPING_CENTS,
      totalCents: 4000 + STANDARD_SHIPPING_CENTS,
      amountUntilFreeShippingCents: FREE_SHIPPING_THRESHOLD_CENTS - 4000,
    });
  });

  it("refuses to price an empty cart or a quantity above stock", () => {
    expect(quoteCart([], catalog)).toMatchObject({ ok: false, code: "empty" });
    expect(quoteCart([{ productId: "lamp", quantity: 3 }], catalog)).toMatchObject({
      ok: false,
      code: "insufficient-stock",
      productId: "lamp",
    });
    expect(quoteCart([{ productId: "missing", quantity: 1 }], catalog)).toMatchObject({
      ok: false,
      code: "unknown-product",
    });
  });
});

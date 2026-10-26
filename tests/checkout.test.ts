import { STANDARD_SHIPPING_CENTS } from "@/features/cart/pricing";
import { placeOrderAction } from "@/features/checkout/actions";
import { createOrderReference, placeOrder } from "@/features/checkout/place-order";
import { checkoutSchema } from "@/features/checkout/schema";
import type { Product } from "@/types/product";
import { describe, expect, it } from "vitest";

const lamp: Product = {
  id: "brass-desk-lamp",
  name: "Brass Desk Lamp",
  description: "A lamp",
  category: "home",
  priceCents: 14500,
  rating: 4.8,
  stock: 3,
  image: "/products/brass-desk-lamp.svg",
  featured: true,
};

const candle: Product = {
  id: "cedar-candle",
  name: "Scented Cedar Candle",
  description: "A candle",
  category: "home",
  priceCents: 2800,
  rating: 4.3,
  stock: 10,
  image: "/products/cedar-candle.svg",
  featured: false,
};

const placedAt = new Date("2026-04-02T15:04:00.000Z");

const validCustomer = {
  fullName: "Avery Chen",
  email: "avery@example.com",
  phone: "(415) 555-0138",
  addressLine1: "18 Market Street",
  addressLine2: "",
  city: "San Francisco",
  region: "CA",
  postalCode: "94107",
  country: "United States",
};

describe("checkout schema", () => {
  it("accepts a complete United States address and trims the name", () => {
    const parsed = checkoutSchema.parse({
      ...validCustomer,
      fullName: "  Avery Chen  ",
    });
    expect(parsed.fullName).toBe("Avery Chen");
    expect(parsed.country).toBe("United States");
  });

  it("checks postal codes for each supported country", () => {
    expect(
      checkoutSchema.safeParse({ ...validCustomer, postalCode: "9410" }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...validCustomer,
        country: "Canada",
        postalCode: "K1A 0B1",
      }).success,
    ).toBe(true);
    expect(
      checkoutSchema.safeParse({
        ...validCustomer,
        country: "Canada",
        postalCode: "94107",
      }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...validCustomer,
        country: "United Kingdom",
        postalCode: "SW1A 1AA",
      }).success,
    ).toBe(true);
    expect(
      checkoutSchema.safeParse({
        ...validCustomer,
        country: "United Kingdom",
        postalCode: "94107",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing name, a bad email, and a short phone number", () => {
    const parsed = checkoutSchema.safeParse({
      ...validCustomer,
      fullName: "A",
      email: "not-an-email",
      phone: "123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["fullName", "email", "phone"]));
    }
  });
});

describe("placeOrder", () => {
  it("confirms an order with catalog prices and a stable reference", () => {
    const input = {
      customer: validCustomer,
      lines: [{ productId: "cedar-candle", quantity: 2, unitPriceCents: 1 }],
      catalog: [lamp, candle],
      placedAt,
    };
    const first = placeOrder(input);
    const second = placeOrder(input);

    expect(first.ok).toBe(true);
    expect(second).toEqual(first);
    if (first.ok) {
      expect(first.order.reference).toMatch(/^SS-[A-Z0-9]{8}$/);
      expect(first.order.subtotalCents).toBe(5600);
      expect(first.order.shippingCents).toBe(STANDARD_SHIPPING_CENTS);
      expect(first.order.totalCents).toBe(5600 + STANDARD_SHIPPING_CENTS);
      expect(first.order.lines[0]?.unitPriceCents).toBe(2800);
    }
  });

  it("ships an order of exactly $75 for free", () => {
    const result = placeOrder({
      customer: validCustomer,
      lines: [{ productId: "brass-desk-lamp", quantity: 1 }],
      catalog: [{ ...lamp, priceCents: 7500 }],
      placedAt,
    });
    expect(result.ok && result.order.shippingCents).toBe(0);
    expect(result.ok && result.order.totalCents).toBe(7500);
  });

  it("returns field errors and does not confirm an invalid customer", () => {
    const result = placeOrder({
      customer: { ...validCustomer, email: "bad" },
      lines: [{ productId: "cedar-candle", quantity: 1 }],
      catalog: [candle],
      placedAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.email).toBe("Enter a valid email address.");
      expect(result).not.toHaveProperty("order");
    }
  });

  it("rejects an empty cart, an unknown product, and a quantity over stock", () => {
    expect(
      placeOrder({
        customer: validCustomer,
        lines: [],
        catalog: [candle],
        placedAt,
      }),
    ).toMatchObject({ ok: false, formError: "Your cart is empty." });

    expect(
      placeOrder({
        customer: validCustomer,
        lines: [{ productId: "missing", quantity: 1 }],
        catalog: [candle],
        placedAt,
      }).ok,
    ).toBe(false);

    const overStock = placeOrder({
      customer: validCustomer,
      lines: [{ productId: "cedar-candle", quantity: 11 }],
      catalog: [candle],
      placedAt,
    });
    expect(overStock).toMatchObject({
      ok: false,
      formError: expect.stringMatching(/stock/i),
    });
  });

  it("changes the reference when the customer email changes", () => {
    const base = createOrderReference(
      "2026-04-02T15:04:00.000Z|avery@example.com|cedar-candle:1",
    );
    const other = createOrderReference(
      "2026-04-02T15:04:00.000Z|other@example.com|cedar-candle:1",
    );
    expect(base).not.toBe(other);
  });
});

describe("placeOrderAction", () => {
  it("reads the cart from the form and prices it from the catalog", async () => {
    const formData = new FormData();
    formData.set("fullName", validCustomer.fullName);
    formData.set("email", validCustomer.email);
    formData.set("phone", validCustomer.phone);
    formData.set("addressLine1", validCustomer.addressLine1);
    formData.set("addressLine2", "");
    formData.set("city", validCustomer.city);
    formData.set("region", validCustomer.region);
    formData.set("postalCode", validCustomer.postalCode);
    formData.set("country", validCustomer.country);
    formData.set(
      "lines",
      JSON.stringify([{ productId: "cedar-candle", quantity: 1, unitPriceCents: 1 }]),
    );

    const result = await placeOrderAction(null, formData);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.lines[0]?.unitPriceCents).toBe(2800);
      expect(result.order.totalCents).toBe(2800 + STANDARD_SHIPPING_CENTS);
      expect(result.order.reference).toMatch(/^SS-/);
    }
  });

  it("reports validation errors for an incomplete form", async () => {
    const result = await placeOrderAction(null, new FormData());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.formError).toBe("Your cart is empty.");
      expect(result.fieldErrors?.fullName).toBeTruthy();
      expect(result.fieldErrors?.email).toBeTruthy();
    }
  });
});

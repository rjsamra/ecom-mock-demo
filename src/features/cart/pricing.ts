import type { CartLine } from "@/types/cart";
import type { Category, Product } from "@/types/product";

/** Orders at or above this merchandise subtotal ship free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 7_500;

/** Flat shipping for every destination when the order is below the free-shipping threshold. */
export const STANDARD_SHIPPING_CENTS = 895;

export type QuoteLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  image: string;
  category: Category;
};

export type CartQuote =
  | {
      ok: true;
      lines: QuoteLine[];
      subtotalCents: number;
      shippingCents: number;
      totalCents: number;
      amountUntilFreeShippingCents: number;
    }
  | {
      ok: false;
      code: "empty" | "unknown-product" | "insufficient-stock" | "invalid-quantity";
      productId?: string;
    };

export function shippingFor(subtotalCents: number): number {
  if (subtotalCents <= 0) {
    return 0;
  }
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }
  return STANDARD_SHIPPING_CENTS;
}

export function quoteErrorMessage(
  code: Extract<CartQuote, { ok: false }>["code"],
): string {
  switch (code) {
    case "empty":
      return "Your cart is empty.";
    case "unknown-product":
      return "A product in your cart is no longer available. Remove it and try again.";
    case "insufficient-stock":
      return "One or more items exceed the available stock. Update the quantities and try again.";
    case "invalid-quantity":
      return "Enter a whole number quantity for each item.";
  }
}

/**
 * Prices and stock come from the catalog. Client-supplied unit prices are ignored
 * because this function never reads them.
 */
export function quoteCart(lines: CartLine[], catalog: Product[]): CartQuote {
  if (lines.length === 0) {
    return { ok: false, code: "empty" };
  }

  const priced: QuoteLine[] = [];
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      return {
        ok: false,
        code: "invalid-quantity",
        productId: line.productId,
      };
    }

    const product = catalog.find((item) => item.id === line.productId);
    if (!product) {
      return { ok: false, code: "unknown-product", productId: line.productId };
    }
    if (line.quantity > product.stock) {
      return {
        ok: false,
        code: "insufficient-stock",
        productId: line.productId,
      };
    }

    priced.push({
      productId: product.id,
      name: product.name,
      unitPriceCents: product.priceCents,
      quantity: line.quantity,
      lineTotalCents: product.priceCents * line.quantity,
      image: product.image,
      category: product.category,
    });
  }

  const subtotalCents = priced.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const shippingCents = shippingFor(subtotalCents);

  return {
    ok: true,
    lines: priced,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    amountUntilFreeShippingCents: Math.max(
      0,
      FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
    ),
  };
}

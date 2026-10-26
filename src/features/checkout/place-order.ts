import { quoteCart, quoteErrorMessage, type QuoteLine } from "@/features/cart/pricing";
import {
  checkoutSchema,
  fieldErrorsFromZod,
  type CheckoutDetails,
} from "@/features/checkout/schema";
import type { CartLine } from "@/types/cart";
import type { Product } from "@/types/product";
import { z } from "zod";

export type Order = {
  reference: string;
  placedAt: string;
  customer: CheckoutDetails;
  lines: QuoteLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | {
      ok: false;
      fieldErrors?: Record<string, string>;
      formError?: string;
    };

const lineSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

export function createOrderReference(seed: string): string {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  const code = (hash >>> 0).toString(36).toUpperCase().padStart(8, "0").slice(-8);
  return `SS-${code}`;
}

function referenceSeed(
  placedAt: Date,
  customer: CheckoutDetails,
  lines: QuoteLine[],
): string {
  const items = [...lines]
    .sort((left, right) => left.productId.localeCompare(right.productId))
    .map((line) => `${line.productId}:${line.quantity}`)
    .join(",");
  return `${placedAt.toISOString()}|${customer.email.toLowerCase()}|${items}`;
}

export function placeOrder(input: {
  customer: unknown;
  lines: unknown;
  catalog: Product[];
  placedAt: Date;
}): PlaceOrderResult {
  const customerParsed = checkoutSchema.safeParse(input.customer);
  const fieldErrors = customerParsed.success
    ? undefined
    : fieldErrorsFromZod(customerParsed.error);

  if (!Array.isArray(input.lines) || input.lines.length === 0) {
    return { ok: false, fieldErrors, formError: "Your cart is empty." };
  }

  const linesParsed = z.array(lineSchema).safeParse(input.lines);
  if (!linesParsed.success) {
    return {
      ok: false,
      fieldErrors,
      formError: "Your cart could not be verified. Refresh the page and try again.",
    };
  }

  if (!customerParsed.success) {
    return { ok: false, fieldErrors };
  }

  const quote = quoteCart(linesParsed.data satisfies CartLine[], input.catalog);
  if (!quote.ok) {
    return { ok: false, formError: quoteErrorMessage(quote.code) };
  }

  return {
    ok: true,
    order: {
      reference: createOrderReference(
        referenceSeed(input.placedAt, customerParsed.data, quote.lines),
      ),
      placedAt: input.placedAt.toISOString(),
      customer: customerParsed.data,
      lines: quote.lines,
      subtotalCents: quote.subtotalCents,
      shippingCents: quote.shippingCents,
      totalCents: quote.totalCents,
    },
  };
}

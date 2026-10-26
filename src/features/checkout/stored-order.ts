import { checkoutSchema, type CheckoutDetails } from "@/features/checkout/schema";
import type { Order } from "@/features/checkout/place-order";
import { z } from "zod";

export const LAST_ORDER_KEY = "shopsphere.last-order.v1";

const storedOrderSchema = z.object({
  reference: z.string().regex(/^SS-[A-Z0-9]{8}$/),
  placedAt: z.string(),
  customer: checkoutSchema,
  lines: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        unitPriceCents: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
        lineTotalCents: z.number().int().nonnegative(),
        image: z.string(),
        category: z.enum(["electronics", "clothing", "home", "accessories"]),
      }),
    )
    .min(1),
  subtotalCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
});

export function readStoredOrder(): Order | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = storedOrderSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      sessionStorage.removeItem(LAST_ORDER_KEY);
      return null;
    }
    return parsed.data satisfies Order;
  } catch {
    sessionStorage.removeItem(LAST_ORDER_KEY);
    return null;
  }
}

export function writeStoredOrder(order: Order) {
  sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
}

export function clearStoredOrder() {
  sessionStorage.removeItem(LAST_ORDER_KEY);
}

export type { CheckoutDetails };

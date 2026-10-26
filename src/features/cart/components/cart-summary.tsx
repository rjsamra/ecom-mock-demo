import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
  type CartQuote,
} from "@/features/cart/pricing";
import { formatMoney } from "@/lib/money";
import type { ReactNode } from "react";

export function CartSummary({
  quote,
  children,
}: {
  quote: Extract<CartQuote, { ok: true }>;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="order-summary-heading"
      className="h-fit rounded-lg border border-line bg-surface p-5"
    >
      <h2 id="order-summary-heading" className="font-display text-2xl text-navy">
        Order summary
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatMoney(quote.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Shipping</dt>
          <dd>{quote.shippingCents === 0 ? "Free" : formatMoney(quote.shippingCents)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(quote.totalCents)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-muted">
        {quote.shippingCents === 0
          ? "This order qualifies for free shipping."
          : `Add ${formatMoney(quote.amountUntilFreeShippingCents)} for free shipping.`}
      </p>
      <p className="mt-2 text-sm text-muted">
        Standard shipping is {formatMoney(STANDARD_SHIPPING_CENTS)} and is free from{" "}
        {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}, for every destination.
      </p>
      {children}
    </section>
  );
}

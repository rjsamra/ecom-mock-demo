import { formatMoney } from "@/lib/money";
import type { Order } from "@/features/checkout/place-order";
import { ButtonLink } from "@/components/button";

export function OrderConfirmation({
  order,
  onContinue,
}: {
  order: Order;
  onContinue?: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium tracking-wide text-brass uppercase">
        Order confirmed
      </p>
      <h1 className="mt-2 font-display text-4xl text-navy">
        Thank you, {order.customer.fullName}
      </h1>
      <p className="mt-4 text-sm text-muted">
        Your reference is{" "}
        <span className="font-mono text-base text-foreground">{order.reference}</span>. A
        receipt would be sent to {order.customer.email} in a live store.
      </p>
      <div
        role="note"
        className="mt-6 rounded-md border border-line bg-brass-soft px-4 py-3 text-sm"
      >
        This checkout is simulated. No payment has been processed and the order was not
        sent to a fulfillment system.
      </div>
      <h2 className="mt-8 font-display text-2xl text-navy">Items</h2>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {order.lines.map((line) => (
          <li key={line.productId} className="flex justify-between gap-4 py-3 text-sm">
            <span>
              {line.name} × {line.quantity}
            </span>
            <span>{formatMoney(line.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatMoney(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{order.shippingCents === 0 ? "Free" : formatMoney(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between text-base font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(order.totalCents)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted">
        {order.customer.addressLine1}
        {order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""},{" "}
        {order.customer.city}, {order.customer.region} {order.customer.postalCode},{" "}
        {order.customer.country}
      </p>
      {onContinue ? (
        <button
          type="button"
          className="mt-8 inline-flex rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white"
          onClick={onContinue}
        >
          Continue shopping
        </button>
      ) : (
        <div className="mt-8">
          <ButtonLink href="/products">Continue shopping</ButtonLink>
        </div>
      )}
    </div>
  );
}

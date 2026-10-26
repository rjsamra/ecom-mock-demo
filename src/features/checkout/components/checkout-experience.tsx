"use client";

import { ButtonLink } from "@/components/button";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { Field, fieldProps } from "@/components/field";
import { useCart } from "@/features/cart/cart-provider";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { quoteCart, quoteErrorMessage } from "@/features/cart/pricing";
import { getAllProducts } from "@/features/catalog/repository";
import { placeOrderAction } from "@/features/checkout/actions";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";
import { COUNTRIES } from "@/features/checkout/schema";
import {
  clearStoredOrder,
  readStoredOrder,
  writeStoredOrder,
} from "@/features/checkout/stored-order";
import type { Order, PlaceOrderResult } from "@/features/checkout/place-order";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";

function createOrderStore() {
  let ready = false;
  let order: Order | null = null;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      if (!ready) {
        order = readStoredOrder();
        ready = true;
      }
      return order;
    },
    getServerSnapshot() {
      return null;
    },
    save(next: Order) {
      order = next;
      ready = true;
      writeStoredOrder(next);
      emit();
    },
    clear() {
      order = null;
      ready = true;
      clearStoredOrder();
      emit();
    },
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Placing order" : "Place order"}
    </button>
  );
}

export function CheckoutExperience() {
  const { lines, hydrated, clear } = useCart();
  const router = useRouter();
  const [orderStore] = useState(() => createOrderStore());
  const storedOrder = useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getSnapshot,
    orderStore.getServerSnapshot,
  );
  const [state, formAction] = useActionState(
    async (previous: PlaceOrderResult | null, formData: FormData) => {
      const result = await placeOrderAction(previous, formData);
      if (result.ok) {
        orderStore.save(result.order);
        clear();
      }
      return result;
    },
    null,
  );
  const quote = quoteCart(lines, getAllProducts());

  useEffect(() => {
    if (!state || state.ok || !state.fieldErrors) {
      return;
    }
    const firstInvalid = Object.keys(state.fieldErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }
  }, [state]);

  const confirmation =
    state?.ok === true ? state.order : lines.length === 0 ? storedOrder : null;

  if (!hydrated) {
    return (
      <Container className="py-8">
        <p aria-busy="true" className="text-sm text-muted">
          Loading checkout
        </p>
      </Container>
    );
  }

  if (confirmation) {
    return (
      <Container className="py-8 sm:py-10">
        <OrderConfirmation
          order={confirmation}
          onContinue={() => {
            orderStore.clear();
            router.push("/products");
          }}
        />
      </Container>
    );
  }

  if (!quote.ok) {
    const empty = quote.code === "empty";
    return (
      <Container className="py-8 sm:py-10">
        <h1 className="font-display text-4xl text-navy">Checkout</h1>
        <div className="mt-8">
          <EmptyState
            title={empty ? "Your cart is empty" : "Cart needs attention"}
            description={
              empty
                ? "Add a product before checking out. Payment is not collected in this demo."
                : quoteErrorMessage(quote.code)
            }
          >
            <ButtonLink href={empty ? "/products" : "/cart"}>
              {empty ? "Browse products" : "Review cart"}
            </ButtonLink>
          </EmptyState>
        </div>
      </Container>
    );
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const formError = state && !state.ok ? state.formError : undefined;

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="font-display text-4xl text-navy">Checkout</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Enter a shipping address to place a simulated order. No payment is processed.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="lines" value={JSON.stringify(lines)} />
          {formError ? (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-surface px-4 py-3 text-sm text-danger"
            >
              {formError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" error={fieldErrors?.fullName}>
              <input
                {...fieldProps("fullName", fieldErrors?.fullName)}
                autoComplete="name"
                required
              />
            </Field>
            <Field id="email" label="Email" error={fieldErrors?.email}>
              <input
                {...fieldProps("email", fieldErrors?.email)}
                type="email"
                autoComplete="email"
                required
              />
            </Field>
            <Field id="phone" label="Phone" error={fieldErrors?.phone}>
              <input
                {...fieldProps("phone", fieldErrors?.phone)}
                type="tel"
                autoComplete="tel"
                required
              />
            </Field>
            <Field id="country" label="Country" error={fieldErrors?.country}>
              <select
                {...fieldProps("country", fieldErrors?.country)}
                autoComplete="country-name"
                defaultValue="United States"
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            id="addressLine1"
            label="Street address"
            error={fieldErrors?.addressLine1}
          >
            <input
              {...fieldProps("addressLine1", fieldErrors?.addressLine1)}
              autoComplete="address-line1"
              required
            />
          </Field>
          <Field
            id="addressLine2"
            label="Apartment, suite (optional)"
            error={fieldErrors?.addressLine2}
          >
            <input
              {...fieldProps("addressLine2", fieldErrors?.addressLine2)}
              autoComplete="address-line2"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="city" label="City" error={fieldErrors?.city}>
              <input
                {...fieldProps("city", fieldErrors?.city)}
                autoComplete="address-level2"
                required
              />
            </Field>
            <Field id="region" label="State or region" error={fieldErrors?.region}>
              <input
                {...fieldProps("region", fieldErrors?.region)}
                autoComplete="address-level1"
                required
              />
            </Field>
            <Field id="postalCode" label="Postal code" error={fieldErrors?.postalCode}>
              <input
                {...fieldProps("postalCode", fieldErrors?.postalCode)}
                autoComplete="postal-code"
                required
              />
            </Field>
          </div>
          <SubmitButton />
        </form>
        <CartSummary quote={quote} />
      </div>
    </Container>
  );
}

"use client";

import { buttonClasses } from "@/components/button";
import { useCart } from "@/features/cart/cart-provider";
import type { CartResult } from "@/features/cart/operations";
import { QuantityInput } from "@/components/quantity-input";
import { useState } from "react";

function messageFor(result: CartResult, name: string): string {
  switch (result.status) {
    case "ok":
      return `${name} added to your cart.`;
    case "adjusted":
      return `Only ${result.quantity} are available. Your cart has been updated.`;
    case "out-of-stock":
      return `${name} is out of stock.`;
    case "unknown-product":
      return "That product is no longer available.";
    case "invalid-quantity":
      return "Enter a valid quantity.";
  }
}

export function AddToCart({
  productId,
  name,
  stock,
}: {
  productId: string;
  name: string;
  stock: number;
}) {
  const { addItem, hydrated } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const soldOut = stock < 1;

  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hydrated || soldOut) {
          return;
        }
        const result = addItem(productId, quantity);
        setMessage(messageFor(result, name));
      }}
    >
      {soldOut ? null : (
        <QuantityInput
          id={`${productId}-quantity`}
          value={quantity}
          max={stock}
          onChange={setQuantity}
        />
      )}
      <button
        type="submit"
        className={buttonClasses("primary")}
        disabled={soldOut || !hydrated}
      >
        Add to cart
      </button>
      {message ? (
        <p role="status" className="text-sm text-navy">
          {message}
        </p>
      ) : null}
    </form>
  );
}

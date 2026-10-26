"use client";

import { ButtonLink } from "@/components/button";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { ProductImage } from "@/components/product-image";
import { QuantityInput } from "@/components/quantity-input";
import { useCart } from "@/features/cart/cart-provider";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { quoteCart, quoteErrorMessage } from "@/features/cart/pricing";
import { getAllProducts, getProductById } from "@/features/catalog/repository";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export function CartView() {
  const { lines, hydrated, notice, dismissNotice, setQuantity, removeItem } = useCart();
  const catalog = getAllProducts();
  const quote = quoteCart(lines, catalog);

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="font-display text-4xl text-navy">Your cart</h1>
      {!hydrated ? (
        <p className="mt-8 text-sm text-muted" aria-busy="true">
          Loading your cart
        </p>
      ) : lines.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Add a product from the shop, then come back here to review it."
          >
            <ButtonLink href="/products">Browse products</ButtonLink>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {notice ? (
              <p
                role="status"
                className="mb-4 flex items-start justify-between gap-4 rounded-md border border-line bg-brass-soft px-4 py-3 text-sm"
              >
                <span>{notice}</span>
                <button type="button" onClick={dismissNotice}>
                  Dismiss
                </button>
              </p>
            ) : null}
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((line) => {
                const product = getProductById(line.productId);
                if (!product) {
                  return null;
                }
                return (
                  <li
                    key={line.productId}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className="relative block aspect-square overflow-hidden rounded-md bg-brass-soft"
                    >
                      <ProductImage src={product.image} alt="" sizes="104px" />
                    </Link>
                    <div className="flex min-w-0 flex-col gap-3">
                      <div>
                        <h2 className="font-medium">
                          <Link href={`/products/${product.id}`}>{product.name}</Link>
                        </h2>
                        <p className="text-sm text-muted">
                          {formatMoney(product.priceCents)} each
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <QuantityInput
                          id={`cart-${product.id}`}
                          value={line.quantity}
                          max={product.stock}
                          onChange={(quantity) => {
                            setQuantity(product.id, quantity);
                          }}
                        />
                        <button
                          type="button"
                          className="text-sm text-navy underline-offset-2 hover:underline"
                          onClick={() => removeItem(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="col-span-2 text-sm font-medium sm:col-span-1 sm:text-right">
                      {formatMoney(product.priceCents * line.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          {quote.ok ? (
            <CartSummary quote={quote}>
              <ButtonLink href="/checkout" className="mt-5 w-full">
                Checkout
              </ButtonLink>
            </CartSummary>
          ) : (
            <p role="alert" className="text-sm text-danger">
              {quoteErrorMessage(quote.code)}
            </p>
          )}
        </div>
      )}
    </Container>
  );
}

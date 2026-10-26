import type { CartLine } from "@/types/cart";
import type { Product } from "@/types/product";

export type CartStatus =
  "ok" | "adjusted" | "unknown-product" | "out-of-stock" | "invalid-quantity";

export type CartResult = {
  lines: CartLine[];
  status: CartStatus;
  productId: string;
  quantity?: number;
};

function findProduct(catalog: Product[], productId: string): Product | null {
  return catalog.find((product) => product.id === productId) ?? null;
}

export function addItem(
  lines: CartLine[],
  productId: string,
  quantity: number,
  catalog: Product[],
): CartResult {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { lines, status: "invalid-quantity", productId };
  }

  const product = findProduct(catalog, productId);
  if (!product) {
    return { lines, status: "unknown-product", productId };
  }
  if (product.stock < 1) {
    return { lines, status: "out-of-stock", productId };
  }

  const current = lines.find((line) => line.productId === productId)?.quantity ?? 0;
  const nextQuantity = Math.min(current + quantity, product.stock);
  const nextLines = lines.some((line) => line.productId === productId)
    ? lines.map((line) =>
        line.productId === productId ? { productId, quantity: nextQuantity } : line,
      )
    : [...lines, { productId, quantity: nextQuantity }];

  if (nextQuantity < current + quantity) {
    return {
      lines: nextLines,
      status: "adjusted",
      productId,
      quantity: nextQuantity,
    };
  }

  return { lines: nextLines, status: "ok", productId, quantity: nextQuantity };
}

export function setQuantity(
  lines: CartLine[],
  productId: string,
  quantity: number,
  catalog: Product[],
): CartResult {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { lines, status: "invalid-quantity", productId };
  }
  if (quantity === 0) {
    return {
      lines: removeItem(lines, productId),
      status: "ok",
      productId,
      quantity: 0,
    };
  }

  const product = findProduct(catalog, productId);
  if (!product) {
    return { lines, status: "unknown-product", productId };
  }
  if (product.stock < 1) {
    return {
      lines: removeItem(lines, productId),
      status: "out-of-stock",
      productId,
    };
  }

  const nextQuantity = Math.min(quantity, product.stock);
  const exists = lines.some((line) => line.productId === productId);
  const nextLines = exists
    ? lines.map((line) =>
        line.productId === productId ? { productId, quantity: nextQuantity } : line,
      )
    : [...lines, { productId, quantity: nextQuantity }];

  return {
    lines: nextLines,
    status: nextQuantity === quantity ? "ok" : "adjusted",
    productId,
    quantity: nextQuantity,
  };
}

export function removeItem(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId);
}

/**
 * Drops unknown and sold-out products, and clamps every quantity to current stock.
 * The returned lines are safe to price and to submit at checkout.
 */
export function reconcileCart(lines: CartLine[], catalog: Product[]): CartLine[] {
  const reconciled: CartLine[] = [];
  for (const line of lines) {
    const product = findProduct(catalog, line.productId);
    if (!product || product.stock < 1) {
      continue;
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      continue;
    }
    reconciled.push({
      productId: line.productId,
      quantity: Math.min(line.quantity, product.stock),
    });
  }
  return reconciled;
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

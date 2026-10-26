"use client";

import {
  addItem as addCartItem,
  cartItemCount,
  reconcileCart,
  removeItem as removeCartItem,
  setQuantity as setCartQuantity,
  type CartResult,
} from "@/features/cart/operations";
import { getAllProducts } from "@/features/catalog/repository";
import type { CartLine } from "@/types/cart";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { z } from "zod";

export const CART_STORAGE_KEY = "shopsphere.cart.v1";

const storedCartSchema = z.object({
  version: z.literal(1),
  lines: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

type Snapshot = {
  lines: CartLine[];
  notice: string | null;
  hydrated: boolean;
};

const SERVER_SNAPSHOT: Snapshot = {
  lines: [],
  notice: null,
  hydrated: false,
};

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  notice: string | null;
  dismissNotice: () => void;
  addItem: (productId: string, quantity: number) => CartResult;
  setQuantity: (productId: string, quantity: number) => CartResult;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.lines : [];
  } catch {
    return [];
  }
}

function createCartStore(initialLines?: CartLine[]) {
  let snapshot: Snapshot = initialLines
    ? {
        lines: reconcileCart(initialLines, getAllProducts()),
        notice: null,
        hydrated: true,
      }
    : SERVER_SNAPSHOT;
  const listeners = new Set<() => void>();

  function persist(lines: CartLine[]) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, lines }));
  }

  function emit(next: Snapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function getSnapshot() {
    if (snapshot.hydrated) {
      return snapshot;
    }
    const stored = readStoredLines();
    const lines = reconcileCart(stored, getAllProducts());
    const notice =
      JSON.stringify(stored) !== JSON.stringify(lines) && stored.length > 0
        ? "Your cart was updated to match current stock."
        : null;
    snapshot = { lines, notice, hydrated: true };
    persist(lines);
    return snapshot;
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot,
    getServerSnapshot() {
      return initialLines ? snapshot : SERVER_SNAPSHOT;
    },
    addItem(productId: string, quantity: number) {
      const result = addCartItem(
        getSnapshot().lines,
        productId,
        quantity,
        getAllProducts(),
      );
      emit({ ...snapshot, lines: result.lines, hydrated: true });
      persist(result.lines);
      return result;
    },
    setQuantity(productId: string, quantity: number) {
      const result = setCartQuantity(
        getSnapshot().lines,
        productId,
        quantity,
        getAllProducts(),
      );
      emit({ ...snapshot, lines: result.lines, hydrated: true });
      persist(result.lines);
      return result;
    },
    removeItem(productId: string) {
      const lines = removeCartItem(getSnapshot().lines, productId);
      emit({ ...snapshot, lines, hydrated: true });
      persist(lines);
    },
    clear() {
      emit({ ...snapshot, lines: [], hydrated: true });
      persist([]);
    },
    dismissNotice() {
      emit({ ...snapshot, notice: null });
    },
  };
}

export function CartProvider({
  children,
  initialLines,
}: {
  children: ReactNode;
  initialLines?: CartLine[];
}) {
  const [store] = useState(() => createCartStore(initialLines));
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines: snapshot.lines,
      hydrated: snapshot.hydrated,
      itemCount: cartItemCount(snapshot.lines),
      notice: snapshot.notice,
      dismissNotice: store.dismissNotice,
      addItem: store.addItem,
      setQuantity: store.setQuantity,
      removeItem: store.removeItem,
      clear: store.clear,
    }),
    [snapshot, store],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return value;
}

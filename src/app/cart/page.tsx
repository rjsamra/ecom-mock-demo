import { CartView } from "@/features/cart/components/cart-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your ShopSphere cart.",
};

export default function CartPage() {
  return <CartView />;
}

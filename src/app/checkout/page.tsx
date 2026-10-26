import { CheckoutExperience } from "@/features/checkout/components/checkout-experience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place a simulated ShopSphere order. No payment is processed.",
};

export default function CheckoutPage() {
  return <CheckoutExperience />;
}

import { Container } from "@/components/container";
import { CATEGORY_CONTENT } from "@/features/catalog/categories";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from "@/features/cart/pricing";
import { formatMoney } from "@/lib/money";
import { CATEGORIES } from "@/types/product";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-navy text-white">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">ShopSphere</p>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            A mock storefront for workshop exercises. Orders are not fulfilled and no
            payment is collected.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-medium">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/products" className="hover:text-white">
                All products
              </Link>
            </li>
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/products?category=${category}`}
                  className="hover:text-white"
                >
                  {CATEGORY_CONTENT[category].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-medium">Ordering</h2>
          <p className="mt-3 text-sm text-white/80">
            Shipping is {formatMoney(STANDARD_SHIPPING_CENTS)}, or free from{" "}
            {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}. The rate is the same for every
            country offered at checkout.
          </p>
        </div>
      </Container>
    </footer>
  );
}

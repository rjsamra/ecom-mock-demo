"use client";

import { Container } from "@/components/container";
import { inputClass } from "@/components/field";
import { CATEGORY_CONTENT } from "@/features/catalog/categories";
import { CATEGORIES } from "@/types/product";
import { useCart } from "@/features/cart/cart-provider";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/features/cart/pricing";
import { formatMoney } from "@/lib/money";
import { cx } from "@/lib/cx";
import { Menu, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/products", label: "Shop" },
  ...CATEGORIES.map((category) => ({
    href: `/products?category=${category}`,
    label: CATEGORY_CONTENT[category].label,
  })),
];

function NavLinks({
  onNavigate,
}: {
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return NAV_LINKS.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="rounded-md px-2 py-2 text-sm hover:bg-brass-soft"
      onClick={onNavigate}
    >
      {link.label}
    </Link>
  ));
}

function closeDetails(event: MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

function SearchForm({ id }: { id: string }) {
  return (
    <form action="/products" method="get" role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search products"
        className={cx(inputClass, "pr-11")}
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md"
      >
        <Search aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}

export function Header() {
  const { itemCount, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <p className="bg-navy px-4 py-2 text-center text-xs text-white">
        Free shipping on orders of {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)} or more.
        Checkout is simulated.
      </p>
      <div className="relative">
        <Container className="flex items-center gap-3 py-3">
          <details className="md:hidden">
            <summary className="inline-flex size-11 cursor-pointer list-none items-center justify-center rounded-md [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open menu</span>
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute inset-x-0 top-full z-30 flex flex-col gap-1 border-b border-line bg-surface p-4"
            >
              <NavLinks onNavigate={closeDetails} />
            </nav>
          </details>
          <Link href="/" className="font-display text-2xl text-navy">
            ShopSphere
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
            <NavLinks />
          </nav>
          <div className="ml-auto hidden w-full max-w-xs sm:block">
            <SearchForm id="site-search" />
          </div>
          <Link
            href="/cart"
            className="relative inline-flex size-11 items-center justify-center rounded-md"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            <span className="absolute top-1 right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brass px-1 text-[11px] leading-4 text-white">
              {count}
            </span>
          </Link>
        </Container>
        <div className="px-4 pb-3 sm:hidden">
          <SearchForm id="site-search-mobile" />
        </div>
      </div>
    </header>
  );
}

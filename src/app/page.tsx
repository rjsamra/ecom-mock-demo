import { ButtonLink } from "@/components/button";
import { Container } from "@/components/container";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { CATEGORY_CONTENT } from "@/features/catalog/categories";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
} from "@/features/catalog/repository";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from "@/features/cart/pricing";
import { formatMoney } from "@/lib/money";
import { CATEGORIES } from "@/types/product";
import Link from "next/link";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const heroProduct = getProductById("meridian-wool-overcoat") ?? featured[0];
  const counts = new Map(
    CATEGORIES.map((category) => [
      category,
      getAllProducts().filter((product) => product.category === category).length,
    ]),
  );

  return (
    <>
      <section className="bg-navy text-white">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm tracking-[0.18em] text-brass-soft uppercase">
              The spring edit
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
              Everyday goods, chosen with care.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80">
              Electronics, clothing, home, and accessories from the ShopSphere catalog.
              Shipping is {formatMoney(STANDARD_SHIPPING_CENTS)}, and free from{" "}
              {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products" variant="inverse">
                Shop all
              </ButtonLink>
              <Link
                href="/products?category=electronics"
                className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Browse electronics
              </Link>
            </div>
          </div>
          {heroProduct ? (
            <Link
              href={`/products/${heroProduct.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 rounded-lg bg-surface p-4 text-foreground sm:p-6"
            >
              <div>
                <p className="text-xs tracking-wide text-muted uppercase">Featured</p>
                <p className="mt-2 font-display text-3xl text-navy">{heroProduct.name}</p>
                <p className="mt-2 text-sm text-muted">
                  {formatMoney(heroProduct.priceCents)}
                </p>
              </div>
              <div className="relative size-36 overflow-hidden rounded-md bg-brass-soft sm:size-48">
                <ProductImage src={heroProduct.image} alt="" sizes="192px" priority />
              </div>
            </Link>
          ) : null}
        </Container>
      </section>

      <Container className="py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-navy">Shop by category</h2>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                href={`/products?category=${category}`}
                className="flex h-full flex-col rounded-lg border border-line bg-surface p-5 hover:border-brass"
              >
                <h3 className="font-display text-2xl text-navy">
                  {CATEGORY_CONTENT[category].label}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {CATEGORY_CONTENT[category].description}
                </p>
                <p className="mt-6 text-sm">{counts.get(category)} products</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="pb-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-navy">Featured</h2>
          <Link
            href="/products"
            className="text-sm text-navy underline-offset-2 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured} />
        </div>
      </Container>

      <Container className="grid gap-4 py-14 md:grid-cols-2">
        <Link href="/products" className="rounded-lg bg-brass-soft p-6 sm:p-8">
          <h2 className="font-display text-3xl text-navy">Free shipping</h2>
          <p className="mt-3 max-w-sm text-sm text-foreground">
            Orders of {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)} or more ship free.
            Below that, shipping is a flat {formatMoney(STANDARD_SHIPPING_CENTS)}.
          </p>
        </Link>
        <Link
          href="/products?category=home"
          className="rounded-lg border border-line bg-surface p-6 sm:p-8"
        >
          <h2 className="font-display text-3xl text-navy">Home and living</h2>
          <p className="mt-3 max-w-sm text-sm text-muted">
            Lamps, linen, and tableware for the rooms you use every day.
          </p>
        </Link>
      </Container>
    </>
  );
}

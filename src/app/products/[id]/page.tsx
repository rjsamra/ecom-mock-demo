import { AddToCart } from "@/features/cart/components/add-to-cart";
import { categoryLabel } from "@/features/catalog/categories";
import {
  getAllProducts,
  getProductById,
  getRelatedProducts,
} from "@/features/catalog/repository";
import { Container } from "@/components/container";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { Rating } from "@/components/rating";
import { StockStatus } from "@/components/stock-status";
import { formatMoney } from "@/lib/money";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getAllProducts().map((product) => ({ id: product.id }));
}

export async function generateMetadata(
  props: PageProps<"/products/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Product" };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const product = getProductById(id);
  if (!product) {
    notFound();
  }
  const related = getRelatedProducts(product);

  return (
    <Container className="py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-foreground">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-foreground"
            >
              {categoryLabel(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-brass-soft">
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs tracking-wide text-muted uppercase">
            {categoryLabel(product.category)}
          </p>
          <h1 className="font-display text-4xl text-navy">{product.name}</h1>
          <Rating rating={product.rating} />
          <p className="text-2xl">{formatMoney(product.priceCents)}</p>
          <StockStatus stock={product.stock} />
          <p className="max-w-prose text-sm leading-6 text-muted">
            {product.description}
          </p>
          <AddToCart productId={product.id} name={product.name} stock={product.stock} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl text-navy">Related products</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </Container>
  );
}

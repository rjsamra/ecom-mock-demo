import { categoryLabel } from "@/features/catalog/categories";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/types/product";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { Rating } from "@/components/rating";
import { StockStatus } from "@/components/stock-status";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="h-full overflow-hidden rounded-lg border border-line bg-surface">
      <Link href={`/products/${product.id}`} className="flex h-full flex-col">
        <div className="relative aspect-square bg-brass-soft">
          <ProductImage
            src={product.image}
            alt=""
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          {product.stock <= 0 ? (
            <span
              aria-hidden="true"
              className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-danger"
            >
              Sold out
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs tracking-wide text-muted uppercase">
            {categoryLabel(product.category)}
          </p>
          <h3 className="text-base font-medium text-foreground">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <p className="font-medium">{formatMoney(product.priceCents)}</p>
            <Rating rating={product.rating} />
          </div>
          <StockStatus stock={product.stock} />
        </div>
      </Link>
    </article>
  );
}

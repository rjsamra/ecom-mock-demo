import { inputClass } from "@/components/field";
import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { ButtonLink } from "@/components/button";
import { categoryLabel } from "@/features/catalog/categories";
import {
  CategoryFilters,
  SortSelect,
} from "@/features/catalog/components/catalog-controls";
import { Pagination } from "@/features/catalog/components/pagination";
import { getAllProducts } from "@/features/catalog/repository";
import { parseCatalogQuery, queryCatalog } from "@/features/catalog/query";

export async function CatalogResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const result = queryCatalog(getAllProducts(), query);
  const title = query.category ? categoryLabel(query.category) : "Shop";
  const summary = query.q
    ? `${result.total} ${result.total === 1 ? "result" : "results"} for “${query.q}”`
    : `${result.total} ${result.total === 1 ? "product" : "products"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl text-navy">{title}</h1>
            <p className="mt-2 text-sm text-muted" aria-live="polite">
              {summary}
            </p>
          </div>
          <form action="/products" method="get" role="search" className="flex gap-2">
            {query.category ? (
              <input type="hidden" name="category" value={query.category} />
            ) : null}
            {query.sort !== "featured" ? (
              <input type="hidden" name="sort" value={query.sort} />
            ) : null}
            <label htmlFor="catalog-search" className="sr-only">
              Search products
            </label>
            <input
              id="catalog-search"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="Search products"
              className={inputClass}
            />
            <button type="submit" className="rounded-md bg-navy px-4 text-sm text-white">
              Search
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilters query={query} />
          <SortSelect query={query} />
        </div>
      </div>
      {result.items.length === 0 ? (
        <EmptyState
          title="No matching products"
          description="Try a different search or clear the filters to see the full shop."
        >
          <ButtonLink href="/products" variant="secondary">
            Clear filters
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <ProductGrid products={result.items} />
          <Pagination query={query} page={result.page} pageCount={result.pageCount} />
        </>
      )}
    </div>
  );
}

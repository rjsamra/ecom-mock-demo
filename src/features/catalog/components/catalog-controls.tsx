"use client";

import { inputClass } from "@/components/field";
import { CATEGORY_CONTENT, isCategory } from "@/features/catalog/categories";
import {
  catalogHref,
  type CatalogQuery,
  type SortOption,
} from "@/features/catalog/query";
import { cx } from "@/lib/cx";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORY_LINKS = [
  { id: null, label: "All" },
  ...Object.entries(CATEGORY_CONTENT).map(([id, content]) => ({
    id,
    label: content.label,
  })),
] as const;

export function SortSelect({ query }: { query: CatalogQuery }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        className={cx(inputClass, "w-auto")}
        value={query.sort}
        onChange={(event) => {
          const sort = event.target.value as SortOption;
          router.push(
            catalogHref({
              q: query.q,
              category: query.category,
              sort,
              page: 1,
            }),
          );
        }}
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="rating">Top rated</option>
        <option value="name">Name</option>
      </select>
    </label>
  );
}

export function CategoryFilters({ query }: { query: CatalogQuery }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
      {CATEGORY_LINKS.map((category) => {
        const id = category.id && isCategory(category.id) ? category.id : null;
        const selected = query.category === id;
        return (
          <Link
            key={category.label}
            href={catalogHref({
              q: query.q,
              category: id,
              sort: query.sort,
              page: 1,
            })}
            aria-current={selected ? "true" : undefined}
            className={cx(
              "rounded-full border px-3 py-1.5 text-sm",
              selected
                ? "border-navy bg-navy text-white"
                : "border-line bg-surface text-foreground hover:bg-brass-soft",
            )}
          >
            {category.label}
            {selected ? <span className="sr-only">, selected</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

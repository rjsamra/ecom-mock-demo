import { categoryLabel, isCategory } from "@/features/catalog/categories";
import type { Category, Product } from "@/types/product";

export const PAGE_SIZE = 8;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogQuery = {
  q: string;
  category: Category | null;
  sort: SortOption;
  page: number;
};

export type CatalogPage = {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function isSort(value: string): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export function parseCatalogQuery(
  params: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const q = firstParam(params.q).trim();
  const categoryParam = firstParam(params.category);
  const category = isCategory(categoryParam) ? categoryParam : null;
  const sortParam = firstParam(params.sort);
  const sort = isSort(sortParam) ? sortParam : "featured";
  const pageRaw = Number.parseInt(firstParam(params.page), 10);
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  return { q, category, sort, page };
}

function matchesSearch(product: Product, q: string): boolean {
  if (!q) {
    return true;
  }
  const haystack = [product.name, product.description, categoryLabel(product.category)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}

function compareProducts(sort: SortOption) {
  return (left: Product, right: Product) => {
    switch (sort) {
      case "price-asc":
        return left.priceCents - right.priceCents || left.name.localeCompare(right.name);
      case "price-desc":
        return right.priceCents - left.priceCents || left.name.localeCompare(right.name);
      case "rating":
        return right.rating - left.rating || left.name.localeCompare(right.name);
      case "name":
        return left.name.localeCompare(right.name);
      case "featured":
        return (
          Number(right.featured) - Number(left.featured) ||
          right.rating - left.rating ||
          left.name.localeCompare(right.name)
        );
    }
  };
}

export function queryCatalog(source: Product[], query: CatalogQuery): CatalogPage {
  const filtered = source.filter((product) => {
    if (query.category && product.category !== query.category) {
      return false;
    }
    return matchesSearch(product, query.q);
  });
  const sorted = [...filtered].sort(compareProducts(query.sort));
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: sorted.slice(start, start + PAGE_SIZE),
    total: sorted.length,
    page,
    pageCount,
    pageSize: PAGE_SIZE,
  };
}

export function catalogHref(
  query: Partial<CatalogQuery> & Pick<CatalogQuery, "q" | "category" | "sort">,
): string {
  const params = new URLSearchParams();
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.sort !== "featured") {
    params.set("sort", query.sort);
  }
  if (query.page && query.page > 1) {
    params.set("page", String(query.page));
  }
  const search = params.toString();
  return search ? `/products?${search}` : "/products";
}

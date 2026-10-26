import { products } from "@/data/products";
import { CATEGORY_CONTENT } from "@/features/catalog/categories";
import {
  PAGE_SIZE,
  catalogHref,
  parseCatalogQuery,
  queryCatalog,
} from "@/features/catalog/query";
import type { Product } from "@/types/product";
import { describe, expect, it } from "vitest";

function product(overrides: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    description: overrides.name,
    category: "home",
    priceCents: 1000,
    rating: 4,
    stock: 10,
    image: "/products/test.svg",
    featured: false,
    ...overrides,
  };
}

const fixture: Product[] = [
  product({
    id: "wool",
    name: "Wool Coat",
    category: "clothing",
    priceCents: 5000,
    rating: 4.2,
    featured: true,
    description: "warm wool",
  }),
  product({
    id: "lamp",
    name: "Desk Lamp",
    category: "home",
    priceCents: 1500,
    rating: 4.9,
    description: "brass lamp",
  }),
  product({
    id: "mug",
    name: "Cedar Mug",
    category: "home",
    priceCents: 800,
    rating: 3.5,
    description: "scented cedar",
  }),
  product({
    id: "hat",
    name: "Field Hat",
    category: "accessories",
    priceCents: 800,
    rating: 4.9,
    description: "canvas hat",
  }),
  product({
    id: "buds",
    name: "Aero Buds",
    category: "electronics",
    priceCents: 2000,
    rating: 4.1,
    description: "wireless audio",
  }),
  product({
    id: "shirt",
    name: "Oxford Shirt",
    category: "clothing",
    priceCents: 1200,
    rating: 4.4,
    description: "cotton shirt",
  }),
  product({
    id: "board",
    name: "Oak Board",
    category: "home",
    priceCents: 2200,
    rating: 4.0,
    description: "serving board",
  }),
  product({
    id: "belt",
    name: "Cotton Belt",
    category: "accessories",
    priceCents: 900,
    rating: 3.2,
    description: "woven belt",
  }),
  product({
    id: "hub",
    name: "USB Hub",
    category: "electronics",
    priceCents: 3000,
    rating: 4.6,
    description: "slate hub",
  }),
  product({
    id: "candle",
    name: "Cedar Candle",
    category: "home",
    priceCents: 600,
    rating: 4.8,
    featured: true,
    description: "room candle",
  }),
];

describe("catalog seed", () => {
  it("includes eight products in each category", () => {
    expect(products).toHaveLength(32);
    expect(new Set(products.map((item) => item.id)).size).toBe(32);
    for (const category of Object.keys(CATEGORY_CONTENT)) {
      expect(products.filter((item) => item.category === category)).toHaveLength(8);
    }
    expect(products.filter((item) => item.featured)).toHaveLength(4);
    expect(products.some((item) => item.stock === 0)).toBe(true);
    expect(
      products.every(
        (item) =>
          item.priceCents > 0 &&
          item.rating >= 0 &&
          item.rating <= 5 &&
          item.stock >= 0 &&
          item.image.startsWith("/products/"),
      ),
    ).toBe(true);
  });
});

describe("parseCatalogQuery", () => {
  it("falls back when the query is missing or invalid", () => {
    expect(parseCatalogQuery({})).toEqual({
      q: "",
      category: null,
      sort: "featured",
      page: 1,
    });
    expect(
      parseCatalogQuery({
        q: "  lamp ",
        category: "shoes",
        sort: "newest",
        page: "0",
      }),
    ).toEqual({
      q: "lamp",
      category: null,
      sort: "featured",
      page: 1,
    });
  });

  it("reads the first value when a parameter is repeated", () => {
    expect(
      parseCatalogQuery({
        category: ["clothing", "home"],
        sort: ["price-asc", "name"],
        page: ["2", "4"],
      }),
    ).toMatchObject({ category: "clothing", sort: "price-asc", page: 2 });
  });
});

describe("queryCatalog", () => {
  it("searches name and description without case sensitivity", () => {
    const page = queryCatalog(fixture, {
      q: "CEDAR",
      category: null,
      sort: "name",
      page: 1,
    });
    expect(page.items.map((item) => item.id)).toEqual(["candle", "mug"]);
    expect(page.total).toBe(2);
  });

  it("filters by category and sorts by price", () => {
    const page = queryCatalog(fixture, {
      q: "",
      category: "home",
      sort: "price-asc",
      page: 1,
    });
    expect(page.items.map((item) => item.id)).toEqual(["candle", "mug", "lamp", "board"]);
  });

  it("sorts featured products ahead of the rest", () => {
    const page = queryCatalog(fixture, {
      q: "",
      category: null,
      sort: "featured",
      page: 1,
    });
    expect(page.items.slice(0, 2).map((item) => item.id)).toEqual(["candle", "wool"]);
  });

  it("paginates and clamps a page past the end", () => {
    const page = queryCatalog(fixture, {
      q: "",
      category: null,
      sort: "name",
      page: 2,
    });
    expect(page.total).toBe(fixture.length);
    expect(page.pageCount).toBe(2);
    expect(page.pageSize).toBe(PAGE_SIZE);
    expect(page.items).toHaveLength(2);

    const clamped = queryCatalog(fixture, {
      q: "",
      category: null,
      sort: "name",
      page: 9,
    });
    expect(clamped.page).toBe(2);
    expect(clamped.items).toEqual(page.items);
  });

  it("returns an empty page when nothing matches", () => {
    const page = queryCatalog(fixture, {
      q: "missing-sku",
      category: "electronics",
      sort: "name",
      page: 3,
    });
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.page).toBe(1);
    expect(page.pageCount).toBe(1);
  });
});

describe("catalogHref", () => {
  it("omits default sort and the first page", () => {
    expect(catalogHref({ q: "", category: null, sort: "featured", page: 1 })).toBe(
      "/products",
    );
    expect(
      catalogHref({
        q: "lamp",
        category: "home",
        sort: "price-asc",
        page: 2,
      }),
    ).toBe("/products?q=lamp&category=home&sort=price-asc&page=2");
  });
});

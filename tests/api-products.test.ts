import { GET } from "@/app/api/products/route";
import { describe, expect, it } from "vitest";

describe("GET /api/products", () => {
  it("searches the catalog with the same query rules as the shop", async () => {
    const response = await GET(new Request("http://localhost/api/products?q=merino"));
    const body = (await response.json()) as {
      total: number;
      items: Array<{ id: string; priceCents: number }>;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.items[0]?.id).toBe("alta-merino-crewneck");
    expect(body.items[0]?.priceCents).toBe(9200);
  });

  it("filters a category", async () => {
    const response = await GET(
      new Request("http://localhost/api/products?category=electronics"),
    );
    const body = (await response.json()) as { total: number; pageCount: number };

    expect(body.total).toBe(8);
    expect(body.pageCount).toBe(1);
  });
});

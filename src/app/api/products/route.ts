import { getAllProducts } from "@/features/catalog/repository";
import { parseCatalogQuery, queryCatalog } from "@/features/catalog/query";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const result = queryCatalog(getAllProducts(), parseCatalogQuery(params));

  return Response.json({
    items: result.items,
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    pageSize: result.pageSize,
  });
}

import { catalogHref, type CatalogQuery } from "@/features/catalog/query";
import { cx } from "@/lib/cx";
import Link from "next/link";

export function Pagination({
  query,
  page,
  pageCount,
}: {
  query: CatalogQuery;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link
          href={catalogHref({ ...query, page: page - 1 })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border border-line px-3 py-2 text-sm text-muted">
          Previous
        </span>
      )}
      <ol className="flex flex-wrap gap-2">
        {pages.map((pageNumber) => (
          <li key={pageNumber}>
            {pageNumber === page ? (
              <span
                aria-current="page"
                className="inline-flex size-10 items-center justify-center rounded-md bg-navy text-sm text-white"
              >
                {pageNumber}
              </span>
            ) : (
              <Link
                href={catalogHref({ ...query, page: pageNumber })}
                className={cx(
                  "inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface text-sm",
                )}
              >
                {pageNumber}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {page < pageCount ? (
        <Link
          href={catalogHref({ ...query, page: page + 1 })}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-line px-3 py-2 text-sm text-muted">
          Next
        </span>
      )}
    </nav>
  );
}

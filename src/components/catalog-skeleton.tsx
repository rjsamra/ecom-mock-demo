export function CatalogSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Loading products</span>
      <div className="h-10 w-48 rounded-md bg-line" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-80 rounded-lg bg-line/70" />
        ))}
      </div>
    </div>
  );
}

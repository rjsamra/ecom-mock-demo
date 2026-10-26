import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Container } from "@/components/container";

export default function ProductsLoading() {
  return (
    <Container className="py-8 sm:py-10">
      <CatalogSkeleton />
    </Container>
  );
}

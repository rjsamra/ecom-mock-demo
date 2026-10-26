import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Container } from "@/components/container";

export default function ProductLoading() {
  return (
    <Container className="py-8">
      <CatalogSkeleton />
    </Container>
  );
}

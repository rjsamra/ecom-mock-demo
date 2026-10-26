import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Container } from "@/components/container";
import { CatalogResults } from "@/features/catalog/components/catalog-results";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the ShopSphere catalog.",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Container className="py-8 sm:py-10">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

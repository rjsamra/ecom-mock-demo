import { ButtonLink } from "@/components/button";
import { Container } from "@/components/container";

export default function ProductNotFound() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl text-navy">Product not found</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        That product is not in the catalog.
      </p>
      <div className="mt-6">
        <ButtonLink href="/products">Back to the shop</ButtonLink>
      </div>
    </Container>
  );
}

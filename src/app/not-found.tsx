import { ButtonLink } from "@/components/button";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl text-navy">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        That page is not part of the shop.
      </p>
      <div className="mt-6">
        <ButtonLink href="/products">Back to the shop</ButtonLink>
      </div>
    </Container>
  );
}

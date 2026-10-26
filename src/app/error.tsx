"use client";

import { Button } from "@/components/button";
import { Container } from "@/components/container";

export default function RouteError({
  reset,
}: {
  error: globalThis.Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl text-navy">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        This page could not be loaded. Try again, or return to the shop.
      </p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        Try again
      </Button>
    </Container>
  );
}

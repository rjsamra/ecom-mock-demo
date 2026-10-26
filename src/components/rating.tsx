import { Star } from "lucide-react";

export function Rating({ rating }: { rating: number }) {
  return (
    <p className="inline-flex items-center gap-1 text-sm text-muted">
      <Star aria-hidden="true" className="size-4 fill-brass text-brass" />
      <span>{rating.toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
    </p>
  );
}

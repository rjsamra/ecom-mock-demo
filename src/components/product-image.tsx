"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(src.length === 0);

  if (failed) {
    return (
      <div
        aria-hidden={alt.length === 0 ? true : undefined}
        role={alt.length === 0 ? undefined : "img"}
        aria-label={alt.length === 0 ? undefined : alt}
        className="flex h-full w-full items-center justify-center bg-brass-soft px-4 text-center"
      >
        <span className="font-display text-lg text-navy">
          {alt || "Image unavailable"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

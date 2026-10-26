import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

afterEach(() => {
  cleanup();
});

vi.mock("next/image", () => ({
  default: function Image({ alt }: ImgHTMLAttributes<HTMLImageElement>) {
    return <span role="img" aria-label={alt ?? ""} />;
  },
}));

vi.mock("next/link", () => ({
  default: function Link({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

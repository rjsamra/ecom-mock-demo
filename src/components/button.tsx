import { cx } from "@/lib/cx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "inverse" | "ghost";

export function buttonClasses(variant: Variant = "primary", className?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "bg-navy text-white hover:bg-navy-dark",
    variant === "secondary" &&
      "border border-line bg-surface text-foreground hover:bg-brass-soft",
    variant === "inverse" && "bg-surface text-navy hover:bg-brass-soft",
    variant === "ghost" && "text-navy hover:bg-brass-soft",
    className,
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}

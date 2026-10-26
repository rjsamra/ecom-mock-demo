import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground";

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, error?: string) {
  return error ? `${id}-error` : undefined;
}

export function fieldProps(id: string, error?: string, className?: string) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(id, error),
    className: cx(inputClass, error && "border-danger", className),
  };
}

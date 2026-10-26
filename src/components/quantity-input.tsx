"use client";

import { useClientReady } from "@/lib/use-client-ready";
import { Minus, Plus } from "lucide-react";

export function QuantityInput({
  id,
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: {
  id: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const ready = useClientReady();
  const locked = disabled || !ready;

  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center disabled:opacity-40"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={locked || value <= min}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <label htmlFor={id} className="sr-only">
        Quantity
      </label>
      <input
        id={id}
        className="w-12 border-0 bg-transparent text-center text-sm"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={locked}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          if (!Number.isInteger(next)) {
            return;
          }
          onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center disabled:opacity-40"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={locked || value >= max}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

"use client";

import { Minus, Plus, Users } from "lucide-react";
import { clsx } from "clsx";

const MIN = 1;
const MAX = 8;

export function ServingsSelector({
  value,
  baseline,
  setValue,
}: {
  value: number;
  baseline: number;
  setValue: (next: number | ((prev: number) => number)) => void;
}) {
  const dec = () => setValue((v) => Math.max(MIN, v - 1));
  const inc = () => setValue((v) => Math.min(MAX, v + 1));
  const reset = () => setValue(baseline);
  const dirty = value !== baseline;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <Users className="h-4 w-4" strokeWidth={1.75} />
        Portions
      </span>
      <div className="inline-flex items-center rounded-full bg-white border border-bone-deep shadow-soft p-1">
        <button
          type="button"
          onClick={dec}
          disabled={value <= MIN}
          aria-label="Diminuer les portions"
          className={clsx(
            "h-11 w-11 inline-flex items-center justify-center rounded-full transition-colors",
            value > MIN
              ? "text-ink hover:bg-bone-deep active:bg-bone-deep"
              : "text-ink-soft/40 cursor-not-allowed"
          )}
        >
          <Minus className="h-4 w-4" strokeWidth={2} />
        </button>
        <span
          className="font-serif text-xl font-semibold tabular-nums w-10 text-center"
          aria-live="polite"
          aria-label={`${value} portions`}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= MAX}
          aria-label="Augmenter les portions"
          className={clsx(
            "h-11 w-11 inline-flex items-center justify-center rounded-full transition-colors",
            value < MAX
              ? "text-ink hover:bg-bone-deep active:bg-bone-deep"
              : "text-ink-soft/40 cursor-not-allowed"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      {dirty && (
        <button
          type="button"
          onClick={reset}
          className="text-xs text-ink-soft hover:text-terracotta-deep transition-colors"
        >
          ↺ {baseline}
        </button>
      )}
    </div>
  );
}

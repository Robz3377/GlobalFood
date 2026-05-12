"use client";

import { clsx } from "clsx";

export type StepsMode = "pro" | "family";

type Props = {
  mode: StepsMode;
  onChange: (next: StepsMode) => void;
};

/**
 * Sélecteur Pro/Famille pour les étapes de préparation.
 *
 * - "Pro" 👨‍🍳 : techniques, jargons, précisions de chef (steps original)
 * - "Famille" 👨‍👩‍👧 : phrases courtes, langage grand public, sans jargon
 *
 * Visuel : pilule terracotta avec sélection en bone (haut contraste pour tap).
 */
export function StepsModeToggle({ mode, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Niveau de détail des étapes"
      className="inline-flex rounded-full border border-bone-deep bg-white p-1 text-sm shadow-soft"
    >
      <button
        type="button"
        onClick={() => onChange("pro")}
        aria-pressed={mode === "pro"}
        className={clsx(
          "rounded-full px-3 md:px-4 h-9 inline-flex items-center gap-1.5 font-medium transition-all active:scale-95",
          mode === "pro"
            ? "bg-terracotta text-bone shadow-warm"
            : "text-ink-soft hover:text-ink"
        )}
      >
        <span aria-hidden>👨‍🍳</span>
        <span>Pro</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("family")}
        aria-pressed={mode === "family"}
        className={clsx(
          "rounded-full px-3 md:px-4 h-9 inline-flex items-center gap-1.5 font-medium transition-all active:scale-95",
          mode === "family"
            ? "bg-ochre text-bone shadow-warm"
            : "text-ink-soft hover:text-ink"
        )}
      >
        <span aria-hidden>👨‍👩‍👧</span>
        <span>Famille</span>
      </button>
    </div>
  );
}

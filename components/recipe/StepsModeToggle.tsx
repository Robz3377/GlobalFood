"use client";

import { clsx } from "clsx";

/** Mode "Brigade" — Chef culinaire (expert) ou Commis de cuisine (express). */
export type StepsMode = "chef" | "commis";

type Props = {
  mode: StepsMode;
  onChange: (next: StepsMode) => void;
};

/** Slogans humoristiques affichés sous le toggle selon le mode actif. */
const SLOGANS: Record<StepsMode, string> = {
  chef: "Pour ceux qui préfèrent passer leur dimanche à surveiller une réduction plutôt qu'à dormir.",
  commis:
    "Pour ceux qui considèrent que faire bouillir de l'eau est une victoire.",
};

/**
 * Sélecteur de Brigade : Chef culinaire ⇄ Commis de cuisine.
 *
 * - **Chef culinaire** 👨‍🍳 : techniques pointues, jargons, ingrédients de niche.
 *   Sélectionné = pilule terracotta (couleur signature "secret du chef").
 * - **Commis de cuisine** 🧑‍🍳 : ingrédients de supermarché, cuisson express.
 *   Sélectionné = pilule ochre.
 *
 * Le slogan du mode actif s'affiche en italique serif xs sous le toggle pour
 * donner le ton de chaque profil.
 */
export function StepsModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex flex-col items-end gap-2 max-w-full">
      <div
        role="group"
        aria-label="Brigade : niveau de détail des étapes"
        className="inline-flex rounded-full border border-bone-deep bg-white p-1 text-sm shadow-soft"
      >
        <button
          type="button"
          onClick={() => onChange("chef")}
          aria-pressed={mode === "chef"}
          className={clsx(
            "rounded-full px-3 md:px-4 h-9 inline-flex items-center gap-1.5 font-medium transition-all active:scale-95 whitespace-nowrap",
            mode === "chef"
              ? "bg-terracotta text-bone shadow-warm"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <span aria-hidden>👨‍🍳</span>
          <span>Chef culinaire</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("commis")}
          aria-pressed={mode === "commis"}
          className={clsx(
            "rounded-full px-3 md:px-4 h-9 inline-flex items-center gap-1.5 font-medium transition-all active:scale-95 whitespace-nowrap",
            mode === "commis"
              ? "bg-ochre text-bone shadow-warm"
              : "text-ink-soft hover:text-ink"
          )}
        >
          <span aria-hidden>🧑‍🍳</span>
          <span>Commis de cuisine</span>
        </button>
      </div>
      <p
        className="font-serif italic text-xs text-ink-soft text-right max-w-md leading-snug"
        aria-live="polite"
      >
        « {SLOGANS[mode]} »
      </p>
    </div>
  );
}

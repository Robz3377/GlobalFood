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
 * La pastille de fond GLISSE d'un côté à l'autre (transform + crossfade de
 * couleur terracotta⇄ochre, easing --ease-soft) au lieu d'un changement de
 * fond brutal. Les deux boutons ont une largeur égale (grid-cols-2) pour que
 * `translateX(0 | 100%)` de la pastille tombe pile en face.
 */
export function StepsModeToggle({ mode, onChange }: Props) {
  const isChef = mode === "chef";
  return (
    <div className="flex flex-col items-end gap-2 max-w-full">
      <div
        role="group"
        aria-label="Brigade : niveau de détail des étapes"
        className="relative grid grid-cols-2 rounded-full border border-bone-deep bg-white p-1 text-sm shadow-soft"
      >
        {/* Pastille glissante (sous les boutons) */}
        <span
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-warm",
            "transition-[transform,background-color] duration-[250ms] ease-[var(--ease-soft)]",
            isChef ? "bg-terracotta" : "bg-ochre"
          )}
          style={{ transform: isChef ? "translateX(0)" : "translateX(100%)" }}
        />
        <button
          type="button"
          onClick={() => onChange("chef")}
          aria-pressed={isChef}
          className={clsx(
            "relative z-10 rounded-full px-3 md:px-4 h-9 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap",
            "transition-colors duration-200 ease-[var(--ease-soft)] active:scale-95",
            isChef ? "text-bone" : "text-ink-soft hover:text-ink"
          )}
        >
          <span aria-hidden>👨‍🍳</span>
          <span>Chef culinaire</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("commis")}
          aria-pressed={!isChef}
          className={clsx(
            "relative z-10 rounded-full px-3 md:px-4 h-9 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap",
            "transition-colors duration-200 ease-[var(--ease-soft)] active:scale-95",
            !isChef ? "text-bone" : "text-ink-soft hover:text-ink"
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

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { formatQty } from "@/lib/units";
import { categorizeIngredient } from "@/lib/ingredientCategory";
import type { Ingredient } from "@/lib/types";

type Props = {
  ingredients: Ingredient[];
  /**
   * Nombre de portions courant (contrôlé depuis l'extérieur — typiquement par
   * RecipeBody qui héberge le PortionsControl dans la sticky info bar).
   */
  servings: number;
  /**
   * Nombre de portions de référence (depuis recipe.servings) servant à
   * calculer le ratio de mise à l'échelle des quantités.
   */
  baseline: number;
  /**
   * Si vrai, la liste se replie en accordéon sur mobile (<md) pour libérer
   * l'espace au profit des étapes de préparation. Sur md+, la liste reste
   * toujours déployée.
   */
  collapsible?: boolean;
};

/**
 * Refonte v2 : le toggle Métrique/Impérial a été retiré. La cuisine du
 * monde est plus précise en métrique (toutes les fiches authentiques sont
 * en g/ml). On affiche uniquement les valeurs métriques mises à l'échelle
 * en fonction de la sélection de portions du sticky bar.
 */
export function RecipeIngredients({
  ingredients,
  servings,
  baseline,
  collapsible = false,
}: Props) {
  const [openMobile, setOpenMobile] = useState<boolean>(!collapsible);
  const ratio = servings / baseline;

  return (
    <section className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpenMobile((v) => !v)}
            aria-expanded={openMobile}
            aria-controls="ingredient-list"
            className="md:pointer-events-none md:cursor-default inline-flex items-center gap-3 text-left group"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Ingrédients
            </h2>
            <span className="md:hidden inline-flex items-center gap-1.5 text-xs font-medium text-terracotta-deep">
              {openMobile ? "Replier" : `Voir les ${ingredients.length}`}
              <ChevronDown
                className={clsx(
                  "h-4 w-4 transition-transform",
                  openMobile && "rotate-180"
                )}
                strokeWidth={2}
              />
            </span>
            <span className="hidden md:inline font-serif italic text-sm text-ink-soft">
              {ingredients.length} produits
            </span>
          </button>
        ) : (
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            Ingrédients
          </h2>
        )}
      </header>

      <ul
        id="ingredient-list"
        className={clsx(
          "divide-y divide-bone-deep rounded-soft-lg bg-white shadow-soft overflow-hidden",
          // Accordéon : caché sur mobile si non ouvert, toujours visible md+
          collapsible && !openMobile && "hidden md:block"
        )}
      >
        {ingredients.map((ing, i) => {
          const scaled = ing.qty * ratio;
          const out = formatQty(scaled, ing.unit);
          const cat = categorizeIngredient(ing.name);
          return (
            <li
              key={`${ing.name}-${i}`}
              className="flex items-center justify-between gap-3 px-4 md:px-5 py-3"
            >
              <span className="flex items-center gap-3 min-w-0">
                {/* Pastille de catégorie — lecture instantanée du plat.
                    Si la catégorie a un composant Lucide (ex: Egg pour les
                    œufs), il est rendu en vectoriel ; sinon fallback emoji. */}
                <span
                  aria-hidden
                  className={clsx(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base shadow-sm",
                    cat.bgClass
                  )}
                  title={cat.category}
                >
                  {cat.lucide ? (
                    <cat.lucide
                      className="h-5 w-5 text-ink"
                      strokeWidth={1.75}
                    />
                  ) : (
                    cat.icon
                  )}
                </span>
                <span className="text-ink text-base leading-snug">
                  {ing.name}
                </span>
              </span>
              <span className="shrink-0 font-serif text-sm font-medium text-terracotta-deep tabular-nums">
                {out.display}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

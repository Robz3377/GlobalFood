"use client";

import { useMemo, useState } from "react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { DietFilter, recipeMatchesDiets } from "@/components/ui/DietFilter";
import {
  RECIPE_CATEGORY_LABELS,
  RECIPE_CATEGORY_ORDER,
  type Diet,
  type RecipeCategory,
} from "@/lib/types";
import type { RecipeIndex } from "@/lib/types-index";

type Item = {
  country: { slug: string; name: string; flag: string };
  recipe: RecipeIndex;
};

/**
 * ParcourirView — refonte v2.4 : regroupement par catégorie culinaire au
 * lieu du tri alphabétique. La séquence respecte l'ordre canonique d'un
 * repas (entrées → plats → desserts → boissons) défini dans lib/types.
 *
 * Une catégorie vide (après filtres diets) est automatiquement masquée
 * pour ne pas afficher de séparateur orphelin.
 *
 * Séparateurs : pastille catégorie + titre serif + ligne fine sage —
 * cohérent avec le design system carnet de voyage.
 */
export function ParcourirView({ items }: { items: Item[] }) {
  const [diets, setDiets] = useState<Diet[]>([]);

  const filtered = useMemo(
    () => items.filter(({ recipe }) => recipeMatchesDiets(recipe, diets)),
    [items, diets]
  );

  /**
   * Map catégorie → recettes (triées alphabétiquement à l'intérieur de
   * chaque groupe pour la lisibilité).
   */
  const grouped = useMemo(() => {
    const map = new Map<RecipeCategory, Item[]>();
    for (const it of filtered) {
      const cat = it.recipe.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.recipe.title.localeCompare(b.recipe.title, "fr"));
    }
    return map;
  }, [filtered]);

  // Catégories présentes, dans l'ordre canonique (séquence de repas).
  // Les vides sont masquées (filter sur Map.has).
  const presentCategories = RECIPE_CATEGORY_ORDER.filter((cat) =>
    grouped.has(cat)
  );

  return (
    <>
      {/* En-tête compact : filtres + chips de raccourci catégories. */}
      <section
        className="mx-auto max-w-5xl px-6 pb-1 sticky top-16 z-20 bg-bone/90 backdrop-blur"
        aria-label="Filtres et catégories"
      >
        <div className="py-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-bone-deep">
          <DietFilter value={diets} onChange={setDiets} />
          <span className="ml-auto text-[11px] text-ink-soft">
            {filtered.length} recette{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
        {presentCategories.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 py-1.5 border-b border-bone-deep">
            {presentCategories.map((cat) => (
              <li key={cat}>
                <a
                  href={`#cat-${cat}`}
                  // Chips raccourci de section — compactes, style "tag".
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white shadow-soft text-[11px] font-medium text-ink hover:bg-sage-soft transition-colors"
                >
                  {RECIPE_CATEGORY_LABELS[cat]}
                  <span className="text-[10px] text-ink-soft tabular-nums">
                    {grouped.get(cat)!.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {presentCategories.length === 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-soft-lg bg-white p-10 shadow-soft text-center">
            <p className="font-serif text-2xl font-semibold">
              Aucune recette ne correspond
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Essayez de retirer certains filtres pour élargir les résultats.
            </p>
          </div>
        </section>
      ) : (
        presentCategories.map((cat) => (
          <section
            id={`cat-${cat}`}
            key={cat}
            className="mx-auto max-w-5xl px-6 py-6 scroll-mt-32"
          >
            {/* === SÉPARATEUR DE CATÉGORIE — élégant et épuré ===
                Pastille terracotta + titre serif large + ligne fine sage
                qui s'étend horizontalement. Style "intercalaire de carnet". */}
            <header
              className="mb-5 flex items-center gap-4"
              aria-label={RECIPE_CATEGORY_LABELS[cat]}
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-terracotta shrink-0"
              />
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink leading-none">
                {RECIPE_CATEGORY_LABELS[cat]}
              </h2>
              <span
                aria-hidden
                className="font-serif italic text-sm text-ink-soft tabular-nums shrink-0"
              >
                {grouped.get(cat)!.length}
              </span>
              <span
                aria-hidden
                className="flex-1 h-px bg-gradient-to-r from-bone-deep via-bone-deep to-transparent"
              />
            </header>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.get(cat)!.map(({ country, recipe }) => (
                <RecipeCard
                  key={`${country.slug}-${recipe.slug}`}
                  country={country}
                  recipe={recipe}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

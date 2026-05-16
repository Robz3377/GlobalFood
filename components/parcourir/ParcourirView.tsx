"use client";

import { useMemo, useState } from "react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { DietFilter, recipeMatchesDiets } from "@/components/ui/DietFilter";
import { normalize } from "@/lib/text";
import type { Diet } from "@/lib/types";
import type { RecipeIndex } from "@/lib/types-index";

type Item = {
  country: { slug: string; name: string; flag: string };
  recipe: RecipeIndex;
};

export function ParcourirView({ items }: { items: Item[] }) {
  const [diets, setDiets] = useState<Diet[]>([]);

  const filtered = useMemo(
    () => items.filter(({ recipe }) => recipeMatchesDiets(recipe, diets)),
    [items, diets]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of filtered) {
      const letter = normalize(it.recipe.title)[0]?.toUpperCase() ?? "?";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(it);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.recipe.title.localeCompare(b.recipe.title, "fr"));
    }
    return map;
  }, [filtered]);

  const letters = Array.from(grouped.keys()).sort();

  return (
    <>
      <section
        className="mx-auto max-w-5xl px-6 pb-3 sticky top-16 z-20 bg-bone/90 backdrop-blur"
        aria-label="Filtres et lettres"
      >
        <div className="py-3 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-bone-deep">
          <DietFilter value={diets} onChange={setDiets} />
          <span className="ml-auto text-sm text-ink-soft">
            {filtered.length} recette{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
        {letters.length > 0 && (
          <ul className="flex flex-wrap gap-2 py-3 border-b border-bone-deep">
            {letters.map((l) => (
              <li key={l}>
                <a
                  href={`#letter-${l}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-soft bg-white shadow-soft font-serif font-semibold text-ink hover:bg-sage-soft transition-colors"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {letters.length === 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-soft-lg bg-white p-10 shadow-soft text-center">
            <p className="font-serif text-2xl font-semibold">Aucune recette ne correspond</p>
            <p className="mt-2 text-sm text-ink-soft">
              Essayez de retirer certains filtres pour élargir les résultats.
            </p>
          </div>
        </section>
      ) : (
        letters.map((letter) => (
          <section
            id={`letter-${letter}`}
            key={letter}
            className="mx-auto max-w-5xl px-6 py-8 scroll-mt-40"
          >
            <h2 className="font-serif text-3xl font-semibold mb-5 text-terracotta">
              {letter}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grouped.get(letter)!.map(({ country, recipe }) => (
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

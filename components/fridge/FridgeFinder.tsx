"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/Button";
import { DietFilter, recipeMatchesDiets } from "@/components/ui/DietFilter";
import { ingredientMatches } from "@/lib/text";
import type { Diet } from "@/lib/types";
import type { RecipeIndex } from "@/lib/types-index";

const SUGGESTIONS = [
  "tomate",
  "ail",
  "oignon",
  "œuf",
  "citron",
  "poulet",
  "riz",
  "olive",
];

type Item = {
  country: { slug: string; name: string; flag: string };
  recipe: RecipeIndex;
};
type Scored = Item & {
  matches: string[];
  missing: number;
  ratio: number;
};

export function FridgeFinder({ recipes }: { recipes: Item[] }) {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [diets, setDiets] = useState<Diet[]>([]);

  function addTag(raw: string) {
    const cleaned = raw.trim().replace(/,$/, "").trim();
    if (!cleaned) return;
    setTags((prev) =>
      prev.includes(cleaned.toLowerCase()) ? prev : [...prev, cleaned.toLowerCase()]
    );
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  const scored = useMemo<Scored[]>(() => {
    if (!tags.length) return [];
    return recipes
      .filter(({ recipe }) => recipeMatchesDiets(recipe, diets))
      .map(({ country, recipe }) => {
        const matched = new Set<string>();
        for (const tag of tags) {
          // Matching sur `ingredientNames` (union Chef + Commis aplatie dans
          // l'index, voir scripts/split-data.mjs). Évite de charger les
          // Ingredient[] complets côté client.
          if (recipe.ingredientNames.some((name) => ingredientMatches(tag, name))) {
            matched.add(tag);
          }
        }
        return {
          country,
          recipe,
          matches: Array.from(matched),
          missing: tags.length - matched.size,
          ratio: matched.size / tags.length,
        };
      })
      .filter((r) => r.matches.length > 0)
      .sort(
        (a, b) =>
          b.ratio - a.ratio ||
          a.recipe.ingredientNames.length - b.recipe.ingredientNames.length
      );
  }, [tags, recipes, diets]);

  return (
    <div className="space-y-8">
      <div className="rounded-soft-lg bg-paper-card p-5">
        <div className="flex flex-wrap items-center gap-2 rounded-soft border border-bone-deep px-3 py-2 focus-within:border-sage transition-colors">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-sm font-medium"
            >
              {t}
              <button
                type="button"
                aria-label={`Retirer ${t}`}
                onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                className="text-ink/70 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={tags.length ? "" : "Ex : tomate, ail, riz…"}
            className="flex-1 min-w-[120px] bg-transparent outline-none px-1 py-1 text-base"
            aria-label="Ajouter un ingrédient"
          />
          {draft && (
            <Button variant="soft" onClick={() => addTag(draft)}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-ink-soft mr-1">
            Suggestions :
          </span>
          {SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-bone-deep px-3 py-1 text-xs hover:border-sage hover:bg-sage-soft transition-colors"
            >
              + {s}
            </button>
          ))}
          {tags.length > 0 && (
            <button
              type="button"
              onClick={() => setTags([])}
              className="ml-auto rounded-full px-3 py-1 text-xs text-ink-soft hover:text-terracotta-deep transition-colors"
            >
              Tout effacer
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-bone-deep">
          <DietFilter value={diets} onChange={setDiets} />
        </div>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-soft-lg bg-paper-card p-10 text-center">
          <p className="font-serif text-2xl font-semibold">Que cuisinez-vous ce soir ?</p>
          <p className="mt-2 text-sm text-ink-soft">
            Ajoutez au moins un ingrédient pour démarrer la recherche.
          </p>
        </div>
      ) : scored.length === 0 ? (
        <div className="rounded-soft-lg bg-paper-card p-10 text-center">
          <p className="font-serif text-2xl font-semibold">Aucune correspondance</p>
          <p className="mt-2 text-sm text-ink-soft">
            Essayez avec d'autres ingrédients ou retirez-en certains.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl font-semibold">
              {scored.length} recette{scored.length > 1 ? "s" : ""} trouvée
              {scored.length > 1 ? "s" : ""}
            </h2>
            <span className="text-sm text-ink-soft">triées par pertinence</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scored.map((s) => (
              <div key={`${s.country.slug}-${s.recipe.slug}`} className="space-y-2">
                <RecipeCard country={s.country} recipe={s.recipe} />
                <div className="px-1 text-xs">
                  <span className="font-medium text-sage">
                    {s.matches.length} / {tags.length} ingrédient
                    {tags.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-ink-soft">
                    {" "}
                    · trouvés : {s.matches.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

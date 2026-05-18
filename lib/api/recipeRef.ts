import { getRecipeIndex } from "@/lib/data";

/**
 * Valide une paire (country, recipe) côté serveur.
 *
 * Les recettes vivent dans `data/countries/*.json` (pas en base) : avant
 * toute écriture (commentaire, note) on vérifie que la recette EXISTE
 * réellement via l'index statique. Garde-fou de format + d'existence.
 */
export type RecipeRef = { countrySlug: string; recipeSlug: string };

const SLUG = /^[a-z0-9-]{2,60}$/;

export function parseRecipeRef(
  country: string | null,
  recipe: string | null
): RecipeRef | null {
  if (!country || !recipe) return null;
  if (!SLUG.test(country) || !SLUG.test(recipe)) return null;
  if (!getRecipeIndex(country, recipe)) return null;
  return { countrySlug: country, recipeSlug: recipe };
}

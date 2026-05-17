/**
 * Types pour l'index allégé (`data/index.json`) — utilisé par les pages
 * clients qui n'ont pas besoin des ingredients/steps complets (parcourir,
 * mon-frigo, recommandations, search). Économise ~85% du payload vs les
 * recettes complètes.
 *
 * Les types "lourds" (Country avec ses recipes complètes) restent dans
 * lib/types.ts et sont chargés à la demande via `getCountry(slug)`.
 */

import type { Diet, Season, CulturalEvent, RecipeCategory } from "./types";

/**
 * Meta d'un pays — sans les recettes complètes, juste les slugs.
 */
export type CountryIndex = {
  slug: string;
  name: string;
  iso3: string;
  isoNumeric: string;
  flag: string;
  intro: string;
  tagline?: string;
  recipeSlugs: string[];
};

/**
 * Meta d'une recette — sans ingredients (Ingredient[]) ni steps (string[]).
 * Le champ `ingredientNames` est une union aplatie des noms (Chef + Commis)
 * pour permettre le matching de `/mon-frigo` côté client sans charger la
 * recette complète.
 */
export type RecipeIndex = {
  countrySlug: string;
  slug: string;
  title: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  diets: Diet[];
  /** Catégorie culinaire — pour grouper sur /parcourir (v2.4). */
  category: RecipeCategory;
  seasons?: Season[];
  events?: CulturalEvent[];
  /** Noms d'ingrédients aplatis (Chef + Commis, dédupliqués). Pour le frigo. */
  ingredientNames: string[];
};

/** Forme de `data/index.json`. */
export type RecipeIndexFile = {
  countries: CountryIndex[];
  recipes: RecipeIndex[];
};

/**
 * Couche d'accès aux données — refactor v2 (lazy loading par pays).
 *
 * Avant : `import data from "@/data/data.json"` chargeait les 454 KB du
 * monolithe sur chaque page (y compris en RSC payload côté client via le
 * root layout). Critique perf mobile.
 *
 * Après :
 *   • `data/index.json` (~78 KB) chargé statiquement — contient les meta de
 *     tous les pays + meta + ingredientNames aplatis de toutes les recettes.
 *     Suffit pour `/`, `/parcourir`, `/mon-frigo`, `/recommandations`,
 *     `/passeport`, search.
 *   • `data/countries/[slug].json` (~42 KB chacun) chargé À LA DEMANDE via
 *     `import()` dynamique. Utilisé uniquement par `/pays/[slug]` et
 *     `/pays/[slug]/[recipe]` (Server Components).
 *
 * Cache Map sur les fichiers pays pour éviter de re-lire le même JSON
 * plusieurs fois pendant un render (Next dédoublonne déjà les dynamic
 * imports à l'échelle du process, mais on garde la Map pour clarté + perf
 * synchrone après le premier appel).
 */

import indexJson from "@/data/index.json";
import type { Country } from "./types";
import type { CountryIndex, RecipeIndex, RecipeIndexFile } from "./types-index";

const indexFile = indexJson as RecipeIndexFile;

// ============================================================================
// INDEX ALLÉGÉ (synchrone, ~78 KB en bundle — acceptable côté client)
// ============================================================================

/** Tous les pays (meta only, pas de recettes complètes). */
export function getCountriesIndex(): CountryIndex[] {
  return indexFile.countries;
}

/** Toutes les recettes en version meta + ingredientNames aplati. */
export function getAllRecipesIndex(): RecipeIndex[] {
  return indexFile.recipes;
}

/** Récupère le meta d'un pays par son slug. */
export function getCountryIndexBySlug(slug: string): CountryIndex | undefined {
  return indexFile.countries.find((c) => c.slug === slug);
}

/** Récupère le meta d'un pays par son code ISO3. */
export function getCountryIndexByIso3(iso3: string): CountryIndex | undefined {
  return indexFile.countries.find((c) => c.iso3 === iso3);
}

/** Récupère le meta d'un pays par son code ISO numérique. */
export function getCountryIndexByIsoNumeric(
  id: string
): CountryIndex | undefined {
  return indexFile.countries.find((c) => c.isoNumeric === id);
}

/** Récupère le meta d'UNE recette (pour cartes, listes, etc.). */
export function getRecipeIndex(
  countrySlug: string,
  recipeSlug: string
): RecipeIndex | undefined {
  return indexFile.recipes.find(
    (r) => r.countrySlug === countrySlug && r.slug === recipeSlug
  );
}

// ============================================================================
// DONNÉES COMPLÈTES (chargement à la demande, ~42 KB par pays)
// ============================================================================

/**
 * Map des loaders dynamiques — une entrée par pays. Cette forme explicite
 * (vs un `import(\`@/data/countries/\${slug}.json\`)` à template string) est
 * plus prévisible pour le bundler Next 16/Turbopack : chaque clé devient un
 * chunk async séparé, et le module dynamique est correctement codesplitté.
 *
 * Si on ajoute un nouveau pays plus tard, il faut l'ajouter ici (et créer le
 * fichier data/countries/{slug}.json correspondant).
 */
// Cast explicite : TypeScript infère les types JSON littéraux (`diets: string[]`)
// alors que notre type Recipe veut `diets: Diet[]`. On masque le type intermédiaire
// puis on convertit en Country dans getCountry().
const COUNTRY_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  italie: () => import("@/data/countries/italie.json"),
  japon: () => import("@/data/countries/japon.json"),
  maroc: () => import("@/data/countries/maroc.json"),
  mexique: () => import("@/data/countries/mexique.json"),
  inde: () => import("@/data/countries/inde.json"),
  thailande: () => import("@/data/countries/thailande.json"),
  france: () => import("@/data/countries/france.json"),
  chine: () => import("@/data/countries/chine.json"),
  bresil: () => import("@/data/countries/bresil.json"),
  grece: () => import("@/data/countries/grece.json"),
  // v2.7 — nouveaux pays (Sénégal + Vietnam)
  senegal: () => import("@/data/countries/senegal.json"),
  vietnam: () => import("@/data/countries/vietnam.json"),
};

/** Cache process-local pour éviter de re-importer le même JSON pays. */
const countryCache = new Map<string, Country>();

/**
 * Charge le pays complet (avec ingrédients + steps Chef ET Commis). Async.
 * À utiliser uniquement dans des Server Components.
 */
export async function getCountry(slug: string): Promise<Country | undefined> {
  const cached = countryCache.get(slug);
  if (cached) return cached;
  const loader = COUNTRY_LOADERS[slug];
  if (!loader) return undefined;
  const mod = await loader();
  // Le JSON est validé manuellement par scripts/split-data.mjs (il vient de
  // data/data.json dont le schéma respecte Country). Cast explicite double.
  const country = mod.default as unknown as Country;
  countryCache.set(slug, country);
  return country;
}

/**
 * Charge la recette complète d'un pays donné. Async.
 */
export async function getRecipe(
  countrySlug: string,
  recipeSlug: string
): Promise<{ country: Country; recipe: Country["recipes"][number] } | undefined> {
  const country = await getCountry(countrySlug);
  if (!country) return undefined;
  const recipe = country.recipes.find((r) => r.slug === recipeSlug);
  if (!recipe) return undefined;
  return { country, recipe };
}

// ============================================================================
// HELPERS DE COMPATIBILITÉ (transition douce)
// ============================================================================

/**
 * Helper async pour les usages qui ont besoin de toutes les recettes
 * complètes (ex: page Gazette qui filtre sur `recipe.story`). Charge tous
 * les pays en parallèle.
 *
 * ⚠️ Évite à tout prix de l'utiliser depuis le root layout ou les Client
 * Components : tu retombes dans le problème du 454 KB serialisé. Utilise
 * `getAllRecipesIndex()` à la place quand c'est possible.
 */
export async function getAllCountriesFull(): Promise<Country[]> {
  const slugs = indexFile.countries.map((c) => c.slug);
  const results = await Promise.all(slugs.map((slug) => getCountry(slug)));
  return results.filter((c): c is Country => c !== undefined);
}

/**
 * Variante "à la demande" pour la page Gazette (qui a besoin de tous les
 * recipes avec story). Charge en parallèle puis aplatit.
 */
export async function getAllRecipesFull(): Promise<
  { country: Country; recipe: Country["recipes"][number] }[]
> {
  const countries = await getAllCountriesFull();
  return countries.flatMap((country) =>
    country.recipes.map((recipe) => ({ country, recipe }))
  );
}

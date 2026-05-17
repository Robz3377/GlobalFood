#!/usr/bin/env node
/**
 * v2.6 — Cartographie agnostique à l'extension.
 *
 * Changement vs v2.5 : on ne filtre plus sur .jpg. On lit TOUS les
 * fichiers de /public/images/, on isole le nom de base via path.parse()
 * pour le matching textuel, et on enregistre l'URL avec la VRAIE
 * extension détectée sur disque (jpg, jpeg, png, webp, avif…).
 *
 * Stratégie de matching (par ordre de priorité décroissante) :
 *   1. Exceptions explicites (typos / accents conservés par l'user)
 *   2. Match exact `{slug-recette}-{slug-pays}` (nom de base)
 *   3. Match préfixe `{slug-recette}-...`
 *   4. Fallback : chemin théorique `/images/{slug}-{country.slug}.jpg`
 *      (.jpg par défaut, RecipeImage a un fallback bg-bone-deep si fail)
 *
 * Régénère data/index.json à la fin.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, parse as parsePath } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGES_DIR = join(ROOT, "public", "images");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX_PATH = join(ROOT, "data", "index.json");

// Extensions image acceptées (le user peut uploader en n'importe quel
// format raster supporté par next/image). Tout autre fichier est ignoré.
const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif",
]);

// Logos / icônes à ignorer (non-recettes)
const NON_RECIPE_BASENAMES = new Set(["logo", "logo-mapandfork"]);

// Table d'exceptions pour les anomalies de naming (typos / variations
// conservées par l'user). Étendue v2.6 après audit des 33 nouvelles
// images .png ajoutées par l'utilisateur (suffixes "de" / "au" / "aux" /
// "et" / "alla" insérés dans les titres, pluriels "samosas", typo "mocequa").
const NAMING_EXCEPTIONS = {
  // Anciennes (v2.5) — slugs des recettes .jpg historiques
  coxinhas: "coxhinas-de-poulet-bresil",
  "curry-vert-poulet": "curry-vert-au-poulet",
  ratatouille: "ratatouille-niçoise-france",
  "guacamole-totopos": "guacamole-et-totopos-mexique",
  jiaozi: "jiaozi-raviolis-chinois-chine",
  feijoada: "feijoada-complete-bresil",
  "couscous-legumes": "couscous-aux-sept-legumes-maroc",
  souvlaki: "souvlaki-de-poulet-grece",
  "dhal-lentilles": "dhal-aux-lentilles-corail-inde",
  "gyoza-porc": "gyoza-au-porc-japon",
  // Nouvelles (v2.6) — slugs des recettes .png ajoutées par l'user
  moqueca: "mocequa-de-poisson-bresil", // typo source mocequa/moqueca
  "tzatziki-pita": "tzatziki-et-pita-grece", // "et" inséré
  "biryani-agneau": "biryani-d-agneau-inde", // "d'" inséré
  "samosa-legumes": "samosas-aux-legumes-inde", // pluriel + "aux"
  "risotto-milanese": "risotto-alla-milanese-italie", // "alla"
  "onigiri-saumon": "onigiri-au-saumon-japon", // "au"
  "tempura-legumes": "tempura-de-legumes-japon", // "de"
  "tajine-poulet-citron": "tajine-de-poulet-au-citron-confit", // sans -maroc
  "pastilla-poulet": "pastilla-de-poulet-maroc", // "de"
  "briouates": "briouates-au-miel-maroc", // "au miel" ajouté
  carbonara: "spaghetti-alla-carbonara-italie", // titre complet préféré au slug
};

// 1) Scan agnostique du dossier images
const allFiles = readdirSync(IMAGES_DIR)
  .map((name) => {
    const p = join(IMAGES_DIR, name);
    try {
      if (!statSync(p).isFile()) return null;
    } catch {
      return null;
    }
    const parsed = parsePath(name);
    const ext = parsed.ext.toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) return null;
    if (NON_RECIPE_BASENAMES.has(parsed.name)) return null;
    return { filename: name, basename: parsed.name, ext };
  })
  .filter(Boolean)
  .sort((a, b) => a.basename.localeCompare(b.basename));

console.log(`📂 ${allFiles.length} fichiers images détectés dans public/images/`);
const byExt = {};
for (const f of allFiles) byExt[f.ext] = (byExt[f.ext] || 0) + 1;
console.log(
  "   Extensions :",
  Object.entries(byExt)
    .map(([e, n]) => `${e}×${n}`)
    .join(", ") || "(aucune)"
);
console.log();

/** Index { basename → filename } pour lookup O(1) */
const byBasename = new Map();
for (const f of allFiles) byBasename.set(f.basename, f.filename);

/**
 * Trouve le filename à utiliser pour une recette donnée.
 * Retourne { filename, strategy } si trouvé, sinon null.
 */
function findMatch(recipeSlug, countrySlug) {
  // 1. Exceptions explicites
  const exception = NAMING_EXCEPTIONS[recipeSlug];
  if (exception && byBasename.has(exception)) {
    return { filename: byBasename.get(exception), strategy: "exception" };
  }
  // 2. Match exact slug-recette + slug-pays
  const exact = `${recipeSlug}-${countrySlug}`;
  if (byBasename.has(exact)) {
    return { filename: byBasename.get(exact), strategy: "exact" };
  }
  // 3. Match préfixe slug-recette-
  const prefixHit = allFiles.find((f) => f.basename.startsWith(`${recipeSlug}-`));
  if (prefixHit) {
    return { filename: prefixHit.filename, strategy: "prefix" };
  }
  return null;
}

let foundCount = 0;
let missingCount = 0;
const missing = [];
const allCountries = [];

for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const path = join(COUNTRIES_DIR, file);
  const country = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  for (const recipe of country.recipes) {
    const match = findMatch(recipe.slug, country.slug);
    const newImage = match
      ? `/images/${match.filename}`
      : `/images/${recipe.slug}-${country.slug}.jpg`;
    if (recipe.image !== newImage) {
      recipe.image = newImage;
      changed = true;
    }
    if (match) {
      foundCount += 1;
      console.log(
        `  ✓ ${country.slug.padEnd(10)} / ${recipe.slug.padEnd(22)} → ${match.filename} (${match.strategy})`
      );
    } else {
      missingCount += 1;
      missing.push(`${country.slug}/${recipe.slug} → ${newImage}`);
    }
  }
  if (changed) writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
  allCountries.push(country);
}

if (missing.length > 0) {
  console.log(`\n⚠ ${missingCount} recettes sans fichier image (chemin théorique appliqué) :`);
  for (const m of missing) console.log(`    ${m}`);
}

// Régénère data/index.json
const index = {
  countries: allCountries.map((c) => ({
    slug: c.slug,
    name: c.name,
    iso3: c.iso3,
    isoNumeric: c.isoNumeric,
    flag: c.flag,
    intro: c.intro,
    tagline: c.tagline,
    recipeSlugs: c.recipes.map((r) => r.slug),
  })),
  recipes: allCountries.flatMap((c) =>
    c.recipes.map((r) => ({
      countrySlug: c.slug,
      slug: r.slug,
      title: r.title,
      image: r.image,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servings: r.servings,
      diets: r.diets,
      category: r.category,
      seasons: r.seasons ?? [],
      events: r.events ?? [],
      ingredientNames: Array.from(
        new Set(
          [
            ...r.ingredients.map((i) => i.name),
            ...(r.commisIngredients || []).map((i) => i.name),
          ].map((n) => n.trim())
        )
      ),
    }))
  ),
};
writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");

const totalRecipes = foundCount + missingCount;
console.log(`\n📊 Bilan :`);
console.log(`  ✓ ${foundCount}/${totalRecipes} recettes ont une image physique`);
console.log(`  ⚠ ${missingCount}/${totalRecipes} recettes ont un chemin théorique`);
console.log(`  ✓ data/index.json régénéré`);

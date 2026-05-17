#!/usr/bin/env node
/**
 * v2.5 — Cartographie auto des fichiers /public/images/*.jpg vers les
 * champs `image` des 50 recettes data/countries/*.json + data/index.json.
 *
 * Stratégie de matching (par ordre de priorité décroissante) :
 *   1. Match exact `{slug-recette}-{slug-pays}.jpg`
 *   2. Match préfixe `{slug-recette}-...` (premier hit)
 *      → couvre `curry-vert-poulet` matché par `curry-vert-au-poulet.jpg`
 *   3. Table d'exceptions explicites pour les anomalies de naming
 *      (typos, accents conservés par l'user)
 *   4. Fallback : chemin théorique `/images/{slug}-{country.slug}.jpg`
 *      (image cassée jusqu'à upload — RecipeImage a un fallback bg-bone-deep)
 *
 * Régénère data/index.json à la fin pour répercuter les chemins dans le
 * bundle client.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGES_DIR = join(ROOT, "public", "images");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX_PATH = join(ROOT, "data", "index.json");

// Table d'exceptions pour les anomalies de naming (typos / variations).
// Clé = slug recette, valeur = nom de fichier exact (sans /images/ ni .jpg).
const NAMING_EXCEPTIONS = {
  // Typo "coxhinas" au lieu de "coxinhas" — l'user veut garder son nom
  coxinhas: "coxhinas-de-poulet-bresil",
  // curry-vert-au-poulet sans suffixe -thailande — l'user veut garder
  "curry-vert-poulet": "curry-vert-au-poulet",
  // ratatouille avec accent ç dans niçoise — l'user veut garder l'accent
  ratatouille: "ratatouille-niçoise-france",
  // guacamole-totopos vs guacamole-et-totopos-mexique (variation 'et')
  "guacamole-totopos": "guacamole-et-totopos-mexique",
  // jiaozi-raviolis-chinois (parenthèses retirées)
  jiaozi: "jiaozi-raviolis-chinois-chine",
  // feijoada-complete vs slug feijoada
  feijoada: "feijoada-complete-bresil",
  // couscous-aux-sept-legumes vs slug couscous-legumes
  "couscous-legumes": "couscous-aux-sept-legumes-maroc",
  // souvlaki-de-poulet vs slug souvlaki
  souvlaki: "souvlaki-de-poulet-grece",
  // coq-au-vin (déjà OK avec slug — pour info)
  // dhal-aux-lentilles-corail vs slug dhal-lentilles
  "dhal-lentilles": "dhal-aux-lentilles-corail-inde",
  // gyoza-au-porc vs slug gyoza-porc
  "gyoza-porc": "gyoza-au-porc-japon",
};

// 1) Liste les fichiers .jpg disponibles sur disque
const available = readdirSync(IMAGES_DIR)
  .filter((f) => f.endsWith(".jpg"))
  .sort();
console.log(`📂 ${available.length} fichiers .jpg trouvés dans public/images/\n`);

/**
 * Retourne le filename à utiliser pour une recette, ou null si rien
 * trouvé (chemin théorique sera généré par le caller).
 */
function findMatch(recipeSlug, countrySlug) {
  // 1. Exceptions explicites (priorité maximale)
  if (NAMING_EXCEPTIONS[recipeSlug]) {
    const candidate = `${NAMING_EXCEPTIONS[recipeSlug]}.jpg`;
    if (available.includes(candidate)) {
      return { filename: candidate, strategy: "exception" };
    }
  }
  // 2. Match exact slug-recette + slug-pays
  const exact = `${recipeSlug}-${countrySlug}.jpg`;
  if (available.includes(exact)) {
    return { filename: exact, strategy: "exact" };
  }
  // 3. Match préfixe slug-recette-
  const prefixHit = available.find((f) => f.startsWith(`${recipeSlug}-`));
  if (prefixHit) {
    return { filename: prefixHit, strategy: "prefix" };
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

// Régénère data/index.json avec les nouveaux chemins
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

console.log(`\n📊 Bilan :`);
console.log(`  ✓ ${foundCount}/50 recettes ont une image physique`);
console.log(`  ⚠ ${missingCount}/50 recettes ont un chemin théorique (à uploader)`);
console.log(`  ✓ data/index.json régénéré`);

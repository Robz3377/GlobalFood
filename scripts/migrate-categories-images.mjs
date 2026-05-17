#!/usr/bin/env node
/**
 * Migration v2.4 — deux changements de schéma data en un seul script :
 *
 * 1. CATEGORIES (Axe 2) : ajoute `category: RecipeCategory` à chaque recette
 *    (entree | plat | dessert | boisson). Mapping complet des 50 recettes
 *    construit manuellement selon la sémantique culinaire (cf. CATEGORIES
 *    ci-dessous). Idempotent : si une recette a déjà une catégorie, écrase
 *    avec la valeur du mapping (source de vérité).
 *
 * 2. IMAGES (Axe 3) : transforme le préfixe du champ `image` de `/images/`
 *    vers `/images/recipes/`. Le mv physique des fichiers .jpg est fait
 *    séparément en bash (`mv public/images/*.jpg public/images/recipes/`).
 *    Les URL-encodings (accents) restent inchangés.
 *
 * Régénère ensuite `data/index.json` pour répercuter les deux changements
 * dans le bundle client.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX_PATH = join(ROOT, "data", "index.json");

// Catégorisation manuelle des 50 recettes. Critères :
//   • entree   : soupes, salades, mezze, finger food, dim sum, snacks
//   • plat     : plats principaux (chaud ou froid)
//   • dessert  : pâtisseries, douceurs sucrées
//   • boisson  : thés, infusions
const CATEGORIES = {
  italie: {
    carbonara: "plat",
    "pizza-margherita": "plat",
    "risotto-milanese": "plat",
    "osso-buco": "plat",
    tiramisu: "dessert",
  },
  japon: {
    "ramen-shoyu": "plat",
    "onigiri-saumon": "entree",      // boules de riz, snack/entrée
    "tempura-legumes": "entree",     // beignets servis en entrée
    "gyoza-porc": "entree",          // raviolis, entrée traditionnelle
    katsudon: "plat",                // donburi de tonkatsu
  },
  maroc: {
    "tajine-poulet-citron": "plat",
    "couscous-legumes": "plat",
    "pastilla-poulet": "plat",
    harira: "entree",                // soupe ramadan, entrée
    briouates: "dessert",            // briouates au miel = dessert
  },
  mexique: {
    "tacos-al-pastor": "plat",
    "guacamole-totopos": "entree",   // apéritif / dip
    "mole-poblano": "plat",
    "enchiladas-verdes": "plat",
    "chiles-rellenos": "plat",
  },
  inde: {
    "butter-chicken": "plat",
    "dhal-lentilles": "plat",
    "biryani-agneau": "plat",
    "samosa-legumes": "entree",      // snack frit
    "chai-masala": "boisson",
  },
  thailande: {
    "pad-thai": "plat",
    "curry-vert-poulet": "plat",
    "tom-yum-kung": "entree",        // soupe d'entrée
    "som-tam": "entree",             // salade de papaye verte
    "mango-sticky-rice": "dessert",
  },
  france: {
    "coq-au-vin": "plat",
    ratatouille: "plat",             // peut être accompagnement mais OK plat
    bouillabaisse: "plat",
    "crepes-suzette": "dessert",
    "quiche-lorraine": "entree",     // tradition : entrée chaude
  },
  chine: {
    "mapo-tofu": "plat",
    "canard-laque": "plat",
    jiaozi: "entree",                // raviolis dim sum
    "nouilles-dan-dan": "plat",
    "riz-cantonais": "plat",
  },
  bresil: {
    feijoada: "plat",
    moqueca: "plat",
    "pao-de-queijo": "entree",       // amuse-bouche / pain au fromage
    coxinhas: "entree",              // street food snack
    brigadeiros: "dessert",
  },
  grece: {
    moussaka: "plat",
    souvlaki: "plat",
    "tzatziki-pita": "entree",       // mezze
    spanakopita: "entree",           // feuilleté, entrée/snack
    baklava: "dessert",
  },
};

let modified = 0;
let imagesUpdated = 0;
const allCountries = [];

for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const path = join(COUNTRIES_DIR, file);
  const country = JSON.parse(readFileSync(path, "utf8"));
  const catMap = CATEGORIES[country.slug];
  if (!catMap) {
    console.warn(`  ⚠ Pas de mapping catégories pour ${country.slug}, skip`);
    allCountries.push(country);
    continue;
  }
  let changed = false;
  for (const recipe of country.recipes) {
    const cat = catMap[recipe.slug];
    if (!cat) {
      console.warn(`  ⚠ Pas de catégorie pour ${country.slug}/${recipe.slug}`);
    } else if (recipe.category !== cat) {
      recipe.category = cat;
      changed = true;
    }
    // Axe 3 : migration du préfixe /images/ → /images/recipes/
    if (recipe.image && recipe.image.startsWith("/images/") && !recipe.image.startsWith("/images/recipes/")) {
      const after = recipe.image.replace("/images/", "/images/recipes/");
      recipe.image = after;
      imagesUpdated += 1;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
    modified += 1;
  }
  allCountries.push(country);
}

// Régénère data/index.json (avec category + nouveau chemin image)
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

console.log(`✓ ${modified} pays mis à jour, ${imagesUpdated} images repathées.`);
console.log(`✓ data/index.json régénéré : ${index.recipes.length} recettes / ${index.countries.length} pays`);

// Stat catégories
const catCount = {};
for (const r of index.recipes) catCount[r.category] = (catCount[r.category] || 0) + 1;
console.log(`\n📊 Répartition catégories :`);
for (const [c, n] of Object.entries(catCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c.padEnd(10)} ${n}`);
}

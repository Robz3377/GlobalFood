#!/usr/bin/env node
/**
 * Enrichit les data/countries/*.json + data/index.json avec les nouveaux
 * events culturels v2.2 (holi, dia-de-los-muertos, hanami).
 *
 * Mapping recette → events (additif, conserve les events existants) :
 *
 *   🇮🇳 INDE
 *     • butter-chicken    + holi  (plat festif rouge-orangé, parfait Holi)
 *     • dhal-lentilles    + holi  (vegetal réconfortant lors des fêtes)
 *     • samosa-legumes    + holi  (street food festif partagé)
 *     • chai-masala       + holi  (boisson rituelle des rassemblements)
 *
 *   🇲🇽 MEXIQUE
 *     • mole-poblano      + dia-de-los-muertos (plat sacré offrande ofrenda)
 *     • tacos-al-pastor   + dia-de-los-muertos (street food de la veille)
 *     • enchiladas-verdes + dia-de-los-muertos (plat familial central)
 *     • chiles-rellenos   + dia-de-los-muertos (présenté sur l'autel)
 *
 *   🇯🇵 JAPON
 *     • onigiri-saumon    + hanami (bento de pique-nique sous les cerisiers)
 *     • tempura-legumes   + hanami (légumes printaniers croustillants)
 *
 * Régénère aussi data/index.json pour refléter les events mis à jour.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX_PATH = join(ROOT, "data", "index.json");

const ADDS = {
  inde: {
    "butter-chicken": ["holi"],
    "dhal-lentilles": ["holi"],
    "samosa-legumes": ["holi"],
    "chai-masala": ["holi"],
  },
  mexique: {
    "mole-poblano": ["dia-de-los-muertos"],
    "tacos-al-pastor": ["dia-de-los-muertos"],
    "enchiladas-verdes": ["dia-de-los-muertos"],
    "chiles-rellenos": ["dia-de-los-muertos"],
  },
  japon: {
    "onigiri-saumon": ["hanami"],
    "tempura-legumes": ["hanami"],
  },
};

let touched = 0;
for (const [countrySlug, recipeMap] of Object.entries(ADDS)) {
  const path = join(COUNTRIES_DIR, `${countrySlug}.json`);
  const country = JSON.parse(readFileSync(path, "utf8"));
  for (const recipe of country.recipes) {
    const toAdd = recipeMap[recipe.slug];
    if (!toAdd) continue;
    const existing = new Set(recipe.events || []);
    for (const e of toAdd) existing.add(e);
    recipe.events = Array.from(existing);
    console.log(`  ✓ ${countrySlug}/${recipe.slug} → events: [${recipe.events.join(", ")}]`);
    touched += 1;
  }
  writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
}

// Régénère data/index.json pour répercuter les nouveaux events
const allCountries = [];
for (const file of readdirSync(COUNTRIES_DIR)) {
  if (!file.endsWith(".json")) continue;
  allCountries.push(JSON.parse(readFileSync(join(COUNTRIES_DIR, file), "utf8")));
}

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

console.log(`\n✓ ${touched} recettes enrichies + index.json régénéré.`);
console.log(`  → ${index.recipes.length} recettes / ${index.countries.length} pays.`);

// Stat events
const eventCounts = {};
for (const r of index.recipes) for (const e of r.events) eventCounts[e] = (eventCounts[e] || 0) + 1;
console.log(`\n📊 Recettes par event :`);
for (const [e, n] of Object.entries(eventCounts).sort()) {
  console.log(`  ${e.padEnd(22)} ${n}`);
}

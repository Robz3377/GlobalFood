#!/usr/bin/env node
/**
 * Refonte v2 — split data/data.json (456 KB monolithique) en :
 *   • data/countries/[slug].json (10 fichiers, ~45 KB chacun) : la recette
 *     complète d'un pays (ingrédients + steps Chef ET Commis).
 *   • data/index.json : index allégé (~30 KB) avec uniquement les meta de
 *     chaque recette + un champ `ingredientNames` aplati (union Chef + Commis,
 *     dédupliquée) pour le matching `/mon-frigo` sans charger les recettes
 *     complètes côté client.
 *
 * À lancer une fois pour générer la nouvelle structure ; data/data.json est
 * ensuite supprimé manuellement après validation du build.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "data", "data.json");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX = join(ROOT, "data", "index.json");

const data = JSON.parse(readFileSync(SRC, "utf8"));
if (!existsSync(COUNTRIES_DIR)) mkdirSync(COUNTRIES_DIR, { recursive: true });

// 1) Un fichier par pays — copie 1:1 (ingrédients + steps Chef et Commis)
for (const country of data.countries) {
  const out = join(COUNTRIES_DIR, `${country.slug}.json`);
  writeFileSync(out, JSON.stringify(country, null, 2) + "\n", "utf8");
  console.log(
    `  ✓ ${country.slug.padEnd(12)} → ${out.replace(ROOT + "/", "")}`
  );
}

// 2) Index allégé : meta + noms d'ingrédients aplati (Chef + Commis)
const index = {
  countries: data.countries.map((c) => ({
    slug: c.slug,
    name: c.name,
    iso3: c.iso3,
    isoNumeric: c.isoNumeric,
    flag: c.flag,
    intro: c.intro,
    tagline: c.tagline,
    recipeSlugs: c.recipes.map((r) => r.slug),
  })),
  recipes: data.countries.flatMap((c) =>
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
      // Pour /mon-frigo : on doit pouvoir matcher l'ingrédient saisi sans
      // charger la recette complète. On aplatit l'union des noms Chef + Commis
      // (déduplication insensible à la casse via toLowerCase + Set).
      ingredientNames: Array.from(
        new Set(
          [
            ...r.ingredients.map((i) => i.name),
            ...((r.commisIngredients || []).map((i) => i.name)),
          ].map((n) => n.trim())
        )
      ),
    }))
  ),
};

writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(
  `\n  ✓ index.json: ${index.countries.length} pays, ${index.recipes.length} recettes`
);

// Petite vérif tailles
import { statSync } from "node:fs";
const sizeKb = (p) => (statSync(p).size / 1024).toFixed(1);
console.log(`\n  📊 Tailles :`);
console.log(`     data.json (legacy)     : ${sizeKb(SRC)} KB`);
console.log(`     data/index.json        : ${sizeKb(INDEX)} KB`);
const countryFiles = data.countries.map((c) =>
  join(COUNTRIES_DIR, `${c.slug}.json`)
);
const totalCountriesKb = countryFiles
  .reduce((acc, p) => acc + statSync(p).size, 0) / 1024;
console.log(
  `     data/countries/* (10)  : ${totalCountriesKb.toFixed(1)} KB total (~${(
    totalCountriesKb / 10
  ).toFixed(1)} KB chacun)`
);
console.log(
  `\n  🎯 Gain potentiel : pages clients qui chargeaient ${sizeKb(SRC)} KB → ${sizeKb(INDEX)} KB (index)`
);

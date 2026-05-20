#!/usr/bin/env node
/**
 * fix-diets.mjs — Strip STRICT des tags régime non conformes.
 *
 * Politique : pour chaque recette, ne garder dans `diets` que les régimes
 * dont aucun ingrédient (Chef + Commis) ne déclenche `disqualifies()`
 * (cf. scripts/lib/dietRules.mjs).
 *
 *   N'AJOUTE JAMAIS de tag (candidats faux-négatifs laissés à la revue
 *   humaine via `audit-diets.mjs`).
 *
 * Modes :
 *   - défaut (sans flag) : DRY-RUN. Imprime les retraits prévus.
 *   - `--apply` : écrit les `data/countries/*.json` (modifie UNIQUEMENT le
 *     champ `diets`). Idempotent.
 *
 * Après `--apply`, relancer `node scripts/map-images-to-recipes.mjs` pour
 * régénérer `data/index.json`.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluateRecipe } from "./lib/dietRules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const APPLY = process.argv.includes("--apply");

let touchedFiles = 0;
let recipesTouched = 0;
let tagsRemoved = 0;
const changes = [];

for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const path = join(COUNTRIES_DIR, file);
  const country = JSON.parse(readFileSync(path, "utf8"));
  let countryChanged = false;

  for (const recipe of country.recipes) {
    const before = Array.isArray(recipe.diets) ? [...recipe.diets] : [];
    if (before.length === 0) continue;

    const { kept, removed } = evaluateRecipe(recipe);
    if (removed.length === 0) continue;

    // On garde uniquement les régimes non disqualifiés (ordre d'origine).
    const after = before.filter((d) => kept.includes(d));
    if (after.length === before.length) continue; // rien à retirer

    recipesTouched++;
    tagsRemoved += removed.length;
    changes.push({
      country: country.slug,
      slug: recipe.slug,
      removed: removed.map((r) => ({
        diet: r.diet,
        ingredient: r.ingredient,
        matched: r.matched,
      })),
      before,
      after,
    });

    if (APPLY) {
      recipe.diets = after;
      countryChanged = true;
    }
  }

  if (APPLY && countryChanged) {
    writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
    touchedFiles++;
  }
}

// === RAPPORT ===
const tag = APPLY ? "APPLY" : "DRY-RUN";
console.log(`\n=== fix-diets [${tag}] ===`);
console.log(
  `Recettes corrigées : ${recipesTouched}  |  Tags retirés : ${tagsRemoved}`
);
if (APPLY) console.log(`Fichiers réécrits  : ${touchedFiles}`);

for (const c of changes) {
  const lost = c.before.filter((d) => !c.after.includes(d));
  console.log(
    `  • ${c.country}/${c.slug} : ${c.before.join(", ") || "∅"} → ${c.after.join(", ") || "∅"}  (retirés : ${lost.join(", ")})`
  );
  for (const r of c.removed) {
    console.log(`        ↳ ${r.diet} bloqué par « ${r.ingredient} » (${r.matched})`);
  }
}

if (!APPLY) {
  console.log(
    `\nDRY-RUN — aucune modification écrite. Relance avec \`--apply\` pour appliquer.\n`
  );
} else {
  console.log(`\n✓ Modifications appliquées. Pense à relancer scripts/map-images-to-recipes.mjs.\n`);
}

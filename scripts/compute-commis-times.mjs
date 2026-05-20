#!/usr/bin/env node
/**
 * compute-commis-times.mjs — Peuple `commisPrepTime` / `commisCookTime`
 * sur toutes les recettes ayant `commisSteps`.
 *
 * Heuristique :
 *   ratio = clamp(commisSteps.length / steps.length, 0.55, 0.90)
 *   commisPrepTime = max(5, round(prepTime * ratio))
 *   commisCookTime = max(0, round(cookTime * ratio * 0.85))
 *
 * Justification du `* 0.85` côté cuisson : le mode Commis utilise des
 * ingrédients « supermarché » et zappe les marinades / réductions longues,
 * d'où une réduction proportionnellement plus marquée sur la cuisson.
 *
 * Overrides : `data/commis-times-overrides.json` (clé `country/slug`)
 * peut forcer des valeurs hand-tunées (typiquement : pâtes levées, plats
 * mijotés avec temps incompressible). Une entrée d'override court-circuite
 * complètement l'heuristique.
 *
 * Idempotent : par défaut, ne réécrit pas les recettes qui ont déjà des
 * `commisPrepTime`/`commisCookTime`. Utiliser `--force` pour recalculer.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const OVERRIDES_PATH = join(ROOT, "data", "commis-times-overrides.json");
const FORCE = process.argv.includes("--force");

const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {};

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

let recipesUpdated = 0;
let filesWritten = 0;
let skipped = 0;
let skippedAlreadySet = 0;

for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const path = join(COUNTRIES_DIR, file);
  const country = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;

  for (const recipe of country.recipes) {
    const key = `${country.slug}/${recipe.slug}`;
    const hasCommis = Array.isArray(recipe.commisSteps) && recipe.commisSteps.length > 0;
    if (!hasCommis) {
      skipped++;
      continue;
    }

    if (
      !FORCE &&
      typeof recipe.commisPrepTime === "number" &&
      typeof recipe.commisCookTime === "number"
    ) {
      skippedAlreadySet++;
      continue;
    }

    let commisPrepTime;
    let commisCookTime;
    const ov = overrides[key];
    if (ov && typeof ov.commisPrepTime === "number" && typeof ov.commisCookTime === "number") {
      commisPrepTime = ov.commisPrepTime;
      commisCookTime = ov.commisCookTime;
    } else {
      const steps = Array.isArray(recipe.steps) ? recipe.steps.length : 0;
      const commis = recipe.commisSteps.length;
      const ratio = steps > 0 ? clamp(commis / steps, 0.55, 0.9) : 0.7;
      commisPrepTime = Math.max(5, Math.round((recipe.prepTime ?? 0) * ratio));
      commisCookTime = Math.max(0, Math.round((recipe.cookTime ?? 0) * ratio * 0.85));
    }

    recipe.commisPrepTime = commisPrepTime;
    recipe.commisCookTime = commisCookTime;
    recipesUpdated++;
    changed = true;
    console.log(
      `  • ${key.padEnd(34)} ${recipe.prepTime}/${recipe.cookTime}  →  Commis ${commisPrepTime}/${commisCookTime}${ov ? "  (override)" : ""}`
    );
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
    filesWritten++;
  }
}

console.log(`\n📊 Bilan :`);
console.log(`  ✓ ${recipesUpdated} recettes mises à jour`);
console.log(`  ⏭  ${skippedAlreadySet} recettes déjà renseignées (skip — utiliser --force pour recalculer)`);
console.log(`  ⏭  ${skipped} recettes sans commisSteps`);
console.log(`  📝 ${filesWritten} fichiers réécrits`);
console.log(`\n→ Relancer \`node scripts/map-images-to-recipes.mjs\` pour régénérer data/index.json.`);

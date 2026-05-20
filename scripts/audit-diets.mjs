#!/usr/bin/env node
/**
 * audit-diets.mjs — Audit STRICT des régimes (lecture seule).
 *
 * Pour chaque recette qui déclare ≥1 régime, on vérifie que TOUS les
 * ingrédients (Chef + Commis) passent les règles de `scripts/lib/dietRules.mjs`.
 * Sortie :
 *   - Markdown structuré sur stdout (visible / copiable)
 *   - JSON détaillé dans `audit-diets-report.json` (à la racine du worktree)
 *
 * Liste aussi les CANDIDATS faux-négatifs (régimes qui pourraient être
 * ajoutés — décision laissée à l'humain, jamais auto-appliquée).
 *
 * AUCUNE modification de fichier.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluateRecipe, ALL_DIETS } from "./lib/dietRules.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const REPORT_PATH = join(ROOT, "audit-diets-report.json");

const violations = [];
const candidatesByDiet = Object.fromEntries(ALL_DIETS.map((d) => [d, []]));

let totalRecipes = 0;
let recipesWithDiet = 0;

for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const country = JSON.parse(readFileSync(join(COUNTRIES_DIR, file), "utf8"));
  for (const recipe of country.recipes) {
    totalRecipes++;
    const declared = Array.isArray(recipe.diets) ? recipe.diets : [];
    if (declared.length > 0) recipesWithDiet++;

    const { kept, removed, candidates } = evaluateRecipe(recipe);
    for (const v of removed) {
      violations.push({
        country: country.slug,
        slug: recipe.slug,
        diet: v.diet,
        ingredient: v.ingredient,
        matched: v.matched,
      });
    }
    for (const c of candidates) {
      candidatesByDiet[c].push(`${country.slug}/${recipe.slug}`);
    }
    // (kept est utile au dry-run du fix ; pas affiché ici.)
  }
}

const byDiet = Object.fromEntries(ALL_DIETS.map((d) => [d, 0]));
for (const v of violations) byDiet[v.diet]++;

const recipesAffected = new Set(violations.map((v) => `${v.country}/${v.slug}`));

// === SORTIE MARKDOWN ===
const lines = [];
lines.push("# Audit régimes — rapport strict");
lines.push("");
lines.push(`Recettes scannées : **${totalRecipes}** (dont ${recipesWithDiet} avec ≥1 régime déclaré)`);
lines.push(`Violations détectées : **${violations.length}** sur **${recipesAffected.size}** recettes`);
lines.push("");
lines.push("## Bilan par régime");
for (const d of ALL_DIETS) {
  lines.push(`- **${d}** : ${byDiet[d]} violation${byDiet[d] > 1 ? "s" : ""}`);
}
lines.push("");
lines.push("## Détail des violations");
for (const d of ALL_DIETS) {
  const block = violations.filter((v) => v.diet === d);
  if (block.length === 0) continue;
  lines.push(`\n### ${d}`);
  for (const v of block) {
    lines.push(`- \`${v.country}/${v.slug}\` — \`${v.ingredient}\`  → motif: \`${v.matched}\``);
  }
}
lines.push("");
lines.push("## Candidats faux-négatifs (régimes potentiellement ajoutables — revue humaine)");
let hasCandidate = false;
for (const d of ALL_DIETS) {
  const list = candidatesByDiet[d];
  if (list.length === 0) continue;
  hasCandidate = true;
  lines.push(`\n### ${d} (${list.length})`);
  for (const s of list.slice(0, 60)) lines.push(`- \`${s}\``);
  if (list.length > 60) lines.push(`- … (+${list.length - 60} autres)`);
}
if (!hasCandidate) lines.push("\n_Aucun candidat._");

process.stdout.write(lines.join("\n") + "\n");

// === RAPPORT JSON ===
writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      summary: { totalRecipes, recipesWithDiet, violations: violations.length, recipesAffected: recipesAffected.size, byDiet },
      violations,
      candidates: candidatesByDiet,
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.error(`\n📝 Rapport JSON écrit : ${REPORT_PATH.replace(ROOT + "/", "")}`);

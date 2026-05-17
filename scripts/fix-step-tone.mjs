#!/usr/bin/env node
/**
 * 2e passe corrective sur normalize-step-tone.mjs :
 *   1) Le script original utilisait le flag `gu` (sans `i`) → les verbes
 *      en début de phrase avec majuscule (Lance, Porte, Mélange, Mets…)
 *      n'étaient pas transformés. On les fixe ici avec flag `giu` et
 *      préservation de la casse.
 *   2) Faux positif : "le mélanger" / "du mélanger" / "un mélanger" /
 *      "le mélanger noix-pistaches" — c'est le NOM "mélange" qui a été
 *      transformé à tort. Reverse : on remet "mélange" après article.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES_DIR = join(__dirname, "..", "data", "countries");

// Mêmes verbes que normalize-step-tone, on re-passe avec flag `i`.
const VERB_MAP = [
  ["aère", "aérer"], ["affermis", "affermir"], ["ajoute", "ajouter"],
  ["ajustes", "ajuster"], ["allume", "allumer"], ["allonge", "allonger"],
  ["amène", "amener"], ["aplatis", "aplatir"], ["arrose", "arroser"],
  ["assemble", "assembler"], ["assaisonne", "assaisonner"], ["attends", "attendre"],
  ["badigeonne", "badigeonner"], ["baisse", "baisser"], ["bats", "battre"],
  ["beurre", "beurrer"], ["blanchis", "blanchir"], ["bouche", "boucher"],
  ["broie", "broyer"], ["brûle", "brûler"], ["calme", "calmer"],
  ["casse", "casser"], ["chauffe", "chauffer"], ["cisèle", "ciseler"],
  ["commence", "commencer"], ["compte", "compter"], ["concasse", "concasser"],
  ["continue", "continuer"], ["coupe", "couper"], ["couvre", "couvrir"],
  ["cuis", "cuire"], ["décongèle", "décongeler"], ["décore", "décorer"],
  ["dégorge", "dégorger"], ["déglace", "déglacer"], ["démoule", "démouler"],
  ["dépose", "déposer"], ["déroule", "dérouler"], ["détache", "détacher"],
  ["détaille", "détailler"], ["dilue", "diluer"], ["dispose", "disposer"],
  ["dissous", "dissoudre"], ["dore", "dorer"], ["dresse", "dresser"],
  ["écale", "écaler"], ["écrase", "écraser"], ["effeuille", "effeuiller"],
  ["effiloche", "effilocher"], ["égoutte", "égoutter"], ["émiette", "émietter"],
  ["émince", "émincer"], ["émulsionne", "émulsionner"], ["enfile", "enfiler"],
  ["enfourne", "enfourner"], ["enrobe", "enrober"], ["étale", "étaler"],
  ["évacue", "évacuer"], ["évite", "éviter"], ["fais", "faire"],
  ["farcis", "farcir"], ["farine", "fariner"], ["filme", "filmer"],
  ["filtre", "filtrer"], ["flambe", "flamber"], ["fonce", "foncer"],
  ["fonds", "fondre"], ["forme", "former"], ["fouette", "fouetter"],
  ["frit", "frire"], ["fris", "frire"], ["garnis", "garnir"],
  ["glisse", "glisser"], ["goûte", "goûter"], ["gratte", "gratter"],
  ["hache", "hacher"], ["humidifie", "humidifier"], ["huile", "huiler"],
  ["incise", "inciser"], ["incorpore", "incorporer"], ["jette", "jeter"],
  ["laisse", "laisser"], ["lance", "lancer"], ["lave", "laver"],
  ["maintiens", "maintenir"], ["mange", "manger"], ["masse", "masser"],
  ["mélange", "mélanger"], ["mets", "mettre"], ["mixe", "mixer"],
  ["monte", "monter"], ["mouille", "mouiller"], ["nappe", "napper"],
  ["nettoie", "nettoyer"], ["ouvre", "ouvrir"], ["paie", "payer"],
  ["pane", "paner"], ["parsème", "parsemer"], ["partage", "partager"],
  ["passe", "passer"], ["pèle", "peler"], ["pétris", "pétrir"],
  ["pince", "pincer"], ["place", "placer"], ["plie", "plier"],
  ["plonge", "plonger"], ["poche", "pocher"], ["pose", "poser"],
  ["porte", "porter"], ["pousse", "pousser"], ["préchauffe", "préchauffer"],
  ["prélève", "prélever"], ["prends", "prendre"], ["prépare", "préparer"],
  ["presse", "presser"], ["protège", "protéger"], ["quadrille", "quadriller"],
  ["râpe", "râper"], ["rajoute", "rajouter"], ["réchauffe", "réchauffer"],
  ["recommence", "recommencer"], ["récupère", "récupérer"], ["réduis", "réduire"],
  ["refais", "refaire"], ["referme", "refermer"], ["refroidis", "refroidir"],
  ["régale", "régaler"], ["réhydrate", "réhydrater"], ["réintroduis", "réintroduire"],
  ["remets", "remettre"], ["remplis", "remplir"], ["remue", "remuer"],
  ["renverse", "renverser"], ["repère", "repérer"], ["replie", "replier"],
  ["répète", "répéter"], ["réserve", "réserver"], ["respecte", "respecter"],
  ["retire", "retirer"], ["retourne", "retourner"], ["réussis", "réussir"],
  ["rince", "rincer"], ["roule", "rouler"], ["sale", "saler"],
  ["saupoudre", "saupoudrer"], ["saute", "sauter"], ["scelle", "sceller"],
  ["sèche", "sécher"], ["sépare", "séparer"], ["serre", "serrer"],
  ["sers", "servir"], ["soude", "souder"], ["sors", "sortir"],
  ["souffle", "souffler"], ["soulève", "soulever"], ["soutiens", "soutenir"],
  ["surveille", "surveiller"], ["taille", "tailler"], ["tamise", "tamiser"],
  ["tapisse", "tapisser"], ["tapote", "tapoter"], ["termine", "terminer"],
  ["tiens", "tenir"], ["tourne", "tourner"], ["tranche", "trancher"],
  ["transfère", "transférer"], ["travaille", "travailler"], ["trempe", "tremper"],
  ["utilise", "utiliser"], ["vérifie", "vérifier"], ["veille", "veiller"],
  ["vide", "vider"], ["vise", "viser"], ["verse", "verser"],
  // Formes vous
  ["ajoutez", "ajouter"], ["faites", "faire"], ["mettez", "mettre"],
  ["versez", "verser"], ["coupez", "couper"], ["chauffez", "chauffer"],
  ["mélangez", "mélanger"], ["réservez", "réserver"], ["servez", "servir"],
  ["préparez", "préparer"],
];

VERB_MAP.sort((a, b) => b[0].length - a[0].length);

function withCase(original, replacement) {
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function transformVerbs(text) {
  let out = text;
  for (const [conjugated, infinitive] of VERB_MAP) {
    // Flag `giu` cette fois (case-insensitive + Unicode + global)
    const re = new RegExp(
      `(?<![\\p{L}'\\u2019])${conjugated}(?![\\p{L}\\u2019])`,
      "giu"
    );
    out = out.replace(re, (m) => withCase(m, infinitive));
  }
  return out;
}

// === FAUX POSITIFS : noms transformés en verbes ===========================
// Quand un nom homonyme d'un verbe (mélange, marche, monte, presse, tour…)
// est précédé d'un article ou d'un déterminant, on REVERSE l'infinitif en
// nom. Liste construite par audit visuel.
const NOUN_REVERTS = [
  // Le/un/du/au mélanger → mélange (nom)
  [/\b(le|du|au|un|ce|son|votre|mon|notre|le bon|le bel)\s+mélanger\b/gi, "$1 mélange"],
  // "consistance d'un mélanger" → "consistance d'un mélange"
  [/\bd'?un mélanger\b/gi, "d'un mélange"],
  // Verbe au présent restant (3e pers) ou nom courant
  [/\b(qui|que|qu')\s+dorer\b/gi, "$1 dore"],
  [/\bqui former\b/gi, "qui forme"],
  // "se chauffer à sec" → "se chauffe à sec" (présent idiomatique de cuisine)
  [/\bse chauffer à sec\b/gi, "se chauffe à sec"],
];

function revertFalsePositives(text) {
  let out = text;
  for (const [re, repl] of NOUN_REVERTS) out = out.replace(re, repl);
  return out;
}

let totalSteps = 0;
let touched = 0;
let verbFixCount = 0;
let nounFixCount = 0;

for (const file of readdirSync(COUNTRIES_DIR)) {
  if (!file.endsWith(".json")) continue;
  const path = join(COUNTRIES_DIR, file);
  const country = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  for (const recipe of country.recipes) {
    for (const key of ["steps", "commisSteps"]) {
      const arr = recipe[key];
      if (!Array.isArray(arr)) continue;
      for (let i = 0; i < arr.length; i++) {
        totalSteps += 1;
        const before = arr[i];
        const stepA = transformVerbs(before);
        const stepB = revertFalsePositives(stepA);
        if (stepB !== before) {
          if (stepA !== before) verbFixCount += 1;
          if (stepB !== stepA) nounFixCount += 1;
          arr[i] = stepB;
          changed = true;
        }
      }
    }
    if (changed) touched += 1;
  }
  if (changed) writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
}

console.log(`✓ ${totalSteps} étapes inspectées, ${touched} recettes touchées.`);
console.log(`  • ${verbFixCount} verbes en début de phrase rattrapés (flag i)`);
console.log(`  • ${nounFixCount} faux positifs noms→verbes reverse-corrigés`);

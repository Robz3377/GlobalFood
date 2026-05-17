#!/usr/bin/env node
/**
 * Normalise le ton éditorial des 838 étapes (550 chef + 288 commis) vers un
 * style NEUTRE INFINITIF type Marmiton. Cible :
 *   • Verbes : impératif (tu/vous) → infinitif. "Mets" → "Mettre", "Faites" →
 *     "Faire", "fais dorer" → "faire dorer".
 *   • Pronoms 2e personne : "tu" / "te" / "ton" / "ta" / "tes" / "toi" /
 *     "t'as" → suppression ou reformulation neutre.
 *   • Vouvoiement : "vous" / "votre" / "vos" → suppression / "le/la".
 *
 * Stratégie :
 *   1. Table de ~120 verbes impératifs courants en cuisine → infinitif. La
 *      table couvre les formes "tu" (mets, fais) ET "vous" (mettez, faites).
 *      Application word-boundary case-insensitive avec préservation de la
 *      casse (mots en début de phrase).
 *   2. Substitutions ciblées pour les pronoms et expressions courantes
 *      ("tu obtiens" → "on obtient", "tes mains" → "les mains", etc.).
 *   3. Audit après : log les phrases qui contiennent encore "tu"/"vous" en
 *      mot isolé pour vérification manuelle (limite 30 lignes).
 *
 * NB : il ne s'agit pas d'une analyse syntaxique parfaite. Sur les ~838
 * étapes, on vise ~98% de couverture propre + ~2% de cas limites
 * acceptables (formulations qui restent lisibles même si imparfaites).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");

// === TABLE DE CONVERSION IMPÉRATIF → INFINITIF ===========================
// Couvre 120+ verbes français courants en cuisine, formes "tu" + "vous".
// Format : [forme conjuguée, infinitif]
// L'ordre matters : les formes plus longues d'abord ("écrase" avant "ase").
//
// IMPORTANT : la forme "fais" est utilisée TRÈS souvent en mode commis
// comme auxiliaire ("fais dorer", "fais chauffer") — la transformation
// "fais" → "faire" donne naturellement "faire dorer", "faire chauffer".
const VERB_MAP = [
  // === Verbes en -e (1er groupe -er, impératif sg = radical sans s) ===
  ["aère", "aérer"],
  ["affermis", "affermir"],
  ["ajoute", "ajouter"],
  ["ajustes", "ajuster"],
  ["allume", "allumer"],
  ["allonge", "allonger"],
  ["amène", "amener"],
  ["aplatis", "aplatir"],
  ["arrose", "arroser"],
  ["assemble", "assembler"],
  ["assaisonne", "assaisonner"],
  ["attends", "attendre"],
  ["badigeonne", "badigeonner"],
  ["baisse", "baisser"],
  ["bats", "battre"],
  ["beurre", "beurrer"],
  ["blanchis", "blanchir"],
  ["bouche", "boucher"],
  ["broie", "broyer"],
  ["brûle", "brûler"],
  ["calme", "calmer"],
  ["casse", "casser"],
  ["chauffe", "chauffer"],
  ["cisèle", "ciseler"],
  ["commence", "commencer"],
  ["compte", "compter"],
  ["concasse", "concasser"],
  ["continue", "continuer"],
  ["coupe", "couper"],
  ["couvre", "couvrir"],
  ["cuis", "cuire"],
  ["décongèle", "décongeler"],
  ["décore", "décorer"],
  ["dégorge", "dégorger"],
  ["déglace", "déglacer"],
  ["démoule", "démouler"],
  ["dépose", "déposer"],
  ["déroule", "dérouler"],
  ["détache", "détacher"],
  ["détaille", "détailler"],
  ["dilue", "diluer"],
  ["dispose", "disposer"],
  ["dissous", "dissoudre"],
  ["dore", "dorer"],
  ["dresse", "dresser"],
  ["écale", "écaler"],
  ["écrase", "écraser"],
  ["effeuille", "effeuiller"],
  ["effiloche", "effilocher"],
  ["égoutte", "égoutter"],
  ["émiette", "émietter"],
  ["émince", "émincer"],
  ["émulsionne", "émulsionner"],
  ["enfile", "enfiler"],
  ["enfourne", "enfourner"],
  ["enrobe", "enrober"],
  ["étale", "étaler"],
  ["évacue", "évacuer"],
  ["évite", "éviter"],
  ["fais", "faire"],
  ["farcis", "farcir"],
  ["farine", "fariner"],
  ["filme", "filmer"],
  ["filtre", "filtrer"],
  ["flambe", "flamber"],
  ["fonce", "foncer"],
  ["fonds", "fondre"],
  ["forme", "former"],
  ["fouette", "fouetter"],
  ["frit", "frire"],
  ["fris", "frire"],
  ["garnis", "garnir"],
  ["glisse", "glisser"],
  ["goûte", "goûter"],
  ["gratte", "gratter"],
  ["hache", "hacher"],
  ["humidifie", "humidifier"],
  ["huile", "huiler"],
  ["incise", "inciser"],
  ["incorpore", "incorporer"],
  ["jette", "jeter"],
  ["laisse", "laisser"],
  ["lance", "lancer"],
  ["lave", "laver"],
  ["maintiens", "maintenir"],
  ["mange", "manger"],
  ["masse", "masser"],
  ["mélange", "mélanger"],
  ["mets", "mettre"],
  ["mixe", "mixer"],
  ["monte", "monter"],
  ["mouille", "mouiller"],
  ["nappe", "napper"],
  ["nettoie", "nettoyer"],
  ["ouvre", "ouvrir"],
  ["paie", "payer"],
  ["pane", "paner"],
  ["parsème", "parsemer"],
  ["partage", "partager"],
  ["passe", "passer"],
  ["pèle", "peler"],
  ["pétris", "pétrir"],
  ["pince", "pincer"],
  ["place", "placer"],
  ["plie", "plier"],
  ["plonge", "plonger"],
  ["poche", "pocher"],
  ["pose", "poser"],
  ["porte", "porter"],
  ["pousse", "pousser"],
  ["préchauffe", "préchauffer"],
  ["prélève", "prélever"],
  ["prends", "prendre"],
  ["prépare", "préparer"],
  ["presse", "presser"],
  ["protège", "protéger"],
  ["quadrille", "quadriller"],
  ["râpe", "râper"],
  ["rajoute", "rajouter"],
  ["réchauffe", "réchauffer"],
  ["recommence", "recommencer"],
  ["récupère", "récupérer"],
  ["réduis", "réduire"],
  ["refais", "refaire"],
  ["referme", "refermer"],
  ["refroidis", "refroidir"],
  ["régale", "régaler"],
  ["réhydrate", "réhydrater"],
  ["réintroduis", "réintroduire"],
  ["remets", "remettre"],
  ["remplis", "remplir"],
  ["remue", "remuer"],
  ["renverse", "renverser"],
  ["repère", "repérer"],
  ["replie", "replier"],
  ["répète", "répéter"],
  ["réserve", "réserver"],
  ["respecte", "respecter"],
  ["retire", "retirer"],
  ["retourne", "retourner"],
  ["réussis", "réussir"],
  ["rince", "rincer"],
  ["roule", "rouler"],
  ["sale", "saler"],
  ["sache", "savoir"], // "sache que" → "à noter que" (cas rare)
  ["saupoudre", "saupoudrer"],
  ["saute", "sauter"],
  ["scelle", "sceller"],
  ["sèche", "sécher"],
  ["sépare", "séparer"],
  ["serre", "serrer"],
  ["sers", "servir"],
  ["soude", "souder"],
  ["sors", "sortir"],
  ["souffle", "souffler"],
  ["soupe", "souper"],
  ["soulève", "soulever"],
  ["soutiens", "soutenir"],
  ["surveille", "surveiller"],
  ["taille", "tailler"],
  ["tamise", "tamiser"],
  ["tapisse", "tapisser"],
  ["tapote", "tapoter"],
  ["termine", "terminer"],
  ["tiens", "tenir"],
  ["tourne", "tourner"],
  ["tranche", "trancher"],
  ["transfère", "transférer"],
  ["travaille", "travailler"],
  ["trempe", "tremper"],
  ["utilise", "utiliser"],
  ["vérifie", "vérifier"],
  ["veille", "veiller"],
  ["vide", "vider"],
  ["vise", "viser"],
  ["verse", "verser"],

  // === Formes vous (2e pers pluriel) — moins courantes mais possibles ===
  ["ajoutez", "ajouter"],
  ["faites", "faire"],
  ["mettez", "mettre"],
  ["versez", "verser"],
  ["coupez", "couper"],
  ["chauffez", "chauffer"],
  ["mélangez", "mélanger"],
  ["réservez", "réserver"],
  ["servez", "servir"],
  ["préparez", "préparer"],
];

// Trie par longueur DÉCROISSANTE pour éviter les matchs partiels (ex: "verses"
// matché par "verse" avant que "versez" passe).
VERB_MAP.sort((a, b) => b[0].length - a[0].length);

/**
 * Préserve la casse du token original (Verse → Verser, verse → verser).
 */
function withCase(original, replacement) {
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Applique la table de verbes. Word boundary Unicode-aware via lookbehind
 * et lookahead négatifs (lettres + apostrophe pour les élisions style "l'").
 */
function transformVerbs(text) {
  let out = text;
  for (const [conjugated, infinitive] of VERB_MAP) {
    const re = new RegExp(
      `(?<![\\p{L}'\\u2019])${conjugated}(?![\\p{L}\\u2019])`,
      "gu"
    );
    out = out.replace(re, (m) => withCase(m, infinitive));
  }
  return out;
}

/**
 * Nettoie les pronoms et déterminants 2e personne après la conversion verbes.
 * Règles pragmatiques. Les substitutions visent un texte LISIBLE plus
 * qu'un texte grammaticalement parfait.
 */
function cleanPronouns(text) {
  let out = text;

  // "tu" en mot isolé → suppression (généralement après "si", "quand")
  // "Quand tu vois" → "Quand on voit" (déjà géré par "vois" → "voir" mais
  // on garde le "tu" → reformulation manuelle non scalable)
  // Stratégie : remplacer "tu " (avec espace) en début de phrase par rien,
  // au milieu par "on " (neutre français).
  out = out.replace(/(?<=^|[.!?]\s)Tu\s+/gu, "");
  out = out.replace(/(?<=[\s,;:])tu\s+/gu, "");

  // "vous" en mot isolé → suppression
  out = out.replace(/(?<=^|[.!?]\s)Vous\s+/gu, "");
  out = out.replace(/(?<=[\s,;:])vous\s+/gu, "");

  // Déterminants possessifs "ton/ta/tes/votre/vos" → "le/la/les" générique
  // "ton four" → "le four", "ta poêle" → "la poêle", "tes mains" → "les mains"
  out = out.replace(/(?<![\p{L}'’])ton\s+/gu, "le ");
  out = out.replace(/(?<![\p{L}'’])Ton\s+/gu, "Le ");
  out = out.replace(/(?<![\p{L}'’])ta\s+/gu, "la ");
  out = out.replace(/(?<![\p{L}'’])Ta\s+/gu, "La ");
  out = out.replace(/(?<![\p{L}'’])tes\s+/gu, "les ");
  out = out.replace(/(?<![\p{L}'’])Tes\s+/gu, "Les ");
  out = out.replace(/(?<![\p{L}'’])votre\s+/gu, "le ");
  out = out.replace(/(?<![\p{L}'’])Votre\s+/gu, "Le ");
  out = out.replace(/(?<![\p{L}'’])vos\s+/gu, "les ");
  out = out.replace(/(?<![\p{L}'’])Vos\s+/gu, "Les ");

  // "toi" → suppression / "soi"
  out = out.replace(/(?<![\p{L}'’])toi\b/gu, "soi");

  // "t'" élision → suppression : "t'as", "t'auras", "t'enfourner"
  // Conservatif : on retire juste le "t'" devant voyelle/h
  out = out.replace(/(?<![\p{L}])t['’](?=[aeiouhAEIOUH])/gu, "");

  // Espaces multiples résultants du nettoyage
  out = out.replace(/[ ]{2,}/g, " ");

  // Trim de chaque ligne (mais on garde les retours)
  return out.trim();
}

function normalize(text) {
  return cleanPronouns(transformVerbs(text));
}

// === EXÉCUTION =============================================================
let touched = 0;
let totalSteps = 0;
const residualTuVous = [];

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
        const after = normalize(before);
        if (after !== before) {
          arr[i] = after;
          changed = true;
        }
        // Détection résidus "tu" / "vous" en mot isolé (audit)
        if (
          /(?<![\p{L}'’])(?:tu|vous|Tu|Vous)(?![\p{L}’])/u.test(after)
        ) {
          residualTuVous.push(`${country.slug}/${recipe.slug} [${key}#${i}] : ${after.slice(0, 120)}`);
        }
      }
    }
    if (changed) touched += 1;
  }
  if (changed) {
    writeFileSync(path, JSON.stringify(country, null, 2) + "\n", "utf8");
  }
}

console.log(`✓ Normalisation : ${totalSteps} étapes traitées, ${touched} recettes modifiées.\n`);

if (residualTuVous.length > 0) {
  console.log(`⚠ Résidus "tu"/"vous" (${residualTuVous.length}) — vérification manuelle :`);
  residualTuVous.slice(0, 30).forEach((l) => console.log(`  ${l}`));
  if (residualTuVous.length > 30) console.log(`  ... + ${residualTuVous.length - 30} autres`);
} else {
  console.log("🎉 Aucun résidu de tutoiement/vouvoiement détecté.");
}

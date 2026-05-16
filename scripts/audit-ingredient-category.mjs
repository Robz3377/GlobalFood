#!/usr/bin/env node
/**
 * Audit — passe tous les noms d'ingrédients (Chef + Commis, 50 recettes,
 * 10 pays) dans la fonction categorizeIngredient et liste :
 *   • Les noms classés "autre" (= fallback raté)
 *   • Les noms suspects (regex de catégorie spécifique appliquée à mauvais
 *     terme — ex: "beurre fondu" classé fromage, "noix de muscade" classé
 *     noix au lieu d'épice).
 *
 * Sortie : tableau trié par catégorie, à analyser visuellement.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES_DIR = join(__dirname, "..", "data", "countries");

// Reproduit la fonction (sans importer le module TS) :
const RULES = [
  [/\b(cure-dents?|brochettes?|ficelle|caissettes?|moule|panier bambou)\b/i, "ustensile"],
  [/\b(vin (rouge|blanc|de bourgogne|de cuisine)?|cognac|marc|marsala|grand marnier|amaretto|ouzo|pastis|cachaça|sake|shaoxing|mirin|saké)\b/i, "alcool"],
  [/(?<!\p{L})(?:œufs?|oeufs?|jaunes? d['']?(?:œuf|oeuf)s?|blancs? d['']?(?:œuf|oeuf)s?)(?!\p{L})/iu, "oeuf"],
  [/\b(coriandre|persil|basilic|menthe|aneth|thym|romarin|laurier|estragon|cerfeuil|ciboule|ciboulette|pandan|mitsuba|oignon vert|negi|sauge|origan)\b/i, "herbe"],
  [/\b(poivre|sel|safran|curcuma|gingembre|cumin|paprika|piment|ras el hanout|garam masala|kashmiri|kasuri methi|fenugrec|cannelle|anis|clou de girofle|vanille|mastic|sumac|all-spice|piment de la jamaïque|5 épices|cinq épices|nigelle|sésame|cardamome|coriandre en poudre|cumin moulu|baies de genièvre)\b/i, "epice"],
  [/\b(fromage|parmesan|parmigiano|mozzarella|fior di latte|feta|ricotta|yaourt|crème|cream cheese|catupiry|kefalotyri|pecorino|cheddar|gruyère|emmental|comté|mascarpone|queijo|burrata|provolone|beurre|ghee|smen|lait|mozza)\b/i, "fromage"],
  [/\b(huile|sauce soja|sauce poisson|nam pla|sauce hoisin|miel|sirop|dendê|tare|tahini|tahin|pâte de tamarin|tamarin|jus de citron|nuoc mam|vinaigre|hong[yo]u|harissa|gochujang|doubanjiang|douchi|chinkiang|ya cai|nam prik pao|rayu)\b/i, "huile-sauce"],
  [/\b(poulet|coq|bœuf|boeuf|veau|agneau|porc|jambon|lardons?|saucisse|chashu|tonkatsu|merguez|carne seca|linguiça|paio|costelinha|jarret|cuisses?|blanc de poulet|hauts? de cuisse|magret|canard|lapin|chair (de )?porc|poitrine|filet de )\b/i, "viande"],
  [/\b(poisson|crevettes?|saumon|thon|lotte|congre|rascasse|saint-pierre|st-pierre|sardine|calamar|encornet|moules|seiche|gamberi|robalo|cabillaud|sébaste|lieu|raviolis chinois|fruits de mer|merlu|grondin|rouget|galinette|kung haeng)\b/i, "poisson"],
  [/\b(citron|orange|mangue|ananas|pomme|banane|datte|raisin|figue|grenade|olive|tomate cerise|fruit)\b/i, "fruit"],
  [/\b(oignon|ail|échalote|carotte|courgette|aubergine|tomate|poivron|papaye|chou|navet|potiron|courge|brocoli|asperge|haricots?|poireau|fenouil|céleri|épinard|salade|laitue|radis|daikon|concombre|patate|pomme de terre|champignon|shiitake|pleurote|paille|bambou|tomatillo|chiles?|piments? poblanos?|piments? ancho|piments? mulato|piments? pasilla|piments? chipotle|germes? de soja|pousses?|tofu|seitan|topinambour|panais)\b/i, "legume"],
  [/\b(riz|nouilles?|pâtes?|spaghetti|tagliatelles?|pain|semoule|farine|polvilho|manioc|tapioca|panko|chapelure|biscuits?|savoiardi|boudoirs?|pita|tortilla|brick|warqa|filo|crêpes? mandarin|vermicelles?|maïzena|fécule|amidon|risotto|carnaroli|arborio|basmati|jasmin|sticky rice|khao niao)\b/i, "cereale"],
  [/\b(cacahuètes?|amandes?|pistaches?|noix|cajou|noisette|graines? de|sésame|tournesol|pignon|fève|haricot mungo|mungo)\b/i, "noix"],
  [/\b(eau|bouillon|dashi|lait de coco|crème de coco)\b/i, "liquide"],
];

function categorize(name) {
  for (const [pattern, cat] of RULES) {
    if (pattern.test(name)) return cat;
  }
  return "autre";
}

// Collecte tous les ingrédients
const allNames = new Set();
for (const file of readdirSync(COUNTRIES_DIR)) {
  if (!file.endsWith(".json")) continue;
  const country = JSON.parse(readFileSync(join(COUNTRIES_DIR, file), "utf8"));
  for (const r of country.recipes) {
    for (const i of r.ingredients) allNames.add(i.name);
    for (const i of r.commisIngredients || []) allNames.add(i.name);
  }
}

console.log(`📊 Total ingrédients uniques : ${allNames.size}\n`);

// Groupe par catégorie
const byCat = {};
for (const name of allNames) {
  const cat = categorize(name);
  if (!byCat[cat]) byCat[cat] = [];
  byCat[cat].push(name);
}

// Affiche
const cats = Object.keys(byCat).sort();
for (const cat of cats) {
  const items = byCat[cat].sort();
  console.log(`\n=== ${cat.toUpperCase()} (${items.length}) ===`);
  for (const name of items) {
    console.log(`  • ${name}`);
  }
}

console.log(`\n📋 Résumé :`);
for (const cat of cats) console.log(`  ${cat.padEnd(15)} ${byCat[cat].length}`);

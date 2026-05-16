#!/usr/bin/env node
/**
 * Audit v2 — reproduit en JS pur la logique de lib/ingredientCategory.ts
 * pour pouvoir tester sans transpiler.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES_DIR = join(__dirname, "..", "data", "countries");

function uRe(alternation) {
  return new RegExp(`(?<!\\p{L})(?:${alternation})(?!\\p{L})`, "iu");
}

const RULES = [
  [uRe("cure-dents?|brochettes?|ficelle|caissettes?|moule|panier bambou"), "ustensile"],
  [uRe("vins?(?: rouges?| blancs?| de bourgogne| de cuisine)?|cognac|marc|marsala|grand marnier|amaretto|ouzo|pastis|cachaça|sake|shaoxing|mirin|saké|cointreau"), "alcool"],
  [uRe("moelles? de (?:bœuf|boeuf)"), "viande"],
  [uRe("tahini|tahin|beurres? de (?:cacahuète|cacahouète|arachide)"), "huile-sauce"],
  [/(?<!\p{L})(?:œufs?|oeufs?|jaunes? d['’]?(?:œuf|oeuf)s?|blancs? d['’]?(?:œuf|oeuf)s?)(?!\p{L})/iu, "oeuf"],
  [uRe("beurres?|ghee|smen"), "beurre"],
  [uRe("lait de coco|crèmes? de coco|lait concentré(?: sucré)?|lait[s]? d['’]amande|lait[s]? d['’]avoine|lait[s]? de soja|lait[s]? de riz"), "liquide"],
  [uRe("sucres?(?: roux| semoule| glace| en poudre| vanillé| de palme| de canne)?|jaggery|piloncillo|cassonade|vergeoise"), "sucre"],
  [uRe("coriandre|persil|basilic|menthe|aneth|thym|romarin|laurier|estragon|cerfeuil|ciboule|ciboulette|pandan|mitsuba|oignons? verts?|negi|sauge|origan|bouquet garni|herbes? de provence|citronnelle|feuilles? de curry|curry leaves|combava|kaffir lime"), "herbe"],
  [uRe("noix de muscade|muscade|cacao|chocolat(?: noir| en poudre)?|poivre|sels?|safran|curcuma|gingembre|galanga|cumin|paprika|piment(?: d['’]espelette| de la jamaïque| de cachemire| en poudre)?|piments|ras el hanout|garam masala|kashmiri|kasuri methi|fenugrec|cannelle|anis(?: étoilé| vert)?|étoiles? de badiane|badiane|clous? de girofle|vanille|mastic|sumac|all-spice|5 épices|cinq épices|nigelle|sésame|cardamome|baies de genièvre|achiote|recado rojo|kombu|nori|wakame|katsuobushi|dashi en poudre|sui mi ya cai|doubanjiang|douchi|chinkiang|hongyou|harissa|gochujang|nam prik pao|rayu|amchoor|pâte ail-gingembre|currys?(?: en poudre)?|asafoetida|hing"), "epice"],
  [uRe("fromages?|parmesan|parmigiano|mozzarella|fior di latte|feta|ricotta|yaourts?|crèmes? (?:fraîche|liquide|épaisse|entière)|crèmes?|cream cheese|catupiry|kefalotyri|pecorino|cheddar|gruyère|emmental|comté|mascarpone|queijo|burrata|provolone|laits?|mozza|queso(?: fresco| oaxaca)?"), "fromage"],
  [uRe("huiles?(?: d['’]olive| de sésame| de coco| neutre| végétale| pimentée| de friture)?|sauces? soja|sauces? poisson|sauces? hoisin|sauces? tomates?|nam pla|nuoc[ -]?mâm|nuoc[ -]?mam|sriracha|coulis(?: de tomates?)?|sirops?|dendê|tare|pâtes? de tamarin|tamarin|jus de citrons?|vinaigres?(?: balsamique| de riz| blanc| de cidre| de vin)?|saindoux|mayonnaises?|miels?|fleur d['’]oranger|concentrés? de tomates?|tzatzikis?"), "huile-sauce"],
  [uRe("poulets?|coqs?|bœufs?|boeufs?|veaux?|agneaux?|porcs?|jambons?|lardons?|saucissons?|saucisses?|chashu|tonkatsu|merguez|carne seca|linguiça|paio|costelinha|jarrets?|cuisses?|magrets?|canards?|lapins?|poitrines?|filets? de (?:porc|bœuf|veau|poulet)|côtes? de (?:porc|veau|bœuf)|hauts? de cuisses?|épaules? d['’]agneau|épaules? de porc|fond de veau|bouillons? de (?:poulet|bœuf|veau|volaille)|pieds? de porc|travers de porc|tranches? de jarret|émincés? de porc|escalopes? de (?:porc|veau)|viandes? hachées?|lap cheong"), "viande"],
  [uRe("poissons?|crevettes?|saumons?|thons?|lottes?|congres?|rascasses?|saint-pierre|st-pierre|sardines?|calamars?|encornets?|moules|seiche|gamberi|robalo|cabillauds?|sébastes?|lieus?|merlus?|grondins?|rougets?|galinette|kung haeng|fruits de mer|soupe de poissons?"), "poisson"],
  [uRe("citrons?(?: verts?| jaunes?)?|zestes? (?:d['’]?orange|de citron)|oranges?|mangues?|ananas|pommes?(?! de terre)|bananes?|dattes?|raisins?|figues?|grenades?|olives?|tomates? cerises?|fruits?|avocats?|noix de coco|cocos? râpées?"), "fruit"],
  [uRe("oignons?|ails?|échalotes?|carottes?|courgettes?|aubergines?|tomates?|poivrons?|papayes?|choux?|bok choy|navets?|potirons?|courges?|brocolis?|asperges?|haricots?|poireaux?|fenouils?|céleris?|épinards?|salades?|laitues?|radis|daikons?|concombres?|patates?|pommes? de terre|champignons?|shiitakes?|pleurotes?|paille|bambous?|tomatillos?|chiles?|piments? (?:poblanos?|anchos?|mulatos?|pasillas?|chipotles?|verts?)|germes? de soja|pousses?|tofus?|seitans?|topinambours?|panais|petits? pois|pois (?:chiches?|gourmands?)|lentilles?|courges? butternut"), "legume"],
  [uRe("riz|nouilles?|pâtes?|spaghettis?|tagliatelles?|pains?|semoules?|farines?|polvilho|maniocs?|tapioca|pankos?|chapelures?|biscuits?|savoiardi|boudoirs?|pitas?|tortillas?|bricks?|warqa|filos?|crêpes?(?: mandarin)?|vermicelles?|maïzena|fécules?|amidons?|risotto|carnaroli|arborio|basmati|jasmin|sticky rice|khao niao|disques? (?:à|de) (?:gyoza|wonton)|galettes? (?:de blé|chinoises?)|baguettes?|tranches? de baguette|tranches? de pain|levures?"), "cereale"],
  [uRe("cacahuètes?|amandes?|pistaches?|noix|cajou|noisettes?|graines? de(?: courge| tournesol| pavot| sésame| moutarde)?|graines? d['’](?:anis|aneth)|pignons?|fèves?|haricots? mungo|mungo|granulado|vermicelles? de chocolat"), "noix"],
  [uRe("eaux?|bouillons?|dashi|cafés?|expressos?|cafés? espressos?|thés?(?: noirs?| verts?| chai)?|infusions?"), "liquide"],
];

function categorize(name) {
  for (const [pattern, cat] of RULES) {
    if (pattern.test(name)) return cat;
  }
  return "autre";
}

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

const TESTS = [
  ["Beurre fondu", "beurre"],
  ["Beurre doux", "beurre"],
  ["Lait de coco entier", "liquide"],
  ["Lait concentré sucré (1 boîte)", "liquide"],
  ["Lait entier", "fromage"],
  ["Noix de muscade en poudre", "epice"],
  ["Noix de coco râpée", "fruit"],
  ["Sucre roux", "sucre"],
  ["Sucre vanillé (1 sachet)", "sucre"],
  ["Aubergines fermes", "legume"],
  ["Tomates concassées en boîte", "legume"],
  ["Carottes", "legume"],
  ["Champignons de Paris", "legume"],
  ["Avocats mûrs", "fruit"],
  ["Café espresso fort, refroidi", "liquide"],
  ["Cacao en poudre amer", "epice"],
  ["Chocolat noir 70%", "epice"],
  ["Bouquet garni (sachet)", "herbe"],
  ["Citronnelle (en bocal, ou 2 tiges fraîches)", "herbe"],
  ["Œufs entiers", "oeuf"],
  ["Jaunes d'œuf", "oeuf"],
  ["Tahini (ou beurre de cacahuète crémeux)", "huile-sauce"],
  ["Moelle de bœuf (chez le boucher) — option : 60 g de beurre supplémentaire", "viande"],
  ["Disques à gyoza/wonton (rayon Asie)", "cereale"],
  ["Petits pois surgelés", "legume"],
  ["Levure fraîche de boulanger", "cereale"],
  ["Asafoetida (hing)", "epice"],
  ["Galanga frais en lamelles fines", "epice"],
  ["Étoile de badiane", "epice"],
  ["Curry en poudre", "epice"],
  ["Sauce nuoc-mâm", "huile-sauce"],
  ["Sriracha (optionnel)", "huile-sauce"],
  ["Tzatziki (en pot ou maison)", "huile-sauce"],
  ["Bok choy babies blanchis 90 sec", "legume"],
  ["Feuilles de curry fraîches", "herbe"],
  ["Feuilles de combava (kaffir lime)", "herbe"],
];

console.log("=== TESTS DE NON-RÉGRESSION ===");
let pass = 0, fail = 0;
for (const [name, expected] of TESTS) {
  const got = categorize(name);
  const ok = got === expected;
  if (ok) pass++;
  else fail++;
  console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(50).slice(0,50)} → ${got.padEnd(12)} (attendu: ${expected})`);
}
console.log(`\nRésultat tests : ${pass}/${TESTS.length} pass, ${fail} fail\n`);

const byCat = {};
for (const name of allNames) {
  const cat = categorize(name);
  if (!byCat[cat]) byCat[cat] = [];
  byCat[cat].push(name);
}

console.log("=== RÉPARTITION ===");
const cats = Object.keys(byCat).sort();
for (const cat of cats) console.log(`  ${cat.padEnd(15)} ${byCat[cat].length}`);

if (byCat.autre && byCat.autre.length > 0) {
  console.log(`\n=== "AUTRE" RESTANT (${byCat.autre.length}) ===`);
  for (const name of byCat.autre.sort()) console.log(`  • ${name}`);
}

/**
 * Catégorisation d'ingrédients par mots-clés — refonte v2.
 *
 * Renvoie un emoji (ou une icône Lucide) + une catégorie pour chaque
 * ingrédient en fonction de son nom. Utilisé par RecipeIngredients pour
 * afficher une icône à gauche de chaque ligne — la composition du plat
 * devient lisible d'un seul coup d'œil.
 *
 * Refonte v2 corrige plusieurs faux positifs :
 *   • "Beurre fondu" était classé FROMAGE → catégorie BEURRE dédiée
 *   • "Lait de coco" était classé FROMAGE → règle LIQUIDE passe AVANT
 *   • "Noix de muscade" était classé NOIX → catégorie ÉPICE
 *   • "Sucre" tombait en AUTRE → catégorie SUCRE dédiée
 *   • "Aubergines"/"Tomates"/"Carottes" pluriels en AUTRE → `s?` ajouté
 *   • Avocat, café, cacao, citronnelle, bouquet garni absents → ajoutés
 *
 * Frontières Unicode : on utilise systématiquement `(?<!\p{L})...(?!\p{L})`
 * avec flag `u` au lieu de `\b` qui ne reconnaît pas les ligatures (`Œ`)
 * ni les lettres accentuées en frontière. C'est la signature de la refonte.
 *
 * Ordre des règles (priorité décroissante) :
 *   1. Ustensiles (à exclure d'abord — pas un ingrédient)
 *   2. Alcools (vins/spiritueux pour cuisine)
 *   3. Œufs
 *   4. Beurres (avant fromage pour ne pas matcher "beurre")
 *   5. Liquides laitiers (lait de coco, lait concentré, avant fromage)
 *   6. Sucres
 *   7. Herbes fraîches (avant épices)
 *   8. Épices (incluant noix de muscade en exception du pattern noix)
 *   9. Fromages & laitiers (sans beurre/lait coco)
 *   10. Huiles / sauces (incluant tahini)
 *   11. Viandes
 *   12. Poissons
 *   13. Fruits
 *   14. Légumes
 *   15. Céréales / féculents
 *   16. Noix & graines (avec exclusion noix de muscade/coco)
 *   17. Liquides génériques (eau, bouillon, etc.)
 *   18. Autre (fallback)
 */

import { Egg, type LucideIcon } from "lucide-react";

export type IngredientCategory =
  | "viande"
  | "poisson"
  | "legume"
  | "fruit"
  | "fromage"
  | "beurre"
  | "oeuf"
  | "cereale"
  | "sucre"
  | "epice"
  | "herbe"
  | "huile-sauce"
  | "alcool"
  | "noix"
  | "liquide"
  | "ustensile"
  | "autre";

export type CategoryInfo = {
  category: IngredientCategory;
  /** Emoji utilisé par défaut (fallback si pas de composant Lucide). */
  icon: string;
  /**
   * Icône Lucide optionnelle. Si présente, RecipeIngredients la rend à la
   * place de l'emoji (rendu plus fin, vectoriel, aligné au reste de l'UI).
   */
  lucide?: LucideIcon;
  /** Couleur Tailwind utilisée pour la pastille de fond de l'icône */
  bgClass: string;
};

const CATEGORIES: Record<
  IngredientCategory,
  { icon: string; bgClass: string; lucide?: LucideIcon }
> = {
  viande: { icon: "🥩", bgClass: "bg-terracotta/15" },
  poisson: { icon: "🐟", bgClass: "bg-sage/20" },
  legume: { icon: "🥦", bgClass: "bg-sage-soft/70" },
  fruit: { icon: "🍋", bgClass: "bg-ochre-soft/60" },
  fromage: { icon: "🧀", bgClass: "bg-bone-deep" },
  beurre: { icon: "🧈", bgClass: "bg-ochre-soft/40" },
  // Œufs : icône Lucide `Egg` (rendu vectoriel cohérent avec le reste UI).
  oeuf: { icon: "🥚", lucide: Egg, bgClass: "bg-ochre-soft/50" },
  cereale: { icon: "🌾", bgClass: "bg-ochre/15" },
  sucre: { icon: "🍬", bgClass: "bg-ochre-soft/40" },
  epice: { icon: "🧂", bgClass: "bg-terracotta-soft/40" },
  herbe: { icon: "🌿", bgClass: "bg-sage-soft/70" },
  "huile-sauce": { icon: "🫒", bgClass: "bg-ochre/15" },
  alcool: { icon: "🍷", bgClass: "bg-terracotta/15" },
  noix: { icon: "🥜", bgClass: "bg-ochre/15" },
  liquide: { icon: "💧", bgClass: "bg-bone-deep" },
  ustensile: { icon: "🪵", bgClass: "bg-bone-deep" },
  autre: { icon: "•", bgClass: "bg-bone-deep" },
};

/**
 * Helper : construit une regex Unicode "frontière de mot stricte" autour
 * d'une alternation. Permet de matcher `aubergines?` même si précédé/suivi
 * d'un mot accentué ou de la ligature `Œ` (que `\b` JS rate).
 *
 * Pattern produit : `(?<!\p{L})(?:${alt})(?!\p{L})/iu`
 */
function uRe(alternation: string): RegExp {
  return new RegExp(`(?<!\\p{L})(?:${alternation})(?!\\p{L})`, "iu");
}

/**
 * Règles de catégorisation, par ordre de priorité décroissante.
 * La première règle qui matche gagne.
 */
const RULES: Array<[RegExp, IngredientCategory]> = [
  // === 1. USTENSILES (à filtrer en premier — pas vraiment un ingrédient) ===
  [
    uRe("cure-dents?|brochettes?|ficelle|caissettes?|moule|panier bambou"),
    "ustensile",
  ],

  // === 2. ALCOOLS (avant épices/sauces) ===
  [
    uRe(
      "vins?(?: rouges?| blancs?| de bourgogne| de cuisine)?|cognac|marc|marsala|grand marnier|amaretto|ouzo|pastis|cachaça|sake|shaoxing|mirin|saké|cointreau"
    ),
    "alcool",
  ],

  // === 3. EXCEPTIONS PRIORITAIRES (avant œuf/beurre/fromage) ===
  // Capture les expressions ambiguës qui matcheraient à tort une catégorie
  // ultérieure. Ex: "moelle de bœuf ... beurre supplémentaire" matchait
  // BEURRE avant viande. "Tahini (ou beurre de cacahuète crémeux)" matchait
  // BEURRE avant huile-sauce.
  [uRe("moelles? de (?:bœuf|boeuf)"), "viande"],
  [uRe("tahini|tahin|beurres? de (?:cacahuète|cacahouète|arachide)"), "huile-sauce"],

  // === 4. ŒUF (avant fromage/laitier qui peut contenir "œuf battu") ===
  // Lookbehind/lookahead Unicode car la ligature Œ n'est pas un word-char JS.
  [
    /(?<!\p{L})(?:œufs?|oeufs?|jaunes? d['’]?(?:œuf|oeuf)s?|blancs? d['’]?(?:œuf|oeuf)s?)(?!\p{L})/iu,
    "oeuf",
  ],

  // === 5. BEURRE & MATIÈRES GRASSES LAITIÈRES (avant fromage) ===
  // Inclut beurre, ghee (beurre clarifié indien), smen (beurre marocain).
  // Capture aussi "beurre fondu/clarifié/doux/demi-sel".
  [uRe("beurres?|ghee|smen"), "beurre"],

  // === 5. LIQUIDES LAITIERS spécifiques (avant fromage) ===
  // "Lait de coco", "lait concentré sucré", "crème de coco" doivent être
  // LIQUIDE (et non fromage qui capturerait "lait" tout seul).
  [
    uRe(
      "lait de coco|crèmes? de coco|lait concentré(?: sucré)?|lait[s]? d['’]amande|lait[s]? d['’]avoine|lait[s]? de soja|lait[s]? de riz"
    ),
    "liquide",
  ],

  // === 6. SUCRES ===
  // "Sucre", "sucre roux", "sucre vanillé", "sucre glace", "sucre de palme",
  // "sucre semoule", "jaggery" (sucre indien), "piloncillo" (sucre mexicain),
  // "miel" (proche du sucre). Le miel reste aussi capturé en huile-sauce
  // pour les "bains de miel", mais cette règle passe AVANT donc gagne pour
  // un ingrédient nommé "miel" seul.
  [
    uRe(
      "sucres?(?: roux| semoule| glace| en poudre| vanillé| de palme| de canne)?|jaggery|piloncillo|cassonade|vergeoise"
    ),
    "sucre",
  ],

  // === 8. HERBES FRAÎCHES (avant épices — la coriandre fraîche est herbe) ===
  [
    uRe(
      "coriandre|persil|basilic|menthe|aneth|thym|romarin|laurier|estragon|cerfeuil|ciboule|ciboulette|pandan|mitsuba|oignons? verts?|negi|sauge|origan|bouquet garni|herbes? de provence|citronnelle|feuilles? de curry|curry leaves|combava|kaffir lime"
    ),
    "herbe",
  ],

  // === 9. ÉPICES & condiments en poudre/grains ===
  // Inclut "noix de muscade" en début (avant la règle noix générique) et
  // "cacao" / "chocolat" (épices dessert dans notre cuisine).
  [
    uRe(
      "noix de muscade|muscade|cacao|chocolat(?: noir| en poudre)?|poivre|sels?|safran|curcuma|gingembre|galanga|cumin|paprika|piment(?: d['’]espelette| de la jamaïque| de cachemire| en poudre)?|piments|ras el hanout|garam masala|kashmiri|kasuri methi|fenugrec|cannelle|anis(?: étoilé| vert)?|étoiles? de badiane|badiane|clous? de girofle|vanille|mastic|sumac|all-spice|5 épices|cinq épices|nigelle|sésame|cardamome|baies de genièvre|achiote|recado rojo|kombu|nori|wakame|katsuobushi|dashi en poudre|sui mi ya cai|doubanjiang|douchi|chinkiang|hongyou|harissa|gochujang|nam prik pao|rayu|amchoor|pâte ail-gingembre|currys?(?: en poudre)?|asafoetida|hing"
    ),
    "epice",
  ],

  // === 9. FROMAGES & LAITIERS (beurre + lait coco déjà exclus plus haut) ===
  [
    uRe(
      "fromages?|parmesan|parmigiano|mozzarella|fior di latte|feta|ricotta|yaourts?|crèmes? (?:fraîche|liquide|épaisse|entière)|crèmes?|cream cheese|catupiry|kefalotyri|pecorino|cheddar|gruyère|emmental|comté|mascarpone|queijo|burrata|provolone|laits?|mozza|queso(?: fresco| oaxaca)?"
    ),
    "fromage",
  ],

  // === 11. HUILES / SAUCES / VINAIGRES ===
  // Tahini & beurre de cacahuète déjà capturés en règle exception §3.
  [
    uRe(
      "huiles?(?: d['’]olive| de sésame| de coco| neutre| végétale| pimentée| de friture)?|sauces? soja|sauces? poisson|sauces? hoisin|sauces? tomates?|nam pla|nuoc[ -]?mâm|nuoc[ -]?mam|sriracha|coulis(?: de tomates?)?|sirops?|dendê|tare|pâtes? de tamarin|tamarin|jus de citrons?|vinaigres?(?: balsamique| de riz| blanc| de cidre| de vin)?|saindoux|mayonnaises?|miels?|fleur d['’]oranger|concentrés? de tomates?|tzatzikis?"
    ),
    "huile-sauce",
  ],

  // === 11. VIANDES ===
  [
    uRe(
      "poulets?|coqs?|bœufs?|boeufs?|veaux?|agneaux?|porcs?|jambons?|lardons?|saucissons?|saucisses?|chashu|tonkatsu|merguez|carne seca|linguiça|paio|costelinha|jarrets?|cuisses?|magrets?|canards?|lapins?|poitrines?|filets? de (?:porc|bœuf|veau|poulet)|côtes? de (?:porc|veau|bœuf)|hauts? de cuisses?|épaules? d['’]agneau|épaules? de porc|moelle de bœuf|fond de veau|bouillons? de (?:poulet|bœuf|veau|volaille)|pieds? de porc|travers de porc|tranches? de jarret|émincés? de porc|escalopes? de (?:porc|veau)|viandes? hachées?|lap cheong"
    ),
    "viande",
  ],

  // === 12. POISSONS & fruits de mer ===
  [
    uRe(
      "poissons?|crevettes?|saumons?|thons?|lottes?|congres?|rascasses?|saint-pierre|st-pierre|sardines?|calamars?|encornets?|moules|seiche|gamberi|robalo|cabillauds?|sébastes?|lieus?|merlus?|grondins?|rougets?|galinette|kung haeng|fruits de mer|soupe de poissons?"
    ),
    "poisson",
  ],

  // === 13. FRUITS ===
  // Avocats ajoutés (introuvables avant). Ananas, mangues, citrons, oranges.
  [
    uRe(
      "citrons?(?: verts?| jaunes?)?|zestes? (?:d['’]?orange|de citron)|oranges?|mangues?|ananas|pommes?(?! de terre)|bananes?|dattes?|raisins?|figues?|grenades?|olives?|tomates? cerises?|fruits?|avocats?|noix de coco|cocos? râpées?"
    ),
    "fruit",
  ],

  // === 15. LÉGUMES (générique large — pluriels gérés via s?) ===
  [
    uRe(
      "oignons?|ails?|échalotes?|carottes?|courgettes?|aubergines?|tomates?|poivrons?|papayes?|choux?|bok choy|navets?|potirons?|courges?|brocolis?|asperges?|haricots?|poireaux?|fenouils?|céleris?|épinards?|salades?|laitues?|radis|daikons?|concombres?|patates?|pommes? de terre|champignons?|shiitakes?|pleurotes?|paille|bambous?|tomatillos?|chiles?|piments? (?:poblanos?|anchos?|mulatos?|pasillas?|chipotles?|verts?)|germes? de soja|pousses?|tofus?|seitans?|topinambours?|panais|petits? pois|pois (?:chiches?|gourmands?)|lentilles?|courges? butternut"
    ),
    "legume",
  ],

  // === 15. CÉRÉALES & féculents ===
  // "Disques" ajouté (gyoza/wonton), "tapioca/manioc", "pâtes à pizza/brisée".
  [
    uRe(
      "riz|nouilles?|pâtes?|spaghettis?|tagliatelles?|pains?|semoules?|farines?|polvilho|maniocs?|tapioca|pankos?|chapelures?|biscuits?|savoiardi|boudoirs?|pitas?|tortillas?|bricks?|warqa|filos?|crêpes?(?: mandarin)?|vermicelles?|maïzena|fécules?|amidons?|risotto|carnaroli|arborio|basmati|jasmin|sticky rice|khao niao|disques? (?:à|de) (?:gyoza|wonton)|galettes? (?:de blé|chinoises?)|baguettes?|tranches? de baguette|tranches? de pain|levures?"
    ),
    "cereale",
  ],

  // === 16. NOIX & graines (avec exception pour muscade/coco déjà gérées) ===
  // "noix de muscade" et "noix de coco" sont matchées AVANT par épice/fruit
  // donc on peut garder un pattern noix générique.
  [
    uRe(
      "cacahuètes?|amandes?|pistaches?|noix|cajou|noisettes?|graines? de(?: courge| tournesol| pavot| sésame| moutarde)?|graines? d['’](?:anis|aneth)|pignons?|fèves?|haricots? mungo|mungo|granulado|vermicelles? de chocolat"
    ),
    "noix",
  ],

  // === 17. LIQUIDES (générique, en dernier filet de sécurité) ===
  [
    uRe(
      "eaux?|bouillons?|dashi|cafés?|expressos?|cafés? espressos?|thés?(?: noirs?| verts?| chai)?|infusions?"
    ),
    "liquide",
  ],
];

/**
 * Catégorise un ingrédient par son nom et renvoie l'icône + la classe de fond.
 * Si la catégorie a un composant Lucide enregistré (ex: `Egg` pour œufs), il
 * est exposé via la clé `lucide`, sinon seul l'emoji `icon` est fourni.
 * Fallback: "autre" (point neutre).
 */
export function categorizeIngredient(name: string): CategoryInfo {
  for (const [pattern, cat] of RULES) {
    if (pattern.test(name)) {
      return { category: cat, ...CATEGORIES[cat] };
    }
  }
  return { category: "autre", ...CATEGORIES.autre };
}

/**
 * Catégorisation d'ingrédients par mots-clés.
 *
 * Renvoie un emoji (ou une icône Lucide) + une catégorie pour chaque
 * ingrédient en fonction de son nom. Utilisé par RecipeIngredients pour
 * afficher une icône à gauche de chaque ligne — la composition du plat
 * devient lisible d'un seul coup d'œil.
 *
 * Logique : matching par regex avec priorité (la première règle qui matche
 * gagne). L'ordre est important : les règles spécifiques (épices, herbes,
 * alcool) passent avant les règles génériques (liquide).
 *
 * Notes Unicode : la ligature `Œ`/`œ` (U+0152/U+0153) n'est PAS reconnue
 * comme un word-character par `\w` en JS, donc `\bŒufs\b` échoue. Les règles
 * impliquant ces ligatures utilisent des lookbehind/lookahead Unicode
 * (`(?<!\p{L})`/`(?!\p{L})`) avec le flag `u` pour matcher correctement.
 */

import { Egg, type LucideIcon } from "lucide-react";

export type IngredientCategory =
  | "viande"
  | "poisson"
  | "legume"
  | "fruit"
  | "fromage"
  | "oeuf"
  | "cereale"
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
  // Œufs : icône Lucide `Egg` (le fallback `\b` JS rate la ligature Œ ; le
  // rendu vectoriel garantit aussi un alignement parfait avec les autres
  // icônes UI lorsque l'item s'affiche dans la liste Commis).
  oeuf: { icon: "🥚", lucide: Egg, bgClass: "bg-ochre-soft/50" },
  cereale: { icon: "🌾", bgClass: "bg-ochre/15" },
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
 * Règles de catégorisation, par ordre de priorité.
 * Chaque règle est un tuple [regex, catégorie].
 * La regex est insensible à la casse et matche le nom de l'ingrédient.
 */
const RULES: Array<[RegExp, IngredientCategory]> = [
  // === USTENSILES (à filtrer en premier — pas vraiment un ingrédient) ===
  [/\b(cure-dents?|brochettes?|ficelle|caissettes?|moule|panier bambou)\b/i, "ustensile"],

  // === ALCOOLS (avant épices/sauces) ===
  [/\b(vin (rouge|blanc|de bourgogne|de cuisine)?|cognac|marc|marsala|grand marnier|amaretto|ouzo|pastis|cachaça|sake|shaoxing|mirin|saké)\b/i, "alcool"],

  // === ŒUF (avant fromage/laitier qui peut contenir le mot "œuf battu") ===
  // Lookbehind/lookahead Unicode (`\p{L}` + flag `u`) car la ligature `Œ`
  // n'est pas reconnue par `\b` (qui se base sur `\w` ASCII). Sans ça,
  // "Œufs entiers" ne matche pas et tombe en catégorie "autre".
  [
    /(?<!\p{L})(?:œufs?|oeufs?|jaunes? d['']?(?:œuf|oeuf)s?|blancs? d['']?(?:œuf|oeuf)s?)(?!\p{L})/iu,
    "oeuf",
  ],

  // === HERBES FRAÎCHES (avant épices — la coriandre fraîche est herbe, pas épice) ===
  [/\b(coriandre|persil|basilic|menthe|aneth|thym|romarin|laurier|estragon|cerfeuil|ciboule|ciboulette|pandan|mitsuba|oignon vert|negi|sauge|origan)\b/i, "herbe"],

  // === ÉPICES & condiments en poudre/grains ===
  [/\b(poivre|sel|safran|curcuma|gingembre|cumin|paprika|piment|ras el hanout|garam masala|kashmiri|kasuri methi|fenugrec|cannelle|anis|clou de girofle|vanille|mastic|sumac|all-spice|piment de la jamaïque|5 épices|cinq épices|nigelle|sésame|cardamome|coriandre en poudre|cumin moulu|baies de genièvre)\b/i, "epice"],

  // === FROMAGES & LAITIERS ===
  [/\b(fromage|parmesan|parmigiano|mozzarella|fior di latte|feta|ricotta|yaourt|crème|cream cheese|catupiry|kefalotyri|pecorino|cheddar|gruyère|emmental|comté|mascarpone|queijo|burrata|provolone|beurre|ghee|smen|lait|mozza)\b/i, "fromage"],

  // === HUILES / SAUCES / VINAIGRES ===
  [/\b(huile|sauce soja|sauce poisson|nam pla|sauce hoisin|miel|sirop|dendê|tare|tahini|tahin|pâte de tamarin|tamarin|jus de citron|nuoc mam|vinaigre|hong[yo]u|harissa|gochujang|doubanjiang|douchi|chinkiang|ya cai|nam prik pao|rayu)\b/i, "huile-sauce"],

  // === VIANDES ===
  [/\b(poulet|coq|bœuf|boeuf|veau|agneau|porc|jambon|lardons?|saucisse|chashu|tonkatsu|merguez|carne seca|linguiça|paio|costelinha|jarret|cuisses?|blanc de poulet|hauts? de cuisse|magret|canard|lapin|chair (de )?porc|poitrine|filet de )\b/i, "viande"],

  // === POISSONS & fruits de mer ===
  [/\b(poisson|crevettes?|saumon|thon|lotte|congre|rascasse|saint-pierre|st-pierre|sardine|calamar|encornet|moules|seiche|gamberi|robalo|cabillaud|sébaste|lieu|raviolis chinois|fruits de mer|merlu|grondin|rouget|galinette|kung haeng)\b/i, "poisson"],

  // === FRUITS ===
  [/\b(citron|orange|mangue|ananas|pomme|banane|datte|raisin|figue|grenade|olive|tomate cerise|fruit)\b/i, "fruit"],

  // === LÉGUMES (générique large — passe après fruits car "tomate cerise" matche fruit) ===
  [/\b(oignon|ail|échalote|carotte|courgette|aubergine|tomate|poivron|papaye|chou|navet|potiron|courge|brocoli|asperge|haricots?|poireau|fenouil|céleri|épinard|salade|laitue|radis|daikon|concombre|patate|pomme de terre|champignon|shiitake|pleurote|paille|bambou|tomatillo|chiles?|piments? poblanos?|piments? ancho|piments? mulato|piments? pasilla|piments? chipotle|germes? de soja|pousses?|tofu|seitan|topinambour|panais)\b/i, "legume"],

  // === CÉRÉALES & féculents ===
  [/\b(riz|nouilles?|pâtes?|spaghetti|tagliatelles?|pain|semoule|farine|polvilho|manioc|tapioca|panko|chapelure|biscuits?|savoiardi|boudoirs?|pita|tortilla|brick|warqa|filo|crêpes? mandarin|vermicelles?|maïzena|fécule|amidon|risotto|carnaroli|arborio|basmati|jasmin|sticky rice|khao niao)\b/i, "cereale"],

  // === NOIX & graines ===
  [/\b(cacahuètes?|amandes?|pistaches?|noix|cajou|noisette|graines? de|sésame|tournesol|pignon|fève|haricot mungo|mungo)\b/i, "noix"],

  // === LIQUIDES (générique, en dernier filet de sécurité) ===
  [/\b(eau|bouillon|dashi|lait de coco|crème de coco)\b/i, "liquide"],
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

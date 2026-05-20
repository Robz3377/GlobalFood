/**
 * dietRules.mjs — Règles strictes de conformité aux régimes alimentaires.
 *
 * Politique : un tag (`vegan`, `vegetarian`, `gluten-free`, `dairy-free`)
 * n'est conservé que si la liste d'ingrédients PAR DÉFAUT est conforme,
 * APRÈS retrait des parenthèses. Les mentions « (ou X) » dans le nom d'un
 * ingrédient ne légitiment PAS le tag : l'utilisateur cuisine la version
 * principale.
 *
 * Anti-faux-positifs documentés :
 *   - Laits/crèmes/beurres VÉGÉTAUX (coco/amande/avoine/soja/riz/noisette,
 *     cacahuète/cajou/karité) → neutralisés (n'agissent ni en dairy ni en
 *     "beurre").
 *   - « Coeur de boeuf » = variété de tomate → ne déclenche pas viande.
 *   - Tamari → considéré sans gluten (convention industrie/cuisine
 *     japonaise traditionnelle).
 *   - Farines GF explicites (riz, maïs, manioc, sarrasin, coco, etc.) →
 *     non flagguées en gluten-free.
 */

const DIACRITICS = /[̀-ͯ]/g;

export function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

export function stripParenthetical(s) {
  return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

// Frontières ASCII (la normalisation a déjà retiré les diacritiques).
const WB = "(?:^|[^a-z0-9])";
const WE = "(?:$|[^a-z0-9])";
const wrap = (alts) => new RegExp(`${WB}(?:${alts.join("|")})${WE}`, "i");

// =========================================================================
// WHITELISTS — retirées du texte avant les vérifications strictes
// =========================================================================

const PLANT_MILK_RE = /lait[s]? (?:de |d['' ])?(coco|amande[s]?|avoine|soja|riz|noisette[s]?|chanvre)/i;
const PLANT_CREAM_RE = /crem(?:e|es) (?:de |d['' ])?(coco|amande[s]?|cajou|cacahuete[s]?|noisette[s]?|riz|soja|noix de coco)/i;
const PLANT_BUTTER_RE = /beurre[s]? (?:de |d['' ])?(cacahuete[s]?|cacahouete[s]?|arachide[s]?|amande[s]?|noix|cajou|coco|karite|cacao|sesame|tahin|tahini|noisette[s]?)/i;
const PLANT_YOGURT_RE = /yaourt[s]? (?:au |de |d['' ])?(coco|soja|amande[s]?|avoine|riz)/i;
const TOMATO_VARIETY_RE = /coeur[s]? de boeuf/i; // variété de tomate
const TAMARI_RE = /tamari/i; // sans gluten par convention
// « Agneau/veau/porcelet de lait » = jeune animal, PAS un produit laitier.
const SUCKLING_RE = /(?:agneau|agneaux|veau|veaux|porcelet[s]?|cochon[s]? )(?: |-)de lait/i;
const GF_FLOUR_RE =
  /farine[s]? (?:de |d['' ])?(riz|mais|manioc|sarrasin|coco|amande[s]?|pois|chataigne|millet|chanvre|teff|sorgho)/i;
// Farine de manioc dans toutes ses formulations (français + portugais).
const CASSAVA_FLOUR_RE =
  /manioc[s]? farine[s]?|farinha de mandioca|farine[s]? de manioc|manioc fariné|manioc farine|manioc[s]? grille[s]?/i;
// « Sucre semoule » = sucre en cristaux fins, AUCUN rapport avec la semoule de blé.
const SUGAR_GRADE_RE = /sucre[s]? (?:en )?semoule[s]?/i;
// Tortillas / pita / galettes au MAÏS ou au RIZ → sans gluten.
const CORN_RICE_WRAP_RE =
  /(?:tortilla[s]?|pita[s]?|galette[s]?|pain[s]?|nouilles?|vermicelles?|pates) (?:de |au |aux )?(mais|riz)/i;
const PLANT_PROTEIN_OK_FOR_GF_RE = /seitan/i; // seitan reste hors GF
// (le seitan n'est PAS retiré — il déclenche bien la règle gluten)

/**
 * Retire les expressions « inoffensives » du texte avant de chercher des
 * disqualifiers. On agit par REMPLACEMENT par un espace pour préserver les
 * frontières de mot des termes restants.
 */
function neutralizeWhitelists(s) {
  let out = s;
  out = out.replace(TOMATO_VARIETY_RE, " ");
  out = out.replace(SUCKLING_RE, " "); // « agneau de lait » → pas du lait
  out = out.replace(PLANT_MILK_RE, " ");
  out = out.replace(PLANT_CREAM_RE, " ");
  out = out.replace(PLANT_BUTTER_RE, " ");
  out = out.replace(PLANT_YOGURT_RE, " ");
  out = out.replace(GF_FLOUR_RE, " ");
  out = out.replace(CASSAVA_FLOUR_RE, " ");
  out = out.replace(SUGAR_GRADE_RE, " "); // « sucre semoule » ≠ semoule de blé
  out = out.replace(CORN_RICE_WRAP_RE, " "); // tortilla/pita/galette de maïs ou riz = GF
  // « Tamari » retiré uniquement pour la vérification gluten-free, traité plus bas.
  return out;
}

// =========================================================================
// DISQUALIFIERS
// =========================================================================

const MEAT_RE = wrap([
  "poulet[s]?", "coq[s]?", "boeuf[s]?", "veau[x]?", "agneau[x]?", "porc[s]?",
  "jambon[s]?", "lardon[s]?", "saucisse[s]?", "saucisson[s]?", "merguez",
  "canard[s]?", "lapin[s]?", "magret[s]?", "jarret[s]?", "cuisse[s]?",
  "filet[s]? (?:de )?(?:porc|boeuf|veau|poulet)",
  "cote[s]? (?:de )?(?:porc|veau|boeuf)",
  "haut[s]? de cuisse[s]?",
  "epaule[s]? (?:d['' ])?(?:agneau|porc)",
  "viande[s]?(?: hachee[s]?)?",
  "chashu", "tonkatsu", "lap cheong", "chorizo", "linguica", "paio",
  "carne seca", "costelinha", "tranche[s]? de jarret",
  "emince[s]? de porc", "moelle[s]? de boeuf",
  "fond[s]? de veau",
  "bouillon[s]? de (?:poulet|boeuf|veau|volaille|viande)",
  "pieds? de porc", "travers de porc",
  "escalope[s]? de (?:porc|veau)",
  "saindoux", "bacon", "speck", "pancetta", "guanciale",
  "rillettes", "confit de canard", "foie gras",
  "picanha", "rumsteak", "rumsteck", "tournedos", "noix d['' ]?epaule",
  "abats", "ris de veau", "tripes", "andouillette",
]);

const FISH_RE = wrap([
  "poisson[s]?", "crevette[s]?", "saumon[s]?", "thon[s]?",
  "lotte[s]?", "cabillaud[s]?", "morue[s]?", "merlu[s]?", "lieu[s]?",
  "rouget[s]?", "sebaste[s]?", "sardine[s]?", "anchois", "anchoy[s]?",
  "calamar[s]?", "encornet[s]?", "seiche[s]?", "poulpe[s]?", "moule[s]?",
  "huitre[s]?", "palourde[s]?", "coquille[s]? saint[- ]?jacques",
  "homard[s]?", "langoustine[s]?", "crabe[s]?", "ecrevisse[s]?",
  "fruits? de mer", "soupe[s]? de poisson[s]?",
  "rascasse[s]?", "congre[s]?", "saint[- ]?pierre", "st[- ]?pierre",
  "katsuobushi", "dashi(?: en poudre)?",
  "sauce[s]? poisson", "nam pla", "nuoc[ -]?mam", "nuoc[ -]?ma['' ]?m",
  "kung haeng", "anchoyade", "bottarga", "galinette",
  "yett", "guedj", // poisson fumé sénégalais
]);

const EGG_RE = wrap([
  "oeuf[s]?", "jaune[s]? d['' ]?oeuf[s]?", "blanc[s]? d['' ]?oeuf[s]?",
]);

const HONEY_RE = wrap(["miel[s]?"]);
const GELATIN_RE = wrap(["gelatine[s]?"]);

const DAIRY_RE = wrap([
  "lait[s]?", "beurre[s]?", "crem(?:e|es)", "yaourt[s]?", "kefir",
  "fromage[s]?", "parmesan", "parmigiano", "mozzarella", "feta", "ricotta",
  "mascarpone", "ghee", "smen", "gruyere", "comte", "cheddar", "brie",
  "camembert", "chevre[s]?", "halloumi", "burrata", "provolone", "pecorino",
  "kefalotyri", "queijo", "queso(?: fresco| oaxaca)?", "catupiry",
  "cream cheese", "lait[s]? concentre(?:s)?(?: sucre[s]?)?", "lactose",
  "babeurre", "creme[s]? fraiche[s]?",
]);

// GLUTEN — plus structuré : on autorise quelques patterns puis on flag.
const GLUTEN_PATTERNS = wrap([
  "bles?", // blé
  "farine[s]?", // farine sans qualificatif GF (déjà neutralisée si "farine de riz" etc.)
  "t45", "t55", "t65", "t80", "t110", "t150",
  "semoule[s]?(?: de ble| fine)?",
  "couscous",
  "boulgour",
  "orge", "seigle", "kamut", "epeautre",
  "pain[s]?", "baguette[s]?", "brioche[s]?",
  "pita[s]?", "tortilla[s]?",
  "pate[s]? (?:feuilletee|brisee|sablee|a pizza|a pain)",
  "pates(?: fraiches| seches)?", // pâtes alimentaires génériques
  "spaghetti[s]?", "tagliatelle[s]?", "penne[s]?", "lasagne[s]?",
  "vermicelles? de ble",
  "raviolis?",
  "gyoza", "wonton[s]?", "gnocchi[s]?",
  "seitan",
  "atta", "manti",
  "panko", "chapelure[s]?",
  "biscuit[s]?", "savoiardi", "boudoirs?",
  "phyllo", "filo", "warqa", "brick[s]?", "feuilles? de brick",
  "galettes? de ble", "disques? (?:a|de) (?:gyoza|wonton)",
  "croissant[s]?",
  "sauce[s]? soja",
  "polvilho(?:!)", // marker — polvilho est GF, on le rendra inerte ; placeholder neutre
]);

// =========================================================================
// API publique
// =========================================================================

function matchOf(re, str) {
  const m = str.match(re);
  return m ? m[0].trim().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "") : null;
}

/**
 * Renvoie le motif fautif (chaîne) si l'ingrédient disqualifie le régime,
 * sinon `null`.
 */
export function disqualifies(rawName, diet) {
  if (!rawName) return null;
  const cleaned = normalize(stripParenthetical(String(rawName)));
  // Whitelists : on neutralise les expressions sûres avant les regex strictes.
  const masked = neutralizeWhitelists(cleaned);

  switch (diet) {
    case "vegan": {
      const m =
        matchOf(MEAT_RE, masked) ||
        matchOf(FISH_RE, masked) ||
        matchOf(EGG_RE, masked) ||
        matchOf(HONEY_RE, masked) ||
        matchOf(GELATIN_RE, masked) ||
        matchOf(DAIRY_RE, masked);
      return m;
    }
    case "vegetarian": {
      const m =
        matchOf(MEAT_RE, masked) ||
        matchOf(FISH_RE, masked) ||
        matchOf(GELATIN_RE, masked);
      return m;
    }
    case "dairy-free": {
      return matchOf(DAIRY_RE, masked);
    }
    case "gluten-free": {
      // Tamari : retiré (GF par convention) ; reste « sauce soja » non-tamari.
      const gfMasked = masked.replace(TAMARI_RE, " ");
      // Le pattern interne ajoutait un marqueur factice "polvilho" — on le
      // retire littéralement avant le test (whitelist par effet de bord :
      // polvilho est un amidon de manioc, sans gluten).
      const noWhitelist = gfMasked.replace(/polvilho/g, " ");
      return matchOf(GLUTEN_PATTERNS, noWhitelist);
    }
    default:
      return null;
  }
}

/** Liste fermée des régimes audités. */
export const ALL_DIETS = ["vegan", "vegetarian", "gluten-free", "dairy-free"];

/**
 * Pour une recette, renvoie { kept, removed: [{diet, ingredient, matched}] }.
 * `recipe.diets` = liste actuelle. Inspecte ingredients[].name +
 * commisIngredients[].name.
 */
export function evaluateRecipe(recipe) {
  const declared = Array.isArray(recipe.diets) ? recipe.diets : [];
  const allIngredients = [
    ...(recipe.ingredients ?? []),
    ...(recipe.commisIngredients ?? []),
  ];

  const removed = [];
  const kept = [];

  for (const diet of declared) {
    if (!ALL_DIETS.includes(diet)) {
      kept.push(diet); // tag inconnu — on ne touche pas
      continue;
    }
    let firstViolation = null;
    for (const ing of allIngredients) {
      const matched = disqualifies(ing.name, diet);
      if (matched) {
        firstViolation = { diet, ingredient: ing.name, matched };
        break;
      }
    }
    if (firstViolation) removed.push(firstViolation);
    else kept.push(diet);
  }

  // Candidats faux-négatifs : régimes non déclarés mais conformes.
  const candidates = [];
  for (const diet of ALL_DIETS) {
    if (declared.includes(diet)) continue;
    const violated = allIngredients.some((i) => disqualifies(i.name, diet));
    if (!violated) candidates.push(diet);
  }

  return { kept, removed, candidates };
}

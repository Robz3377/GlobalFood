#!/usr/bin/env node
/**
 * Lot 4 — Mexique : ajoute commisIngredients + commisSteps aux 5 recettes
 * mexicaines et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Tacos al pastor : Cochon des Prés (Solène), Voyages au Mexique, L'île aux épices
 *   (marinade simplifiée paprika fumé + jus d'ananas, sans piments mexicains séchés)
 * - Guacamole totopos : TopAssiette authentique, El Nopalito, Maman Guide
 *   (tortillas chips du sachet au lieu de totopos maison ; oignon rouge OK)
 * - Mole poblano : Un Jour Une Recette, Audinette, Quitoque
 *   (version simplifiée : chocolat 70% + paprika + cube de bouillon, sans 4 piments)
 * - Enchiladas verdes : recettes.com, mexicanrecipes.me, La Chipilina Parisina
 *   (tomatillos en boîte, feta émiettée au lieu de queso fresco, crème fraîche)
 * - Chiles rellenos : Repasimple, Recettes du Monde, La Petite Bette
 *   (poivrons verts au lieu de poblanos introuvables, mozzarella au lieu d'Oaxaca)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "tacos-al-pastor": {
    commisIngredients: [
      { name: "Émincé de porc (échine ou filet)", qty: 600, unit: "g" },
      { name: "Tortillas de blé ou maïs (supermarché)", qty: 10, unit: "u" },
      { name: "Jus d'ananas (briquette ou frais)", qty: 200, unit: "ml" },
      { name: "Vinaigre blanc ou de cidre", qty: 3, unit: "c. à soupe" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Oignon rouge", qty: 1, unit: "u" },
      { name: "Paprika fumé", qty: 2, unit: "c. à soupe" },
      { name: "Cumin moulu", qty: 1, unit: "c. à soupe" },
      { name: "Origan séché", qty: 1, unit: "c. à café" },
      { name: "Concentré de tomates", qty: 1, unit: "c. à soupe" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
      { name: "Ananas en tranches (frais ou boîte)", qty: 200, unit: "g" },
      { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
      { name: "Citrons verts (servir)", qty: 2, unit: "u" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Dans un grand saladier, mélange le jus d'ananas + vinaigre + ail écrasé + paprika fumé + cumin + origan + concentré de tomates + 1 c.s. d'huile + sel. Ajoute le porc émincé, mélange et laisse mariner 30 min minimum (1 h c'est mieux).",
      "Émince finement l'oignon rouge, cisèle la coriandre, coupe les citrons verts en quartiers, et coupe les tranches d'ananas en petits dés. Réserve dans des bols séparés (style taqueria).",
      "Fais chauffer une grande poêle à feu vif avec 1 c.s. d'huile. Égoutte le porc en gardant la marinade. Étale la viande en une seule couche et fais saisir 5 min en remuant, jusqu'à coloration dorée caramel sur les bords.",
      "Verse un peu de marinade dans la poêle et laisse réduire 2 min : la viande doit être glacée par la sauce sans baigner dedans.",
      "Réchauffe les tortillas 30 s par face dans une poêle sèche bien chaude (ou 10 s au micro-ondes couvertes d'un torchon humide). Empile-les dans un torchon pour qu'elles restent souples.",
      "Pour servir, dépose une cuillerée de porc sur chaque tortilla, garnis de quelques dés d'ananas, d'oignon rouge ciselé et de beaucoup de coriandre. Presse un quartier de citron vert juste avant de croquer.",
    ],
  },
  "guacamole-totopos": {
    commisIngredients: [
      { name: "Avocats mûrs", qty: 3, unit: "u" },
      { name: "Citron vert", qty: 1, unit: "u" },
      { name: "Oignon rouge (ou blanc)", qty: 0.5, unit: "u" },
      { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
      { name: "Tomates cerise (optionnel)", qty: 6, unit: "u" },
      { name: "Piment en poudre (ou jalapeño en bocal)", qty: 1, unit: "pincée" },
      { name: "Sel fin", qty: 1, unit: "c. à café" },
      { name: "Tortillas chips (sachet)", qty: 150, unit: "g" },
    ],
    commisSteps: [
      "Coupe les avocats en 2, retire les noyaux. Récupère la chair à la cuillère dans un grand bol. Presse le jus du citron vert dessus IMMÉDIATEMENT — c'est l'anti-noircissement.",
      "Émince très finement le demi-oignon rouge. Cisèle finement la coriandre (feuilles, sans les tiges dures). Coupe les tomates cerise en petits dés (épépine-les si tu veux moins liquide).",
      "Écrase la chair des avocats à la fourchette en gardant des morceaux — la texture rustique fait l'authenticité. Surtout pas de mixeur, ça fait de la purée pour bébé.",
      "Ajoute l'oignon, la coriandre, les tomates, 1 pincée de piment et 1 c.c. de sel. Mélange délicatement à la fourchette. Goûte, rectifie sel et citron vert.",
      "Sers immédiatement dans un grand bol avec les tortillas chips à côté pour piocher. Si tu dois attendre, pose un film plastique AU CONTACT du guacamole (jamais juste sur le bol) pour éviter qu'il noircisse.",
    ],
  },
  "mole-poblano": {
    commisIngredients: [
      { name: "Cuisses de poulet", qty: 6, unit: "u" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 500, unit: "ml" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Chocolat noir 70%", qty: 80, unit: "g" },
      { name: "Cacao en poudre amer", qty: 2, unit: "c. à soupe" },
      { name: "Paprika doux", qty: 2, unit: "c. à soupe" },
      { name: "Cannelle en poudre", qty: 1, unit: "c. à café" },
      { name: "Cumin moulu", qty: 1, unit: "c. à café" },
      { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
      { name: "Graines de sésame torréfiées (déco)", qty: 2, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Dans une grande cocotte, fais chauffer 3 c.s. d'huile à feu moyen-vif. Sale et poivre les cuisses de poulet, fais-les dorer 4 min de chaque côté. Réserve sur une assiette.",
      "Dans la même cocotte, baisse à feu moyen. Ajoute l'oignon émincé, fais fondre 5 min jusqu'à coloration légère. Ajoute l'ail écrasé, le paprika, la cannelle et le cumin. Remue 30 s pour libérer les arômes.",
      "Verse les tomates concassées et le cube de bouillon dilué dans 500 ml d'eau chaude. Laisse mijoter 10 min jusqu'à ce que ça réduise un peu.",
      "Mixe la sauce au mixeur plongeant (ou au blender) pour obtenir une texture lisse. Remets dans la cocotte. Ajoute le chocolat cassé en morceaux + le cacao. Remue à feu doux jusqu'à dissolution complète — la sauce devient brun profond, presque noire.",
      "Replonge les cuisses de poulet dans la sauce, peau vers le haut. Couvre et laisse mijoter à feu doux 25 min : la viande doit être tendre et se détacher de l'os.",
      "Sers chaud avec du riz blanc nature pour bien saucer. Parsème de graines de sésame torréfiées juste avant de servir.",
    ],
  },
  "enchiladas-verdes": {
    commisIngredients: [
      { name: "Tortillas de blé ou maïs", qty: 10, unit: "u" },
      { name: "Tomatillos en boîte (ou tomates vertes)", qty: 700, unit: "g" },
      { name: "Piment vert en bocal (ou jalapeño)", qty: 1, unit: "c. à soupe" },
      { name: "Oignon blanc", qty: 1, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
      { name: "Blancs de poulet cuits effilés", qty: 400, unit: "g" },
      { name: "Crème fraîche épaisse", qty: 150, unit: "ml" },
      { name: "Feta émiettée (ou queso fresco)", qty: 120, unit: "g" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Préchauffe le four à 200 °C. Égoutte les tomatillos en boîte. Mets-les dans un blender avec la moitié de l'oignon émincé, l'ail, le piment, la moitié de la coriandre et 1 c.c. de sel. Mixe 30 s — tu obtiens une sauce verte lisse.",
      "Dans une grande poêle, fais chauffer 1 c.s. d'huile, verse la sauce verte et cuis 8 min à feu moyen-vif : elle change de couleur et épaissit légèrement. Goûte, rectifie le sel.",
      "Cisèle finement l'autre moitié de l'oignon et le reste de coriandre. Dans un bol, mélange le poulet effiloché avec 4 c.s. de sauce verte — c'est ta farce.",
      "Dans une autre poêle, fais chauffer 1 c.s. d'huile. Plonge chaque tortilla 10 s par face juste pour la ramollir (sinon elle craque au pliage). Égoutte sur du papier absorbant.",
      "Verse un peu de sauce verte au fond d'un plat à gratin. Garnis chaque tortilla d'1 c.s. bombée de farce poulet, enroule en cigare et pose côté soudure vers le bas dans le plat. Continue jusqu'à remplir.",
      "Nappe les enchiladas du reste de sauce verte. Verse des filets de crème fraîche par-dessus puis saupoudre généreusement de feta émiettée. Enfourne 15 min jusqu'à ce que ça gratine. Parsème d'oignon et coriandre frais. Sers immédiatement.",
    ],
  },
  "chiles-rellenos": {
    commisIngredients: [
      { name: "Poivrons verts (ou poblanos si dispo)", qty: 4, unit: "u" },
      { name: "Mozzarella râpée (ou emmental)", qty: 250, unit: "g" },
      { name: "Œufs", qty: 4, unit: "u" },
      { name: "Farine", qty: 80, unit: "g" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 200, unit: "ml" },
      { name: "Origan séché + cumin", qty: 1, unit: "c. à café (chaque)" },
      { name: "Huile végétale", qty: 4, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Préchauffe le four à 220 °C. Pose les poivrons entiers sur une plaque, enfourne 20 min en les retournant à mi-cuisson, jusqu'à ce que la peau soit noircie et boursouflée. Sors-les et mets-les dans un sac plastique fermé 10 min : la peau s'enlève toute seule ensuite.",
      "Pendant ce temps, prépare la sauce tomate : émince l'oignon, fais-le fondre 5 min dans 2 c.s. d'huile dans une casserole. Ajoute l'ail écrasé, origan, cumin, remue 30 s. Verse les tomates + le cube de bouillon dilué dans 200 ml d'eau chaude. Laisse mijoter 15 min, sale et poivre. Mixe au mixeur plongeant.",
      "Épluche les poivrons (la peau part toute seule). Fais une incision longitudinale d'un seul côté, retire les graines et les membranes blanches en gardant le pédoncule entier.",
      "Garnis chaque poivron de mozzarella râpée bien tassée (~60 g par poivron). Referme délicatement — le poivron grillé est suffisamment souple pour tenir tout seul, sans cure-dent.",
      "Pose 3 assiettes : farine / œufs battus dans un grand bol / une assiette vide pour réserver. Roule chaque poivron farci dans la farine en tapotant l'excédent, puis trempe-le entièrement dans les œufs battus.",
      "Chauffe 2 c.s. d'huile dans une grande poêle à feu moyen-vif. Pose les poivrons enrobés et fais-les dorer 2 min par côté, en les retournant délicatement à la spatule. Égoutte sur du papier absorbant. Sers immédiatement nappé de la sauce tomate chaude (ou avec la sauce dans une assiette à côté).",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "mexique");
if (!country) {
  console.error("Pays 'mexique' introuvable.");
  process.exit(1);
}

let touched = 0;
for (const recipe of country.recipes) {
  const update = COMMIS[recipe.slug];
  if (!update) {
    console.warn(`  ⚠ pas de commis pour ${recipe.slug}`);
    continue;
  }
  recipe.commisIngredients = update.commisIngredients;
  recipe.commisSteps = update.commisSteps;
  delete recipe.simplifiedSteps;
  touched += 1;
  console.log(
    `  ✓ ${recipe.slug.padEnd(22)} commisIng:${update.commisIngredients.length} commisSteps:${update.commisSteps.length}`
  );
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`\n→ ${touched}/${country.recipes.length} recettes mexicaines migrées.`);

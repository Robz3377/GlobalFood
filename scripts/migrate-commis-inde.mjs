#!/usr/bin/env node
/**
 * Lot 5 — Inde : ajoute commisIngredients + commisSteps aux 5 recettes
 * indiennes et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Butter chicken : Chez Becky et Liz (recette express), Saveurs Magazine,
 *   Harmonie Cuisine (curry en poudre + crème classique au lieu de cajou
 *   mixées + ghee + kasuri methi)
 * - Dhal lentilles corail : Tangerine Zest one-pot, La Vie Claire, Cuisine
 *   Addict (curry en poudre + tadka simplifiée sans hing/curry leaves)
 * - Biryani agneau : Bollywood Kitchen "Easy Byriani", Bonnes Recettes,
 *   Tilda lamb biryani (yaourt+curry+garam masala vs 6 épices entières +
 *   pâte de farine pour sceller remplacée par couvercle + papier alu)
 * - Samosa légumes : Bonduelle Legumiz, Amandine Cooking, Vegan Pratique
 *   (feuilles de brick rondes au lieu de pâte maison + ajwain + amchoor ;
 *   cuisson FOUR au lieu de friture)
 * - Chai masala : Asiamarché, Au Paradis du Thé, L'île aux épices
 *   (cardamome/cannelle/gingembre en POUDRE au lieu d'entiers à piler,
 *   thé noir classique sachet au lieu d'Assam CTC, sucre roux au lieu
 *   de jaggery indien)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "butter-chicken": {
    commisIngredients: [
      { name: "Blancs (ou cuisses) de poulet en cubes", qty: 600, unit: "g" },
      { name: "Yaourt nature", qty: 150, unit: "g" },
      { name: "Pâte de curry indien (ou curry en poudre)", qty: 2, unit: "c. à soupe" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Gingembre frais râpé (ou 1 c.c. poudre)", qty: 1, unit: "c. à soupe" },
      { name: "Jus de citron", qty: 1, unit: "c. à soupe" },
      { name: "Coulis de tomates (bouteille)", qty: 400, unit: "g" },
      { name: "Beurre", qty: 50, unit: "g" },
      { name: "Crème liquide entière", qty: 150, unit: "ml" },
      { name: "Sucre", qty: 1, unit: "c. à café" },
      { name: "Sel", qty: 1, unit: "c. à café" },
      { name: "Coriandre fraîche", qty: 0.5, unit: "bouquet" },
      { name: "Riz basmati (servir)", qty: 250, unit: "g" },
    ],
    commisSteps: [
      "Dans un saladier, mélange le yaourt + 1 c.s. de pâte de curry + jus de citron + ail écrasé + gingembre + sel. Ajoute les cubes de poulet, mélange et laisse mariner 30 min minimum (1 h c'est encore mieux).",
      "Pendant la marinade, lance le riz basmati : 250 g pour 400 ml d'eau salée dans une casserole couverte. Porte à ébullition, baisse à feu très doux 11 min, repose 5 min couvert.",
      "Dans une grande poêle, fais fondre 25 g de beurre à feu vif. Sors le poulet de la marinade (garde-la), fais-le saisir 4 min en remuant : il doit dorer sans cuire à cœur. Réserve.",
      "Dans la même poêle, fais fondre le reste de beurre, ajoute 1 c.s. de pâte de curry et remue 30 s. Verse le coulis de tomates et la marinade restante. Cuis 8 min à feu moyen jusqu'à ce que la sauce épaississe et change de couleur.",
      "Ajoute la crème liquide et 1 c.c. de sucre. Mélange. Remets le poulet, baisse à feu doux et laisse mijoter 12 min : la sauce doit être nappante et le poulet juste cuit.",
      "Goûte, rectifie le sel. Parsème de coriandre ciselée. Sers chaud sur le riz basmati avec du naan si tu en as.",
    ],
  },
  "dhal-lentilles": {
    commisIngredients: [
      { name: "Lentilles corail", qty: 250, unit: "g" },
      { name: "Lait de coco", qty: 200, unit: "ml" },
      { name: "Eau", qty: 700, unit: "ml" },
      { name: "Tomates concassées en boîte", qty: 200, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Gingembre frais râpé (ou 1 c.c. poudre)", qty: 1, unit: "c. à soupe" },
      { name: "Curry en poudre", qty: 2, unit: "c. à soupe" },
      { name: "Cumin moulu", qty: 1, unit: "c. à café" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
      { name: "Citron vert", qty: 0.5, unit: "u" },
      { name: "Coriandre fraîche", qty: 0.5, unit: "bouquet" },
      { name: "Sel", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Rince les lentilles corail sous l'eau froide jusqu'à ce qu'elle soit transparente (3-4 fois — elles font de la mousse blanche au début, c'est normal).",
      "Émince finement l'oignon. Dans une grande casserole, fais chauffer 2 c.s. d'huile à feu moyen. Fais fondre l'oignon 6 min jusqu'à coloration légère. Ajoute l'ail écrasé et le gingembre, remue 30 s.",
      "Ajoute 2 c.s. de curry en poudre et 1 c.c. de cumin moulu. Remue 30 s pour libérer les arômes (attention à ne pas brûler les épices : baisse le feu si besoin).",
      "Verse les lentilles, les tomates concassées, le lait de coco et 700 ml d'eau. Sale. Porte à frémissement, baisse à feu doux et laisse mijoter 20 min en remuant de temps en temps, jusqu'à ce que les lentilles soient fondantes et la texture crémeuse.",
      "Coupe le feu. Presse le 1/2 citron vert sur le dhal, mélange. Sers dans des bols, parsème de coriandre ciselée. Accompagne de riz basmati ou de naan.",
    ],
  },
  "biryani-agneau": {
    commisIngredients: [
      { name: "Épaule d'agneau désossée en cubes", qty: 800, unit: "g" },
      { name: "Riz basmati", qty: 400, unit: "g" },
      { name: "Yaourt nature", qty: 200, unit: "g" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Gingembre frais râpé", qty: 2, unit: "c. à soupe" },
      { name: "Curry en poudre", qty: 2, unit: "c. à soupe" },
      { name: "Garam masala", qty: 1, unit: "c. à soupe" },
      { name: "Curcuma", qty: 1, unit: "c. à café" },
      { name: "Cardamome verte (gousses)", qty: 4, unit: "u" },
      { name: "Bâton de cannelle", qty: 1, unit: "u" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Tomates concassées en boîte", qty: 200, unit: "g" },
      { name: "Beurre", qty: 60, unit: "g" },
      { name: "Coriandre + menthe fraîches", qty: 1, unit: "bouquet (chaque)" },
      { name: "Pincée de safran (ou curcuma)", qty: 1, unit: "pincée" },
      { name: "Eau (cuisson riz)", qty: 2, unit: "L" },
      { name: "Sel", qty: 1, unit: "c. à soupe" },
    ],
    commisSteps: [
      "MARINADE : dans un grand saladier, mélange le yaourt + ail écrasé + gingembre + curry en poudre + garam masala + curcuma + 1 c.c. de sel. Ajoute les cubes d'agneau, mélange bien et laisse mariner 30 min minimum (2 h idéalement au frais).",
      "Émince finement les oignons. Dans une grande cocotte, fais fondre 40 g de beurre à feu moyen. Fais frire les oignons 12 min en remuant, jusqu'à ce qu'ils soient bien dorés et croustillants (c'est le birista). Réserve la moitié pour la finition.",
      "Dans la même cocotte (avec l'autre moitié d'oignons), baisse le feu. Ajoute la cardamome écrasée + le bâton de cannelle. Verse l'agneau mariné avec toute sa marinade. Ajoute les tomates concassées. Couvre et laisse mijoter à feu doux 50 min, en remuant à mi-cuisson.",
      "Pendant la cuisson, prépare le riz : porte 2 L d'eau salée à ébullition. Plonge le riz basmati et cuis 6-7 min seulement — il doit être al dente (il finira au four). Égoutte délicatement.",
      "Préchauffe le four à 180 °C. Si la sauce d'agneau est trop liquide, fais-la réduire 5 min à découvert. Étale le riz cuit en couche égale par-dessus dans la cocotte. Dilue la pincée de safran dans 2 c.s. d'eau chaude et arrose le riz. Parsème de la moitié des oignons frits réservés et de la moitié de la coriandre + menthe ciselées.",
      "Couvre hermétiquement avec un couvercle ET du papier alu pour bien emprisonner la vapeur. Enfourne 25 min — c'est la cuisson dum, le riz absorbe les arômes de l'agneau par en dessous.",
      "Sors du four, laisse reposer 5 min couvert. Mélange délicatement à la fourchette pour répartir riz et agneau. Sers chaud avec le reste de coriandre/menthe et d'oignons frits sur le dessus.",
    ],
  },
  "samosa-legumes": {
    commisIngredients: [
      { name: "Feuilles de brick rondes", qty: 8, unit: "u" },
      { name: "Pommes de terre à chair ferme", qty: 500, unit: "g" },
      { name: "Petits pois surgelés", qty: 150, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Gingembre frais râpé", qty: 1, unit: "c. à soupe" },
      { name: "Curry en poudre", qty: 1.5, unit: "c. à soupe" },
      { name: "Cumin (graines ou moulu)", qty: 1, unit: "c. à café" },
      { name: "Jus de citron", qty: 1, unit: "c. à soupe" },
      { name: "Coriandre fraîche", qty: 0.5, unit: "bouquet" },
      { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
      { name: "Sel", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Préchauffe le four à 180 °C. Pèle et coupe les pommes de terre en petits cubes (1 cm). Fais-les cuire à l'eau bouillante salée 10-12 min jusqu'à ce qu'elles soient tendres mais pas en purée. Égoutte.",
      "Dans une grande poêle, fais chauffer 2 c.s. d'huile à feu moyen. Fais fondre l'oignon émincé 5 min. Ajoute ail + gingembre + cumin, remue 30 s. Ajoute le curry en poudre, remue encore 30 s pour libérer les arômes.",
      "Verse les petits pois surgelés (directement, sans décongeler), les pommes de terre cuites et 1 c.c. de sel. Fais sauter 4 min en écrasant légèrement à la fourchette pour bien lier la farce. Coupe le feu, ajoute le jus de citron et la coriandre ciselée. Laisse refroidir 10 min — chaud, la farce déchire la brick.",
      "Coupe chaque feuille de brick en 2 demi-cercles. Plie chaque demi-cercle en 2 dans le sens de la longueur pour former une bande triangulaire. Badigeonne légèrement d'huile au pinceau.",
      "Pose 1 c.s. bombée de farce à l'extrémité d'une bande. Plie en triangle : replie le coin sur la farce puis continue à plier en triangle jusqu'au bout (technique du drapeau). Soude le dernier bout avec un peu d'huile. Recommence — tu obtiens 16 samosas.",
      "Pose les samosas sur une plaque garnie de papier sulfurisé. Badigeonne le dessus d'un peu d'huile. Enfourne 15-18 min en retournant à mi-cuisson, jusqu'à ce qu'ils soient bien dorés et croustillants. Sers chauds avec une sauce yaourt-menthe ou un chutney mangue.",
    ],
  },
  "chai-masala": {
    commisIngredients: [
      { name: "Eau", qty: 400, unit: "ml" },
      { name: "Lait entier", qty: 400, unit: "ml" },
      { name: "Thé noir (sachets ou feuilles)", qty: 4, unit: "sachets" },
      { name: "Cardamome en poudre", qty: 0.5, unit: "c. à café" },
      { name: "Cannelle en poudre (ou 1 bâton)", qty: 0.5, unit: "c. à café" },
      { name: "Gingembre en poudre (ou 1 cm frais râpé)", qty: 0.5, unit: "c. à café" },
      { name: "Clous de girofle entiers", qty: 3, unit: "u" },
      { name: "Sucre roux", qty: 3, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Dans une casserole, verse 400 ml d'eau et 400 ml de lait. Ajoute la cardamome, la cannelle, le gingembre et les 3 clous de girofle entiers.",
      "Porte doucement à frémissement à feu moyen (jamais bouillir : le lait débordrait). Compte 5 min de frémissement pour que les épices infusent et parfument bien le lait.",
      "Ajoute le thé (sachets ou feuilles directement dans la casserole). Laisse infuser 3 min à frémissement — le mélange prend une belle couleur brun caramel.",
      "Ajoute le sucre roux, mélange. Goûte et rectifie selon ton goût (les Indiens le boivent assez sucré, mais c'est à toi de voir).",
      "Coupe le feu. Filtre le chai à la passoire fine directement dans des tasses ou des verres épais. Sers brûlant — c'est la base du goûter dans toute l'Inde.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "inde");
if (!country) {
  console.error("Pays 'inde' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes indiennes migrées.`);

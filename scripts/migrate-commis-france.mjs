#!/usr/bin/env node
/**
 * Lot 7 — France : ajoute commisIngredients + commisSteps aux 5 recettes
 * françaises et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Coq au vin : Sapna 8 étapes, Jackiecuisine, Chefsquare
 *   (cuisses de poulet supermarché au lieu de coq Label Rouge ;
 *   vin rouge de cuisine au lieu de Gevrey-Chambertin ; pas de flambage
 *   cognac ; pas de touche chocolat Bocuse)
 * - Ratatouille : Recette Plus facile, Panier de Saison, Cuisine Facile
 *   (tomates concassées en boîte au lieu de Roma fraîches ; herbes de
 *   Provence sachet au lieu de thym + romarin frais séparés ; cuisson en
 *   une fois au lieu de la méthode grand-mère en plusieurs cuissons)
 * - Bouillabaisse : La Crustacerie express, L'île aux épices, Pavillon France
 *   (cabillaud + lotte + saumon au lieu des 5 poissons de roche méditerranéens
 *   introuvables ; soupe de poisson en bocal au lieu de fumet maison 3 L ;
 *   rouille express mayo + ail + safran au lieu de mayonnaise montée)
 * - Crêpes Suzette : Empreinte Sucrée, Chef Simon, Recettes Parisiennes
 *   (pâte simple sans zeste/Grand Marnier ; sauce orange caramel beurre +
 *   Grand Marnier sans flambage spectaculaire optionnel)
 * - Quiche lorraine : Pradel France, Lustensile, Tout pour bien cuisiner
 *   (pâte brisée PRÊTE À DÉROULER au lieu de pâte brisée maison ;
 *   crème liquide + lait au lieu de crème fraîche entière 30% épaisse +
 *   1 jaune supplémentaire ; muscade en poudre au lieu d'entière à râper)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "coq-au-vin": {
    commisIngredients: [
      { name: "Cuisses de poulet", qty: 6, unit: "u" },
      { name: "Vin rouge (Côtes-du-Rhône ou vin de table)", qty: 750, unit: "ml" },
      { name: "Lardons fumés", qty: 200, unit: "g" },
      { name: "Champignons de Paris", qty: 250, unit: "g" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Carottes", qty: 2, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Bouquet garni (sachet)", qty: 1, unit: "u" },
      { name: "Beurre", qty: 40, unit: "g" },
      { name: "Farine", qty: 3, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Sale et poivre les cuisses de poulet. Dans une grande cocotte, fais fondre 40 g de beurre à feu moyen-vif. Fais dorer les cuisses 3 min de chaque côté jusqu'à coloration uniforme. Réserve sur une assiette.",
      "Dans la même cocotte, fais revenir les lardons 3 min à feu moyen jusqu'à ce qu'ils dorent. Ajoute les oignons émincés et les carottes en rondelles. Fais suer 5 min sans coloration.",
      "Saupoudre de 3 c.s. de farine, remue 1 min pour qu'elle absorbe les graisses (technique du \"singer\"). Verse le vin rouge d'un coup, ajoute l'ail écrasé et le bouquet garni. Mélange en grattant le fond.",
      "Remets les cuisses dans la cocotte, le vin doit les recouvrir à mi-hauteur. Sale, poivre. Couvre et laisse mijoter à feu doux 1 h 15 — la viande doit se détacher de l'os à la fourchette.",
      "Pendant ce temps, coupe les champignons en quartiers. Dans une poêle, fais-les sauter 5 min à feu vif avec 1 noisette de beurre jusqu'à ce qu'ils soient bien dorés. Réserve.",
      "Quand le poulet est tendre, ajoute les champignons dans la cocotte, mélange et laisse mijoter à découvert 10 min pour que la sauce réduise et nappe. Retire le bouquet garni. Sers chaud avec des pommes vapeur ou des tagliatelles fraîches.",
    ],
  },
  ratatouille: {
    commisIngredients: [
      { name: "Aubergine", qty: 1, unit: "u" },
      { name: "Courgettes", qty: 2, unit: "u" },
      { name: "Poivrons (rouge + jaune ou vert)", qty: 2, unit: "u" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Herbes de Provence (sachet)", qty: 1, unit: "c. à soupe" },
      { name: "Basilic frais", qty: 0.5, unit: "bouquet" },
      { name: "Huile d'olive", qty: 5, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Coupe l'aubergine et les courgettes en cubes de 2 cm. Émince l'oignon. Coupe les poivrons en lanières (épépine-les avant). Hache finement l'ail.",
      "Dans une grande poêle ou cocotte, fais chauffer 3 c.s. d'huile d'olive à feu moyen-vif. Ajoute les cubes d'aubergine et fais-les revenir 8 min en remuant jusqu'à ce qu'ils soient dorés. Réserve.",
      "Dans la même poêle, ajoute 2 c.s. d'huile. Fais revenir les courgettes 5 min, ajoute les poivrons et l'oignon, continue 5 min. Ajoute l'ail haché, remue 30 s.",
      "Verse les tomates concassées, remets l'aubergine réservée et ajoute les herbes de Provence. Sale, poivre. Couvre et laisse mijoter à feu doux 25 min en remuant de temps en temps.",
      "Découvre, laisse réduire 5 min à feu moyen pour évaporer l'excès d'eau. Coupe le feu, parsème de basilic ciselé. Sers chaud, tiède ou froid — c'est encore meilleur le lendemain (les saveurs se développent une nuit au frigo).",
    ],
  },
  bouillabaisse: {
    commisIngredients: [
      { name: "Cabillaud (filets)", qty: 400, unit: "g" },
      { name: "Lotte (joues ou queue)", qty: 400, unit: "g" },
      { name: "Saumon (pavés)", qty: 300, unit: "g" },
      { name: "Pommes de terre à chair ferme", qty: 800, unit: "g" },
      { name: "Soupe de poisson en bocal (rayon conserves)", qty: 800, unit: "ml" },
      { name: "Fenouil", qty: 1, unit: "u" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Vin blanc sec", qty: 100, unit: "ml" },
      { name: "Pastis", qty: 2, unit: "c. à soupe" },
      { name: "Safran ou curcuma", qty: 1, unit: "pincée" },
      { name: "Huile d'olive", qty: 4, unit: "c. à soupe" },
      { name: "Mayonnaise (rouille express)", qty: 100, unit: "g" },
      { name: "Tranches de baguette grillées (servir)", qty: 8, unit: "u" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Pèle et coupe les pommes de terre en rondelles de 1 cm. Émince finement l'oignon et le fenouil. Coupe les filets de poisson en gros tronçons. Garde-les au frais jusqu'au moment de cuire.",
      "Dans une grande cocotte, fais chauffer 4 c.s. d'huile d'olive. Fais suer l'oignon et le fenouil 8 min à feu moyen sans coloration. Ajoute 3 gousses d'ail écrasées et le safran, remue 30 s.",
      "Verse le vin blanc et le pastis, laisse réduire 2 min. Ajoute la soupe de poisson en bocal + 500 ml d'eau. Porte à frémissement et sale légèrement.",
      "Ajoute les pommes de terre. Couvre et laisse cuire 15 min à feu moyen jusqu'à ce qu'elles soient presque tendres (la pointe d'un couteau s'enfonce avec une légère résistance).",
      "Plonge d'abord les poissons les plus fermes (lotte, cabillaud) 4 min. Puis le saumon, 3 min — il ne doit pas trop cuire (chair encore légèrement nacrée à cœur).",
      "ROUILLE EXPRESS : dans un petit bol, mélange la mayonnaise + 1 gousse d'ail écrasée + 1 pincée de safran. Sers la bouillabaisse dans des assiettes creuses avec les tranches de baguette grillées tartinées de rouille à côté. La tradition : on trempe le pain dans la soupe.",
    ],
  },
  "crepes-suzette": {
    commisIngredients: [
      { name: "Farine", qty: 200, unit: "g" },
      { name: "Lait entier", qty: 500, unit: "ml" },
      { name: "Œufs", qty: 3, unit: "u" },
      { name: "Beurre fondu (pâte)", qty: 30, unit: "g" },
      { name: "Sucre (pâte)", qty: 30, unit: "g" },
      { name: "Sel", qty: 1, unit: "pincée" },
      { name: "Beurre (cuisson)", qty: 20, unit: "g" },
      { name: "Beurre doux (sauce)", qty: 80, unit: "g" },
      { name: "Sucre (sauce)", qty: 80, unit: "g" },
      { name: "Jus + zeste de 2 oranges", qty: 200, unit: "ml" },
      { name: "Grand Marnier (ou Cointreau)", qty: 3, unit: "c. à soupe" },
    ],
    commisSteps: [
      "PÂTE : verse la farine dans un saladier, fais un puits, casse les œufs au centre. Mélange au fouet en incorporant progressivement le lait pour éviter les grumeaux. Ajoute le sucre, le sel et le beurre fondu. Laisse reposer 15 min minimum.",
      "Cuis les crêpes dans une poêle de 24 cm bien chaude, légèrement beurrée. Pour chaque crêpe : verse une louche de pâte, fais tourner la poêle pour répartir, cuis 1 min par face. Empile les crêpes dans une assiette, couvre d'un torchon — tu obtiens 12-15 crêpes.",
      "SAUCE : dans une grande poêle, fais fondre 80 g de sucre à feu moyen jusqu'à ce qu'il devienne caramel blond léger (3-4 min, sans remuer, juste secouer la poêle). Verse le jus d'orange d'un coup (attention aux projections) — le caramel va se cristalliser puis fondre à nouveau.",
      "Ajoute le zeste d'une orange râpé. Laisse réduire 3 min à feu moyen jusqu'à ce que la sauce devienne sirupeuse. Coupe le feu.",
      "Ajoute le beurre froid en dés et fouette pour obtenir une sauce onctueuse et brillante. Ajoute 3 c.s. de Grand Marnier. ATTENTION : ne fais plus bouillir, la sauce se séparerait.",
      "Plie chaque crêpe en 4 et plonge-les dans la sauce chaude pour les imprégner. Sers immédiatement 3 crêpes par personne avec un peu de sauce nappée par-dessus. Le flambage spectacle est OPTIONNEL : chauffe 50 ml de Grand Marnier dans une louche, enflamme et verse sur les crêpes en présentation.",
    ],
  },
  "quiche-lorraine": {
    commisIngredients: [
      { name: "Pâte brisée prête à dérouler", qty: 1, unit: "u" },
      { name: "Lardons fumés", qty: 200, unit: "g" },
      { name: "Œufs entiers", qty: 4, unit: "u" },
      { name: "Crème liquide entière", qty: 200, unit: "ml" },
      { name: "Lait entier", qty: 200, unit: "ml" },
      { name: "Noix de muscade en poudre", qty: 1, unit: "pincée" },
      { name: "Poivre (le sel n'est pas nécessaire : lardons salent)", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Préchauffe le four à 200 °C. Déroule la pâte brisée dans un moule à tarte de 26 cm avec son papier sulfurisé. Pique le fond avec une fourchette pour éviter qu'elle gonfle à la cuisson.",
      "Dans une poêle, fais revenir les lardons à sec 4-5 min à feu moyen jusqu'à ce qu'ils dorent et libèrent leur gras. Égoutte-les sur du papier absorbant pour enlever l'excès de graisse.",
      "Dans un saladier, bats les 4 œufs entiers à la fourchette. Ajoute la crème liquide, le lait, une pincée de muscade et un tour de moulin de poivre. PAS DE SEL — les lardons salent déjà bien assez.",
      "Répartis les lardons égouttés sur la pâte. Verse l'appareil œufs-crème par-dessus sans dépasser le bord (l'appareil monte légèrement à la cuisson, prévois 5 mm de marge).",
      "Enfourne 35-40 min à 200 °C. La quiche doit être bien dorée sur le dessus et tremblotante au centre quand tu la sors (elle se fige en refroidissant 5 min hors du four). Sers tiède ou froide avec une salade verte simple à côté.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "france");
if (!country) {
  console.error("Pays 'france' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes françaises migrées.`);

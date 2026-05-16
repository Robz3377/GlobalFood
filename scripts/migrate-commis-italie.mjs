#!/usr/bin/env node
/**
 * Lot 1 — Italie : ajoute commisIngredients + commisSteps aux 5 recettes
 * italiennes et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Carbonara : Blog de Châtaigne, Adeline Cuisine, Du Bocal à l'Assiette
 *   (substitution guanciale → lardons fumés, pecorino DOP → parmesan râpé)
 * - Pizza Margherita : Cuisinez avec Djouza, LesBonnesRecettes, Galbani
 *   (pâte prête à dérouler, mozzarella boule supermarché, four 240°C)
 * - Risotto milanese : Amandine Cooking, Swissmilk, Karin Kuisin
 *   (cube de bouillon, dosette safran, pas de moelle)
 * - Osso buco : Chef Simon (Les petits secrets de Lolo), Tous Chefs
 *   (cube de bouillon, tomates en boîte, mijoté simple)
 * - Tiramisu : Galbani, Lady Coquillette, Bonne Maman
 *   (mascarpone supermarché, boudoirs prêts, repos 4h)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  carbonara: {
    commisIngredients: [
      { name: "Spaghetti", qty: 200, unit: "g" },
      { name: "Lardons fumés", qty: 150, unit: "g" },
      { name: "Œufs entiers", qty: 2, unit: "u" },
      { name: "Parmesan râpé (sachet)", qty: 60, unit: "g" },
      { name: "Poivre noir moulu", qty: 1, unit: "pincée" },
      { name: "Gros sel pour l'eau", qty: 1, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Mets une grande casserole d'eau salée à bouillir et lance les spaghetti pour le temps indiqué sur le paquet — vise al dente.",
      "Pendant ce temps, fais dorer les lardons à la poêle, sans matière grasse, 4-5 min jusqu'à ce qu'ils soient bien grillés. Coupe le feu, laisse dans la poêle.",
      "Dans un bol, casse les 2 œufs entiers, ajoute 50 g de parmesan râpé et un bon tour de moulin de poivre. Mélange à la fourchette.",
      "Égoutte les pâtes en gardant un verre d'eau de cuisson. Balance-les directement dans la poêle aux lardons (hors du feu, c'est crucial : sinon l'œuf cuit en omelette).",
      "Verse le mélange œufs-parmesan sur les pâtes chaudes et mélange à toute vitesse. Si c'est trop sec, ajoute de l'eau de cuisson cuillère par cuillère jusqu'à obtenir une sauce nappante. Sers immédiatement avec le reste de parmesan et du poivre.",
    ],
  },
  "pizza-margherita": {
    commisIngredients: [
      { name: "Pâte à pizza prête à dérouler", qty: 1, unit: "u" },
      { name: "Coulis de tomates (bouteille)", qty: 150, unit: "g" },
      { name: "Mozzarella en boule", qty: 125, unit: "g" },
      { name: "Basilic frais", qty: 6, unit: "feuilles" },
      { name: "Huile d'olive", qty: 1, unit: "c. à soupe" },
      { name: "Origan séché (optionnel)", qty: 1, unit: "pincée" },
      { name: "Sel", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Préchauffe le four à 240 °C (th. 8), chaleur tournante. Déroule ta pâte à pizza sur la plaque du four avec son papier sulfurisé.",
      "Étale 150 g de coulis de tomates à la cuillère en spirale, en laissant 2 cm de bord nu. Sale légèrement et ajoute une pincée d'origan si tu aimes.",
      "Égoutte la mozzarella et déchire-la grossièrement à la main. Répartis les morceaux sur la pizza sans aller jusqu'au bord.",
      "Verse un filet d'huile d'olive en spirale. Enfourne 12-15 min, jusqu'à ce que les bords soient dorés et la mozzarella bien fondue.",
      "Sors la pizza et ajoute le basilic frais maintenant (jamais avant : il brûle). Un dernier filet d'huile d'olive et tu manges à la main, tout de suite.",
    ],
  },
  "risotto-milanese": {
    commisIngredients: [
      { name: "Riz spécial risotto (Arborio)", qty: 300, unit: "g" },
      { name: "Cubes de bouillon de volaille", qty: 2, unit: "u" },
      { name: "Eau chaude", qty: 1, unit: "L" },
      { name: "Safran en poudre (dosette)", qty: 1, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Vin blanc sec", qty: 100, unit: "ml" },
      { name: "Beurre", qty: 50, unit: "g" },
      { name: "Parmesan râpé", qty: 80, unit: "g" },
      { name: "Huile d'olive", qty: 1, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Fais bouillir 1 L d'eau, dissous 2 cubes de bouillon dedans et ajoute le safran. Garde à feu très doux pendant toute la recette — le bouillon doit rester bien chaud.",
      "Émince finement l'oignon. Dans une grande poêle ou casserole, fais-le fondre à feu doux avec l'huile et 20 g de beurre, 5 min, sans coloration.",
      "Ajoute le riz cru et remue 2 min à feu moyen jusqu'à ce que les grains deviennent translucides sur les bords. Verse le vin blanc, laisse évaporer 1 min.",
      "Verse le bouillon louche par louche : à chaque fois que le riz a tout absorbé, remets-en une. Remue souvent. Compte 18 min en tout — goûte à partir de 16 min, le grain doit être tendre mais légèrement ferme au cœur.",
      "Coupe le feu. Ajoute le reste de beurre froid en dés et le parmesan râpé. Mélange vivement 1 min : tu dois obtenir une texture crémeuse \"à la vague\". Sale et poivre.",
      "Sers tout de suite dans des assiettes chaudes, avec un peu de parmesan en plus sur le dessus.",
    ],
  },
  "osso-buco": {
    commisIngredients: [
      { name: "Tranches de jarret de veau (3 cm)", qty: 4, unit: "u" },
      { name: "Farine", qty: 3, unit: "c. à soupe" },
      { name: "Huile d'olive", qty: 3, unit: "c. à soupe" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Carottes", qty: 2, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Vin blanc sec", qty: 150, unit: "ml" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (pour le bouillon)", qty: 250, unit: "ml" },
      { name: "Bouquet garni (thym + laurier)", qty: 1, unit: "u" },
      { name: "Sel, poivre", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Sale et poivre les jarrets, farine-les des deux côtés en tapotant pour enlever l'excédent. Dans une grosse cocotte, fais chauffer l'huile à feu vif et fais dorer les jarrets 3 min de chaque côté. Réserve-les sur une assiette.",
      "Baisse à feu moyen. Dans la même cocotte, ajoute l'oignon émincé et les carottes en rondelles. Fais revenir 5 min jusqu'à ce qu'ils soient tendres. Ajoute l'ail écrasé, remue 30 s.",
      "Déglace au vin blanc en grattant le fond avec une cuillère en bois. Laisse réduire 2 min à découvert.",
      "Verse les tomates concassées et le cube de bouillon dilué dans 250 ml d'eau chaude. Ajoute le bouquet garni. Remets les jarrets dans la sauce et couvre.",
      "Laisse mijoter à feu très doux 1 h 30, en retournant les jarrets à mi-cuisson. La viande doit se détacher facilement de l'os. Si la sauce est trop liquide en fin de cuisson, retire le couvercle 10 min pour réduire.",
      "Sers avec un risotto, des pâtes fraîches ou de la polenta pour bien saucer.",
    ],
  },
  tiramisu: {
    commisIngredients: [
      { name: "Mascarpone", qty: 250, unit: "g" },
      { name: "Œufs entiers", qty: 3, unit: "u" },
      { name: "Sucre en poudre", qty: 80, unit: "g" },
      { name: "Boudoirs (biscuits à la cuillère)", qty: 24, unit: "u" },
      { name: "Café fort (expresso ou soluble)", qty: 200, unit: "ml" },
      { name: "Cacao en poudre amer", qty: 2, unit: "c. à soupe" },
      { name: "Sucre vanillé (optionnel)", qty: 1, unit: "sachet" },
    ],
    commisSteps: [
      "Prépare 200 ml de café noir bien fort (expresso ou 2 c. à café de café soluble dans l'eau chaude). Laisse refroidir. Sépare les blancs des jaunes d'œufs.",
      "Fouette les jaunes avec le sucre 3 min, jusqu'à ce que le mélange blanchisse et double de volume. Ajoute le mascarpone et le sucre vanillé, mélange à la spatule jusqu'à obtenir une crème lisse.",
      "Monte les blancs en neige ferme avec une pincée de sel. Incorpore-les délicatement à la crème mascarpone en soulevant la masse de bas en haut pour ne pas les casser.",
      "Trempe rapidement chaque boudoir dans le café (1 seconde max, sinon ils se gorgent et s'effondrent). Tapisse le fond d'un plat carré avec une première couche. Couvre de la moitié de la crème. Refais une couche de boudoirs trempés, puis le reste de crème en lissant.",
      "Filme et place au frais 4 h minimum (12 h c'est encore meilleur). Au moment de servir, saupoudre généreusement de cacao amer au tamis.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const italy = data.countries.find((c) => c.slug === "italie");
if (!italy) {
  console.error("Pays 'italie' introuvable.");
  process.exit(1);
}

let touched = 0;
for (const recipe of italy.recipes) {
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
    `  ✓ ${recipe.slug.padEnd(20)} commisIng:${update.commisIngredients.length} commisSteps:${update.commisSteps.length}`
  );
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`\n→ ${touched}/${italy.recipes.length} recettes italiennes migrées.`);

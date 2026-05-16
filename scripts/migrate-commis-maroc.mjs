#!/usr/bin/env node
/**
 * Lot 3 — Maroc : ajoute commisIngredients + commisSteps aux 5 recettes
 * marocaines et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Tajine poulet citron : Cuisinons En Couleurs (version express), Caprices
 *   Gourmands cocotte-minute, Lachtite-Toque (poulet citron olives express)
 * - Couscous légumes : Bonduelle Legumiz Harira Express, Magimix couscous
 *   pois chiches, Chefclub Daily veg express
 * - Pastilla poulet : Maison Naja mini-pastilla rapide, Aujourdhui.com
 *   pastilla feuilles brick + poudre amandes, Cuisinez avec Djouza
 * - Harira : Bonduelle Legumiz (Harira express boîtes), Veggie Harira express
 *   (La Cerise sur le Maillot), Recettes Papounet (express conserves)
 * - Briouates miel : Lidl Recettes briouates amandes-miel, 750g, MaSpatule
 *   (poudre d'amandes prête, demi-cercle de brick, façonnage triangle simple)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "tajine-poulet-citron": {
    commisIngredients: [
      { name: "Cuisses de poulet", qty: 4, unit: "u" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Citrons confits en bocal", qty: 2, unit: "u" },
      { name: "Olives vertes dénoyautées (bocal)", qty: 120, unit: "g" },
      { name: "Gingembre en poudre", qty: 1, unit: "c. à café" },
      { name: "Curcuma en poudre", qty: 1, unit: "c. à café" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Coriandre fraîche ciselée", qty: 1, unit: "bouquet" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 500, unit: "ml" },
      { name: "Huile d'olive", qty: 3, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Émince finement les oignons. Dans une grande cocotte, fais chauffer 3 c.s. d'huile d'olive à feu moyen. Ajoute les oignons et fais-les fondre 8 min, sans coloration : ils doivent devenir translucides.",
      "Ajoute l'ail écrasé, le gingembre et le curcuma. Remue 30 s pour libérer les arômes. Pose les cuisses de poulet par-dessus, peau sur le dessus. Sale et poivre.",
      "Verse 500 ml de bouillon (cube dilué dans l'eau chaude) à mi-hauteur des cuisses. Couvre et laisse mijoter à feu doux 35 min — le poulet doit être tendre et se détacher facilement de l'os.",
      "Pendant ce temps, rince les citrons confits sous l'eau, retire la pulpe (trop salée) et coupe les écorces en lanières fines. Rince aussi les olives 1 min sous l'eau froide pour les dessaler.",
      "Découvre la cocotte. Ajoute les olives et les lanières de citron confit. Poursuis 10 min à découvert pour que la sauce réduise et nappe les morceaux. Goûte, rectifie le poivre (jamais le sel : olives + citron en apportent déjà). Parsème de coriandre ciselée et sers avec du pain frais ou de la semoule.",
    ],
  },
  "couscous-legumes": {
    commisIngredients: [
      { name: "Semoule de couscous moyenne", qty: 400, unit: "g" },
      { name: "Pois chiches en boîte (égouttés)", qty: 400, unit: "g" },
      { name: "Carottes", qty: 4, unit: "u" },
      { name: "Courgettes", qty: 3, unit: "u" },
      { name: "Navets", qty: 2, unit: "u" },
      { name: "Courge butternut (en cubes)", qty: 400, unit: "g" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Cubes de bouillon de légumes", qty: 2, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 1.5, unit: "L" },
      { name: "Ras el hanout (épices en sachet)", qty: 2, unit: "c. à soupe" },
      { name: "Huile d'olive", qty: 4, unit: "c. à soupe" },
      { name: "Beurre (semoule)", qty: 30, unit: "g" },
      { name: "Sel et poivre", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Émince les oignons. Pèle et coupe les carottes en bâtonnets, les navets en quartiers, la courge butternut en cubes de 3 cm, les courgettes en tronçons épais.",
      "Dans une grande cocotte, fais chauffer 4 c.s. d'huile à feu moyen. Fais suer les oignons 8 min sans coloration. Ajoute 2 c.s. de ras el hanout, remue 30 s pour libérer les arômes.",
      "Verse les tomates concassées et 1,5 L d'eau chaude avec les 2 cubes de bouillon dilués. Ajoute carottes et navets, sale, couvre. Laisse mijoter 15 min.",
      "Ajoute la courge butternut et les courgettes. Continue 15 min : les légumes doivent être tendres mais pas en purée. Rince les pois chiches sous l'eau froide, ajoute-les en fin de cuisson et réchauffe 3 min.",
      "Pendant que les légumes finissent, prépare la semoule express : verse-la dans un grand bol avec 1 c.s. d'huile d'olive et une pincée de sel. Couvre avec le même volume d'eau bouillante (~500 ml), couvre d'une assiette et laisse gonfler 5 min. Aère ensuite à la fourchette, ajoute le beurre en dés et mélange.",
      "Dresse la semoule dans une grande assiette creuse, dépose les légumes par-dessus avec une louche de bouillon pour humidifier. Présente le reste du bouillon dans un bol à part — chacun en rajoute selon son goût.",
    ],
  },
  "pastilla-poulet": {
    commisIngredients: [
      { name: "Blancs de poulet (ou cuisses désossées)", qty: 600, unit: "g" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Gingembre en poudre", qty: 1, unit: "c. à café" },
      { name: "Cannelle en poudre (sauce)", qty: 1, unit: "c. à café" },
      { name: "Curcuma en poudre", qty: 1, unit: "c. à café" },
      { name: "Beurre", qty: 80, unit: "g" },
      { name: "Œufs", qty: 4, unit: "u" },
      { name: "Persil + coriandre ciselés", qty: 1, unit: "bouquet" },
      { name: "Feuilles de brick rondes", qty: 8, unit: "u" },
      { name: "Poudre d'amandes", qty: 150, unit: "g" },
      { name: "Sucre glace (déco)", qty: 3, unit: "c. à soupe" },
      { name: "Cannelle en poudre (déco)", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Coupe les blancs de poulet en cubes. Émince les oignons. Dans une grande poêle, fais fondre 30 g de beurre à feu moyen et fais revenir le poulet 5 min jusqu'à ce qu'il blanchisse. Réserve dans une assiette.",
      "Dans la même poêle, ajoute 30 g de beurre et fais fondre les oignons 8 min jusqu'à coloration légère. Ajoute l'ail écrasé, gingembre, cannelle et curcuma. Remue 30 s.",
      "Remets le poulet dans la poêle. Verse 100 ml d'eau, couvre et laisse mijoter 15 min. Découvre et fais réduire à sec 5 min jusqu'à obtenir une sauce confite, presque sans liquide. Coupe le feu. Effiloche le poulet à la fourchette directement dans la sauce.",
      "Bats les œufs à la fourchette et verse-les dans la poêle. Remue à feu doux 2 min jusqu'à ce qu'ils soient pris (texture œufs brouillés). Incorpore le persil + coriandre ciselés. Réserve. Dans un bol à part, mélange la poudre d'amandes + 2 c.s. de sucre glace + 1 c.c. de cannelle.",
      "Préchauffe le four à 180 °C. Beurre un moule rond de 24 cm. Dispose 4 feuilles de brick beurrées en étoile dans le moule, débordant largement. Verse la moitié du mélange aux amandes. Étale toute la farce poulet-œufs. Couvre du reste des amandes. Replie les feuilles débordantes vers le centre comme un emballage cadeau. Couvre de 4 feuilles supplémentaires beurrées en scellant bien.",
      "Enfourne 25 min jusqu'à coloration dorée intense. Démoule chaud sur un plat. Saupoudre généreusement de sucre glace au tamis et trace des lignes de cannelle au-dessus avec une cuillère. Sers chaud, à la main si tu oses.",
    ],
  },
  harira: {
    commisIngredients: [
      { name: "Viande hachée (bœuf ou agneau)", qty: 250, unit: "g" },
      { name: "Pois chiches en boîte (égouttés)", qty: 400, unit: "g" },
      { name: "Lentilles en boîte (ou corail)", qty: 250, unit: "g" },
      { name: "Tomates concassées en boîte", qty: 800, unit: "g" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Branches de céleri", qty: 2, unit: "u" },
      { name: "Coriandre + persil frais ciselés", qty: 1, unit: "bouquet" },
      { name: "Curcuma + cannelle + gingembre + poivre", qty: 1, unit: "c. à café (chaque)" },
      { name: "Vermicelles fins", qty: 60, unit: "g" },
      { name: "Maïzena", qty: 3, unit: "c. à soupe" },
      { name: "Eau", qty: 1.5, unit: "L" },
      { name: "Citron jaune", qty: 1, unit: "u" },
      { name: "Huile d'olive", qty: 3, unit: "c. à soupe" },
      { name: "Sel", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Émince finement les oignons et le céleri (avec les feuilles). Cisèle finement la coriandre et le persil — tiges incluses, c'est là que sont les arômes.",
      "Dans une grande marmite, fais chauffer 3 c.s. d'huile d'olive à feu moyen. Ajoute oignons, céleri, herbes ciselées et la viande hachée. Fais revenir 8 min en émiettant la viande à la cuillère en bois. Ajoute toutes les épices (curcuma, cannelle, gingembre, poivre), remue 30 s.",
      "Verse les tomates concassées et 1,5 L d'eau. Sale, porte à frémissement. Couvre partiellement et laisse mijoter 25 min — les saveurs doivent se fondre.",
      "Pendant ce temps, rince les pois chiches et lentilles sous l'eau froide. Ajoute-les dans la marmite avec les vermicelles. Cuis 6 min jusqu'à ce que les vermicelles soient tendres.",
      "Dans un bol, fouette vigoureusement 3 c.s. de maïzena avec 200 ml d'eau froide jusqu'à dissolution complète (zéro grumeau). Verse en filet dans la harira en remuant constamment au fouet — c'est ce qui donne la texture veloutée typique. Cuis 5 min en remuant pour épaissir.",
      "Goûte et rectifie le sel. Sers BRÛLANT dans des bols traditionnels avec un quartier de citron à presser au moment de manger (et quelques dattes à côté pour la tradition du Ramadan).",
    ],
  },
  briouates: {
    commisIngredients: [
      { name: "Poudre d'amandes", qty: 250, unit: "g" },
      { name: "Sucre glace (farce)", qty: 80, unit: "g" },
      { name: "Cannelle en poudre", qty: 1, unit: "c. à café" },
      { name: "Eau de fleur d'oranger", qty: 2, unit: "c. à soupe" },
      { name: "Œuf (liant farce)", qty: 1, unit: "u" },
      { name: "Feuilles de brick rondes", qty: 8, unit: "u" },
      { name: "Beurre fondu (pliage)", qty: 50, unit: "g" },
      { name: "Huile de friture", qty: 500, unit: "ml" },
      { name: "Miel (bain)", qty: 200, unit: "g" },
      { name: "Graines de sésame (optionnel)", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Dans un saladier, mélange la poudre d'amandes, le sucre glace, la cannelle, l'œuf et 2 c.s. d'eau de fleur d'oranger. Tu dois obtenir une pâte qui tient en boule sous les doigts. Forme 20 petites boules de la taille d'une grosse noix.",
      "Coupe chaque feuille de brick en 2 demi-cercles. Plie chaque demi-cercle en 2 dans le sens de la longueur pour former une bande. Badigeonne légèrement de beurre fondu au pinceau.",
      "Pose une boule de farce à l'extrémité d'une bande. Plie en triangle : replie le coin sur la farce, puis continue à plier en triangle jusqu'au bout de la bande (technique du drapeau). Soude le dernier bout avec un peu de beurre. Recommence — tu obtiens 16-20 briouates.",
      "Fais chauffer 500 ml d'huile dans une casserole haute jusqu'à ~170 °C (test : un petit bout de pâte doit dorer en 30 s). Plonge les briouates par 4-5 et frit-les 2-3 min en les retournant — elles doivent être dorées caramel sans brûler.",
      "Pendant la friture, fais chauffer doucement le miel dans une petite casserole large jusqu'à ce qu'il soit fluide (jamais bouillant : il brûlerait).",
      "Égoutte les briouates sur une grille puis, tant qu'elles sont brûlantes, plonge-les 1 min dans le miel chaud en les retournant pour bien les enrober. Égoutte sur une grille au-dessus d'un plat (récupère le miel qui coule). Saupoudre de graines de sésame si tu veux. Laisse refroidir complètement avant de servir — le miel se fige et donne le craquant signature.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "maroc");
if (!country) {
  console.error("Pays 'maroc' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes marocaines migrées.`);

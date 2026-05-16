#!/usr/bin/env node
/**
 * Lot 6 — Thaïlande : ajoute commisIngredients + commisSteps aux 5 recettes
 * thaïlandaises et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Pad Thai crevettes : Kikkoman, Marc Winer, Yummix Thermomix
 *   (tamarin → sauce soja + jus citron vert + sucre ; nuoc-mâm au lieu de
 *   nam pla ; cacahuètes au lieu de cacahuètes torréfiées non salées)
 * - Curry vert poulet : Couteaux et Tirebouchons, Asiamarché, Atelier des
 *   Chefs (pâte curry vert supermarché type Suzi-Wan ; aubergine classique
 *   au lieu de thaïe ronde ; carottes au lieu de pousses de bambou)
 * - Tom Yum kung : Toutela Thaïlande, Cannelle et Coriandre, Tang Frères
 *   (galanga → gingembre ; combava → zeste citron vert ; nam prik pao →
 *   Sriracha ; champignons paille → champignons de Paris ; crevettes
 *   décortiquées au lieu de tigrées entières)
 * - Som Tam : Pascale Weeks (la vraie recette enfin presque), Marc Winer,
 *   Fabicooking (papaye verte → carottes + concombre ; haricots longs →
 *   haricots verts surgelés ; tamarin → jus citron vert seul ; pas de
 *   crevettes séchées kung haeng)
 * - Mango sticky rice : Doctor Bonne Bouffe, Marc Winer, Saveurs Magazine
 *   (mangues classiques mûres ; sucre roux au lieu de jaggery ; pas de
 *   feuille de pandanus ; topping simplifié au lait de coco + maïzena)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "pad-thai": {
    commisIngredients: [
      { name: "Nouilles de riz larges (rayon Asie)", qty: 200, unit: "g" },
      { name: "Crevettes décortiquées (cuites ou crues)", qty: 250, unit: "g" },
      { name: "Œufs", qty: 2, unit: "u" },
      { name: "Sauce nuoc-mâm", qty: 3, unit: "c. à soupe" },
      { name: "Sauce soja", qty: 2, unit: "c. à soupe" },
      { name: "Jus de citron vert", qty: 2, unit: "c. à soupe" },
      { name: "Sucre roux", qty: 2, unit: "c. à soupe" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Ciboule", qty: 4, unit: "u" },
      { name: "Germes de soja frais (rayon frais)", qty: 100, unit: "g" },
      { name: "Cacahuètes (concassées au pilon)", qty: 40, unit: "g" },
      { name: "Citron vert (servir)", qty: 1, unit: "u" },
      { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Plonge les nouilles dans un grand saladier d'eau très chaude (pas bouillante). Laisse-les ramollir 10 min — elles doivent être souples mais pas cuites. Égoutte et réserve.",
      "Pendant ce temps, prépare la sauce : mélange dans un bol la sauce nuoc-mâm + sauce soja + jus de citron vert + sucre roux. Mélange jusqu'à dissolution du sucre. C'est ton trio salé-acide-sucré qui remplace le tamarin.",
      "Coupe les ciboules en tronçons de 3 cm, hache finement l'ail. Concasse grossièrement les cacahuètes au pilon (ou dans un sachet congel au rouleau).",
      "Fais chauffer un wok ou une grande poêle à feu vif avec 3 c.s. d'huile. Lance l'ail 15 s puis les crevettes 2 min jusqu'à coloration rose. Pousse tout sur un côté de la poêle, casse les 2 œufs dans le vide et brouille-les 30 s à la spatule.",
      "Ajoute les nouilles égouttées + toute la sauce. Mélange à la pince ou aux baguettes 2 min jusqu'à ce que les nouilles absorbent la sauce et soient tendres et brillantes.",
      "Coupe le feu. Ajoute les germes de soja, les ciboules et la moitié des cacahuètes. Mélange brièvement (les germes doivent rester croquants). Sers immédiatement avec le reste des cacahuètes par-dessus et un quartier de citron vert à presser.",
    ],
  },
  "curry-vert-poulet": {
    commisIngredients: [
      { name: "Cuisses de poulet désossées en cubes", qty: 600, unit: "g" },
      { name: "Pâte de curry vert thai (supermarché)", qty: 3, unit: "c. à soupe" },
      { name: "Lait de coco entier", qty: 400, unit: "ml" },
      { name: "Aubergine", qty: 1, unit: "u" },
      { name: "Carottes", qty: 2, unit: "u" },
      { name: "Pois gourmands (ou haricots verts)", qty: 100, unit: "g" },
      { name: "Sauce nuoc-mâm", qty: 2, unit: "c. à soupe" },
      { name: "Sucre roux", qty: 1, unit: "c. à soupe" },
      { name: "Basilic frais", qty: 0.5, unit: "bouquet" },
      { name: "Coriandre fraîche", qty: 0.5, unit: "bouquet" },
      { name: "Riz jasmin (servir)", qty: 300, unit: "g" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Lance d'abord le riz jasmin : 300 g pour 450 ml d'eau salée dans une casserole couverte. Porte à ébullition, baisse à feu très doux 12 min, repose 5 min couvert.",
      "Pendant ce temps, coupe l'aubergine en cubes de 2 cm, les carottes en bâtonnets, équeute les pois gourmands. Coupe les cuisses de poulet en cubes de 2 cm si pas déjà fait.",
      "Dans un wok ou une grande poêle, fais chauffer 2 c.s. d'huile à feu moyen-vif. Ajoute 3 c.s. de pâte de curry vert et fais-la revenir 2 min en remuant — elle doit dégager ses arômes (attention à la fumée, baisse le feu si besoin).",
      "Ajoute le poulet et fais-le saisir 4 min en remuant pour bien l'enrober de pâte.",
      "Verse le lait de coco, ajoute la sauce nuoc-mâm et le sucre roux. Porte à frémissement. Ajoute les carottes et l'aubergine. Couvre et laisse mijoter 12 min à feu moyen — les légumes doivent être tendres.",
      "Ajoute les pois gourmands, cuis encore 3 min — ils doivent rester croquants. Coupe le feu, ajoute le basilic et la coriandre ciselés. Sers chaud sur le riz jasmin.",
    ],
  },
  "tom-yum-kung": {
    commisIngredients: [
      { name: "Crevettes décortiquées", qty: 400, unit: "g" },
      { name: "Cube de bouillon de poulet", qty: 1, unit: "u" },
      { name: "Eau", qty: 1, unit: "L" },
      { name: "Citronnelle (en bocal, ou 2 tiges fraîches)", qty: 2, unit: "c. à soupe" },
      { name: "Gingembre frais", qty: 30, unit: "g" },
      { name: "Zeste de citron vert", qty: 1, unit: "u" },
      { name: "Échalotes", qty: 2, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Champignons de Paris", qty: 200, unit: "g" },
      { name: "Tomates cerise", qty: 100, unit: "g" },
      { name: "Sauce nuoc-mâm", qty: 4, unit: "c. à soupe" },
      { name: "Jus de citron vert (2 citrons)", qty: 4, unit: "c. à soupe" },
      { name: "Sucre roux", qty: 1, unit: "c. à soupe" },
      { name: "Sriracha (ou pincée de piment)", qty: 1, unit: "c. à soupe" },
      { name: "Coriandre fraîche", qty: 0.5, unit: "bouquet" },
    ],
    commisSteps: [
      "Dans une grande casserole, verse 1 L d'eau et dissous le cube de bouillon. Ajoute la citronnelle (écrasée au pilon si fraîche, sinon directement 2 c.s. en bocal), le gingembre en lamelles fines, l'échalote émincée, l'ail écrasé et le zeste de citron vert. Porte à frémissement et laisse infuser 10 min à couvert.",
      "Pendant ce temps, coupe les champignons en quartiers et les tomates cerise en deux.",
      "Ajoute champignons + tomates dans le bouillon, laisse cuire 4 min jusqu'à ce qu'ils ramollissent.",
      "Ajoute les crevettes décortiquées, la sauce nuoc-mâm, le sucre roux et la Sriracha. Laisse cuire 3 min : les crevettes deviennent roses et fermes.",
      "COUPE LE FEU. C'est essentiel : c'est hors du feu qu'on ajoute le jus de citron vert (4 c.s.) pour garder son côté frais et acide. Mélange.",
      "Sers immédiatement dans des bols brûlants avec la coriandre fraîche par-dessus. Si tu trouves les morceaux de citronnelle/gingembre/zeste, écarte-les de la cuillère en mangeant (ils ont parfumé mais ne se mangent pas).",
    ],
  },
  "som-tam": {
    commisIngredients: [
      { name: "Carottes", qty: 3, unit: "u" },
      { name: "Concombre", qty: 0.5, unit: "u" },
      { name: "Tomates cerise", qty: 200, unit: "g" },
      { name: "Haricots verts surgelés", qty: 100, unit: "g" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Cacahuètes (non salées si possible)", qty: 50, unit: "g" },
      { name: "Sauce nuoc-mâm", qty: 3, unit: "c. à soupe" },
      { name: "Sucre roux", qty: 2, unit: "c. à soupe" },
      { name: "Jus de citron vert (2-3 citrons)", qty: 60, unit: "ml" },
      { name: "Sriracha (ou pincée de piment)", qty: 1, unit: "c. à soupe" },
      { name: "Coriandre + menthe fraîches", qty: 1, unit: "bouquet (chaque)" },
    ],
    commisSteps: [
      "Râpe les carottes en julienne (râpe à gros trous ou économe). Coupe le concombre en bâtonnets fins après l'avoir épépiné. Coupe les tomates cerise en quartiers. Décongèle les haricots verts 30 s au micro-ondes puis coupe-les en tronçons de 3 cm.",
      "Dans une grande poêle sèche, fais torréfier les cacahuètes 3 min à feu moyen en remuant — elles doivent dégager leur parfum sans noircir. Concasse-les grossièrement au pilon (ou dans un sachet congel au rouleau).",
      "Dans un grand saladier (ou un mortier si tu en as un), écrase l'ail au pilon avec 1 c.s. de cacahuètes torréfiées. Ajoute le sucre roux, la sauce nuoc-mâm, le jus de citron vert et la Sriracha. Mélange jusqu'à dissolution du sucre — c'est la sauce signature.",
      "Ajoute carottes, concombre, tomates et haricots verts. Mélange délicatement à la main ou avec deux cuillères en bois en pressant légèrement pour que la sauce imprègne bien les légumes.",
      "Sers IMMÉDIATEMENT dans des assiettes creuses. Parsème du reste des cacahuètes concassées, de coriandre et menthe ciselées. La salade ne se garde pas : la carotte rend de l'eau et la salade devient flasque en 30 min.",
    ],
  },
  "mango-sticky-rice": {
    commisIngredients: [
      { name: "Riz gluant thaï (rayon Asie)", qty: 250, unit: "g" },
      { name: "Eau (cuisson)", qty: 500, unit: "ml" },
      { name: "Lait de coco entier", qty: 400, unit: "ml" },
      { name: "Sucre roux (ou sucre de palme si dispo)", qty: 80, unit: "g" },
      { name: "Sel", qty: 1, unit: "pincée" },
      { name: "Mangues bien mûres", qty: 2, unit: "u" },
      { name: "Maïzena (épaississant topping)", qty: 1, unit: "c. à café" },
      { name: "Graines de sésame torréfiées (déco)", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Rince le riz gluant à l'eau froide 3-4 fois jusqu'à eau presque claire. Mets-le dans une casserole avec 500 ml d'eau, couvre et porte à ébullition. Baisse à feu très doux et cuis 18 min sans soulever le couvercle (cuisson absorbée — le riz s'imprègne de toute l'eau).",
      "Pendant que le riz cuit, prépare la sauce coco : verse 300 ml de lait de coco dans une casserole avec 60 g de sucre roux et une pincée de sel. Chauffe à feu doux en remuant jusqu'à dissolution complète du sucre — jamais bouillir, le lait de coco se sépare sinon. Réserve.",
      "Quand le riz est cuit, coupe le feu et laisse reposer 5 min couvert. Verse la sauce coco encore tiède sur le riz directement dans la casserole, mélange délicatement à la spatule en bois et laisse absorber 15 min à couvert.",
      "Pendant ce temps, prépare le topping crémeux : dans une petite casserole, verse les 100 ml de lait de coco restants + 20 g de sucre roux + 1 c.c. de maïzena diluée dans 1 c.s. d'eau froide. Chauffe à feu doux en remuant 2 min jusqu'à ce que la sauce épaississe et nappe la cuillère.",
      "Pèle les mangues et coupe-les en tranches épaisses (ou en demi-cubes). Vise les plus mûres du rayon : la chair doit céder légèrement sous la pression.",
      "Dresse dans des assiettes : un dôme de riz coco au centre, les tranches de mangue posées à côté. Verse le topping crémeux sur le riz (et un peu sur la mangue si tu veux). Parsème de graines de sésame torréfiées. Sers tiède ou à température ambiante — JAMAIS froid (le riz devient dur).",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "thailande");
if (!country) {
  console.error("Pays 'thailande' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes thaïlandaises migrées.`);

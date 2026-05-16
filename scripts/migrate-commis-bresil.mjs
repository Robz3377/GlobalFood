#!/usr/bin/env node
/**
 * Lot 9 — Brésil : ajoute commisIngredients + commisSteps aux 5 recettes
 * brésiliennes et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Feijoada : De l'Amour en cocotte, Tierra Latina, 750g (la vraie),
 *   Harmonie Cuisine express (haricots noirs EN BOÎTE au lieu de secs
 *   trempés 12h ; substituts viandes : lardons + chorizo/Morteau +
 *   travers fumé au lieu de carne seca + linguiça calabresa + paio +
 *   pied de porc ; pas de farofa)
 * - Moqueca : HelloFresh, De l'Amour en cocotte, Mes Brouillons de Cuisine
 *   (cabillaud au lieu des 4 poissons brésiliens ; huile d'olive +
 *   paprika fumé au lieu d'huile de dendê palme rouge ; tomates
 *   concassées en boîte au lieu de Roma fraîches ; Sriracha au lieu de
 *   piment malagueta)
 * - Pão de queijo : Yumelise, Radio-Canada Mordu, EasyDélice
 *   (tapioca / farine de manioc supermarché au lieu de polvilho doce
 *   Minas Gerais ; parmesan + mozzarella au lieu de queijo Minas
 *   meia-cura ; méthode pâte chaude classique sans blender)
 * - Coxinhas : Saveurs Magazine, P'tit Chef, 196 flavors
 *   (blancs de poulet au lieu de hauts de cuisse désossés ; cube de
 *   bouillon ; cream cheese Philadelphia au lieu de catupiry brésilien ;
 *   cuisson au FOUR proposée en alternative à la friture 1.5 L)
 * - Brigadeiros : Mes Inspirations Culinaires, Swissmilk, La Brigaderie
 *   de Paris (cacao classique au lieu de Van Houten/Valrhona ; 1 seul
 *   enrobage vermicelles chocolat au lieu de 4 options chic)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  feijoada: {
    commisIngredients: [
      { name: "Haricots noirs en boîte (égouttés)", qty: 800, unit: "g" },
      { name: "Lardons fumés", qty: 250, unit: "g" },
      { name: "Saucisses fumées (chorizo ou Morteau)", qty: 300, unit: "g" },
      { name: "Travers de porc fumé", qty: 400, unit: "g" },
      { name: "Oignons jaunes", qty: 2, unit: "u" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Feuilles de laurier", qty: 2, unit: "u" },
      { name: "Cumin moulu", qty: 1, unit: "c. à café" },
      { name: "Cube de bouillon de bœuf", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 500, unit: "ml" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
      { name: "Coriandre + persil ciselés", qty: 1, unit: "bouquet" },
      { name: "Riz blanc (servir)", qty: 300, unit: "g" },
      { name: "Chou vert ou kale", qty: 200, unit: "g" },
      { name: "Oranges en tranches (servir)", qty: 2, unit: "u" },
    ],
    commisSteps: [
      "Émince les oignons. Dans une grande cocotte, fais chauffer 2 c.s. d'huile à feu moyen. Fais revenir les lardons 4 min jusqu'à coloration dorée. Ajoute les oignons et l'ail écrasé, fais suer 5 min.",
      "Ajoute les travers de porc fumé en morceaux et les saucisses coupées en rondelles épaisses. Fais saisir 5 min en remuant pour bien colorer.",
      "Égoutte et rince les haricots noirs en boîte sous l'eau froide. Ajoute-les dans la cocotte avec le laurier, le cumin et le cube de bouillon dilué dans 500 ml d'eau chaude. Sale légèrement (les viandes salent déjà).",
      "Couvre et laisse mijoter à feu doux 45 min. Découvre, écrase une partie des haricots à la fourchette contre le bord de la cocotte pour épaissir naturellement la sauce. Continue 10 min à découvert.",
      "Pendant ce temps, fais cuire le riz blanc (300 g pour 450 ml d'eau salée, 11 min à très doux, repos 5 min). Émince le chou kale très finement et fais-le sauter 5 min dans une poêle avec 1 c.s. d'huile et 1 gousse d'ail jusqu'à ce qu'il soit tendre.",
      "Sers la feijoada brûlante dans des assiettes creuses avec un peu de riz, le chou sauté à côté, des tranches d'orange (la tradition coupe le gras) et la coriandre/persil ciselés en finition.",
    ],
  },
  moqueca: {
    commisIngredients: [
      { name: "Cabillaud (filets)", qty: 700, unit: "g" },
      { name: "Crevettes décortiquées (optionnel)", qty: 200, unit: "g" },
      { name: "Jus de citron vert", qty: 60, unit: "ml" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Poivron rouge", qty: 1, unit: "u" },
      { name: "Poivron jaune (ou vert)", qty: 1, unit: "u" },
      { name: "Lait de coco entier", qty: 400, unit: "ml" },
      { name: "Huile d'olive", qty: 4, unit: "c. à soupe" },
      { name: "Paprika fumé", qty: 1, unit: "c. à café" },
      { name: "Sriracha (optionnel)", qty: 0.5, unit: "c. à café" },
      { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
      { name: "Riz blanc (servir)", qty: 300, unit: "g" },
    ],
    commisSteps: [
      "Coupe le cabillaud en gros tronçons de 3 cm. Mets-les dans un plat, arrose du jus de citron vert + 2 gousses d'ail écrasées + 1 c.c. de sel. Laisse mariner 10 min pendant que tu prépares le reste.",
      "Lance le riz blanc : 300 g pour 450 ml d'eau salée dans une casserole couverte. Porte à ébullition, baisse à feu très doux 11 min, repose 5 min couvert.",
      "Émince l'oignon, coupe les poivrons en lanières, hache le reste d'ail. Dans une grande cocotte large, fais chauffer 4 c.s. d'huile d'olive à feu moyen. Fais fondre l'oignon 5 min, ajoute l'ail et le paprika fumé, remue 30 s.",
      "Verse les tomates concassées et le lait de coco. Ajoute les poivrons en lanières. Sale, poivre. Laisse mijoter 8 min à feu moyen pour que les saveurs se concentrent.",
      "Dépose délicatement les morceaux de cabillaud (avec leur marinade) en une seule couche dans la sauce. Couvre et laisse cuire 8 min à feu doux. Si tu mets des crevettes, ajoute-les à mi-cuisson (4 min suffisent — sinon elles deviennent caoutchouc).",
      "Coupe le feu, parsème généreusement de coriandre ciselée. Sers chaud dans des assiettes creuses avec le riz blanc à côté pour saucer.",
    ],
  },
  "pao-de-queijo": {
    commisIngredients: [
      { name: "Tapioca (farine de manioc)", qty: 400, unit: "g" },
      { name: "Lait", qty: 200, unit: "ml" },
      { name: "Huile végétale (ou beurre fondu)", qty: 80, unit: "ml" },
      { name: "Sel", qty: 1, unit: "c. à café" },
      { name: "Œufs", qty: 3, unit: "u" },
      { name: "Parmesan râpé", qty: 100, unit: "g" },
      { name: "Mozzarella râpée", qty: 80, unit: "g" },
    ],
    commisSteps: [
      "Préchauffe le four à 200 °C. Dans une casserole, porte le lait, l'huile et le sel à frémissement. Coupe le feu dès les premières bulles.",
      "Verse le tapioca dans un grand saladier. Verse le liquide chaud par-dessus en remuant à la cuillère en bois — le tapioca va légèrement gélifier et former une pâte grumeleuse. Laisse tiédir 10 min (sinon les œufs cuisent au contact).",
      "Quand la pâte n'est plus brûlante (tiède), incorpore les œufs un par un en mélangeant énergiquement à la cuillère ou au robot. Ajoute le parmesan et la mozzarella râpés. Mélange jusqu'à pâte homogène — elle reste collante, c'est normal.",
      "Huile-toi légèrement les mains et forme des boulettes de la taille d'une noix (~25 g). Dispose-les sur une plaque garnie de papier sulfurisé en les espaçant (elles gonflent à la cuisson).",
      "Enfourne 20-25 min à 200 °C jusqu'à ce qu'ils soient dorés et bien gonflés. Sers tiède — c'est meilleur juste sorti du four, croustillant dehors, fondant dedans. Ils se mangent à la main, accompagnés d'un café (le rituel brésilien).",
    ],
  },
  coxinhas: {
    commisIngredients: [
      { name: "Blancs de poulet", qty: 500, unit: "g" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 500, unit: "ml" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Concentré de tomates", qty: 2, unit: "c. à soupe" },
      { name: "Cream cheese (Philadelphia, optionnel)", qty: 100, unit: "g" },
      { name: "Persil + coriandre ciselés", qty: 1, unit: "bouquet" },
      { name: "Cumin + paprika", qty: 1, unit: "c. à café (chaque)" },
      { name: "Farine (pâte)", qty: 350, unit: "g" },
      { name: "Beurre (pâte)", qty: 40, unit: "g" },
      { name: "Œufs (panure)", qty: 2, unit: "u" },
      { name: "Chapelure (panure)", qty: 200, unit: "g" },
      { name: "Huile végétale (cuisson)", qty: 4, unit: "c. à soupe" },
      { name: "Sel + poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Dilue le cube de bouillon dans 500 ml d'eau chaude dans une casserole. Plonge les blancs de poulet et fais-les pocher 15 min à feu doux. Sors-les, GARDE LE BOUILLON pour la pâte. Effiloche le poulet à la fourchette dans un saladier.",
      "Dans une poêle, fais fondre 1 c.s. d'huile, fais suer l'oignon émincé et l'ail écrasé 5 min. Ajoute concentré de tomates + cumin + paprika, remue 1 min. Verse 4 c.s. de bouillon, mélange. Verse sur le poulet effiloché. Ajoute le cream cheese (optionnel pour le moelleux), persil + coriandre ciselés. Sale, poivre.",
      "PÂTE : porte le bouillon restant à frémissement avec 40 g de beurre. Verse 350 g de farine d'un coup, remue énergiquement à la spatule jusqu'à obtenir une pâte qui se détache des parois (1-2 min). Coupe le feu, laisse tiédir 10 min.",
      "Pose la pâte sur le plan de travail légèrement fariné, pétris 1 min. Prends une boule de pâte de la taille d'une mandarine, aplatis-la dans ta paume en disque de 8 cm. Pose 1 c.s. bombée de farce au centre, referme en pinçant les bords pour former une goutte d'eau — c'est la forme \"coxinha\" qui imite une cuisse de poulet. Recommence — tu obtiens 20-25 coxinhas.",
      "Trempe chaque coxinha dans les œufs battus puis dans la chapelure en appuyant légèrement pour bien faire adhérer la panure.",
      "CUISSON AU FOUR (version simple) : préchauffe à 200 °C. Dispose les coxinhas panées sur une plaque, badigeonne d'un filet d'huile. Enfourne 25 min en retournant à mi-cuisson, jusqu'à coloration dorée croustillante. Alternative friture : 2 cm d'huile à 170 °C dans une poêle profonde, 4 min de chaque côté.",
    ],
  },
  brigadeiros: {
    commisIngredients: [
      { name: "Lait concentré sucré (1 boîte)", qty: 397, unit: "g" },
      { name: "Cacao en poudre amer", qty: 3, unit: "c. à soupe" },
      { name: "Beurre", qty: 25, unit: "g" },
      { name: "Sel", qty: 1, unit: "pincée" },
      { name: "Vermicelles de chocolat (granulado)", qty: 100, unit: "g" },
      { name: "Caissettes en papier mini-cupcake", qty: 30, unit: "u" },
    ],
    commisSteps: [
      "Dans une petite casserole à fond épais, verse le lait concentré sucré, le cacao, le beurre et la pincée de sel. Mélange à froid au fouet pour homogénéiser le cacao (sinon il forme des grumeaux à la cuisson).",
      "Mets sur feu moyen-doux et remue CONSTAMMENT à la cuillère en bois pendant 10-12 min. Au début c'est liquide, puis ça épaissit. C'est prêt quand la spatule racle le fond et que la préparation se détache des parois — c'est le test du \"fundo da panela\" (fond de casserole).",
      "Verse la préparation dans une assiette beurrée, laisse refroidir à température ambiante 15 min puis filme et place au frigo 2 h minimum (idéalement une nuit) — elle doit être ferme pour pouvoir rouler.",
      "Verse les vermicelles de chocolat dans un bol. Huile ou beurre légèrement tes mains (sinon la pâte colle). Prélève une cuillère à café de pâte et roule entre tes paumes pour former une boule de la taille d'une grosse noisette.",
      "Plonge chaque boule dans les vermicelles et roule-la pour bien l'enrober. Dépose dans une caissette en papier. Continue jusqu'à épuisement de la pâte — tu obtiens 25-30 brigadeiros. Conserve au frais, sers à température ambiante 15 min avant pour la texture parfaite (fondant à cœur).",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "bresil");
if (!country) {
  console.error("Pays 'bresil' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes brésiliennes migrées.`);

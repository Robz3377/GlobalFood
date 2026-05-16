#!/usr/bin/env node
/**
 * Lot 2 — Japon : ajoute commisIngredients + commisSteps aux 5 recettes
 * japonaises et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Ramen Shoyu : Patati Patate, Itsu France, Toulouse Sake Club
 *   (nouilles ramen sèches, cube de bouillon, blanc de poulet, œuf dur simple)
 * - Onigiri saumon : Nicky Food, Asian Market, Naturalia
 *   (riz Arborio en repli, saumon fumé tranché, sans moule)
 * - Tempura légumes : Les Fines Gueules, Marcia Tack, Chef Simon
 *   (pâte minute eau pétillante + œuf, légumes basiques, sans sauce tentsuyu)
 * - Gyoza porc : Le Marché Japonais, Itsu France, Patati Patate
 *   (disques à gyoza prêts, chou blanc, sauce soja-vinaigre simple)
 * - Katsudon : Atelier des Chefs, Oh Mon Bento, Marie Food Tips
 *   (escalopes fines, cube dashi ou volaille, poêle profonde sans friteuse)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "ramen-shoyu": {
    commisIngredients: [
      { name: "Nouilles ramen sèches (paquet)", qty: 200, unit: "g" },
      { name: "Cubes de bouillon de volaille", qty: 2, unit: "u" },
      { name: "Eau", qty: 1, unit: "L" },
      { name: "Blanc de poulet", qty: 200, unit: "g" },
      { name: "Sauce soja", qty: 3, unit: "c. à soupe" },
      { name: "Miel (ou sucre)", qty: 1, unit: "c. à soupe" },
      { name: "Œufs", qty: 2, unit: "u" },
      { name: "Oignon vert (ciboule)", qty: 2, unit: "u" },
      { name: "Feuilles de nori", qty: 2, unit: "u" },
      { name: "Huile de sésame", qty: 1, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Plonge les 2 œufs dans une casserole d'eau bouillante et cuis-les 6 min pile (chronomètre, sinon le jaune se fige). Refroidis-les sous l'eau froide, écale-les délicatement et coupe-les en deux.",
      "Fais bouillir 1 L d'eau, dissous les 2 cubes de bouillon dedans. Ajoute 3 c.s. de sauce soja et 1 c.s. de miel. Garde à feu très doux.",
      "Coupe le blanc de poulet en fines lamelles. Pose-les directement dans le bouillon chaud et laisse pocher 5 min — la viande doit être juste cuite, pas filandreuse.",
      "En parallèle, fais bouillir une autre casserole d'eau (sans sel). Plonge les nouilles ramen et cuis-les selon le paquet (en général 3-4 min). Égoutte rapidement.",
      "Préchauffe 2 grands bols à l'eau chaude, vide-les. Dépose les nouilles dedans, verse le bouillon brûlant avec le poulet par-dessus.",
      "Garnis avec les demi-œufs, l'oignon vert ciselé, une feuille de nori entière posée sur le bord du bol et un filet d'huile de sésame. Sers immédiatement — un ramen tiède, c'est un ramen raté.",
    ],
  },
  "onigiri-saumon": {
    commisIngredients: [
      { name: "Riz rond japonais (ou Arborio)", qty: 300, unit: "g" },
      { name: "Eau", qty: 400, unit: "ml" },
      { name: "Saumon fumé (tranches)", qty: 100, unit: "g" },
      { name: "Mayonnaise (optionnel)", qty: 2, unit: "c. à soupe" },
      { name: "Feuilles de nori", qty: 2, unit: "u" },
      { name: "Sel fin", qty: 1, unit: "c. à café" },
      { name: "Eau pour mouiller les mains", qty: 200, unit: "ml" },
    ],
    commisSteps: [
      "Rince le riz à l'eau froide jusqu'à ce qu'elle devienne presque claire (3-4 fois en frottant doucement). Mets-le dans une casserole avec 400 ml d'eau, couvre et porte à ébullition à feu vif.",
      "Dès que ça bout, baisse à feu très doux et cuis 12 min sans soulever le couvercle. Coupe le feu, laisse reposer 10 min toujours couvert. Le riz finit de gonfler à la vapeur.",
      "Pendant ce temps, coupe le saumon fumé en petits morceaux et mélange-le avec 2 c.s. de mayonnaise dans un bol — c'est la garniture express.",
      "Prépare un petit bol d'eau froide avec 1 c.c. de sel. Mouille-toi les mains dedans : c'est le secret pour que le riz ne colle pas. Prends une poignée de riz tiède (~75 g), creuse un puits au pouce et mets 1 c.c. de garniture au centre.",
      "Referme le riz par-dessus et forme un triangle dans tes paumes : pression douce de chaque côté en pivotant d'1/3 à chaque fois. Recommence — tu obtiens 6 onigiri.",
      "Coupe la nori en bandes de 4 cm × 8 cm et colle-en une à la base de chaque triangle. Sers à température ambiante, parfait pour le bento du lendemain.",
    ],
  },
  "tempura-legumes": {
    commisIngredients: [
      { name: "Farine", qty: 150, unit: "g" },
      { name: "Eau pétillante très froide", qty: 250, unit: "ml" },
      { name: "Œuf", qty: 1, unit: "u" },
      { name: "Courgette", qty: 1, unit: "u" },
      { name: "Carotte", qty: 1, unit: "u" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Champignons de Paris", qty: 150, unit: "g" },
      { name: "Huile de friture (tournesol)", qty: 750, unit: "ml" },
      { name: "Sauce soja (pour servir)", qty: 4, unit: "c. à soupe" },
      { name: "Jus de citron (pour servir)", qty: 1, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Mets l'eau pétillante au congélateur 10 min avant — elle doit être glacée. Coupe la courgette en rondelles de 5 mm, la carotte en bâtonnets, l'oignon en demi-rondelles, les champignons en deux. Sèche-les bien dans un torchon (l'eau résiduelle = pâte qui ne tient pas).",
      "Fais chauffer 750 ml d'huile dans une grande casserole haute jusqu'à ~170 °C. Test sans thermomètre : jette une goutte de pâte, elle doit grésiller et remonter en 2 secondes.",
      "Au DERNIER moment, casse l'œuf dans un bol, ajoute l'eau pétillante glacée et fouette 2 secondes. Verse la farine d'un coup et mélange en 4-5 coups de baguette MAXIMUM — laisse des grumeaux, c'est ce qui fait le craquant.",
      "Trempe chaque morceau de légume dans la pâte et plonge dans l'huile par groupes de 4-5 (jamais plus, sinon la température chute et la tempura devient grasse). Frit 1-2 min jusqu'à ce que la pâte soit pâle dorée et croustillante.",
      "Égoutte sur une grille (jamais sur du papier absorbant : la vapeur piégée ramollit la pâte). Sers IMMÉDIATEMENT avec un petit bol de sauce soja additionnée d'un filet de jus de citron pour tremper.",
    ],
  },
  "gyoza-porc": {
    commisIngredients: [
      { name: "Disques à gyoza ou wonton (rayon Asie)", qty: 30, unit: "u" },
      { name: "Porc haché", qty: 250, unit: "g" },
      { name: "Chou blanc (ou chou chinois)", qty: 200, unit: "g" },
      { name: "Sel (pour dégorger le chou)", qty: 1, unit: "c. à café" },
      { name: "Oignon vert (ciboule)", qty: 3, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Gingembre frais râpé (ou 1 c.c. en poudre)", qty: 1, unit: "c. à soupe" },
      { name: "Sauce soja (farce + sauce)", qty: 6, unit: "c. à soupe" },
      { name: "Huile de sésame", qty: 1, unit: "c. à soupe" },
      { name: "Huile végétale (cuisson)", qty: 2, unit: "c. à soupe" },
      { name: "Eau (vapeur)", qty: 80, unit: "ml" },
      { name: "Vinaigre de riz (ou vinaigre blanc)", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Émince le chou très finement. Sale-le avec 1 c.c. de sel, masse 2 min, laisse dégorger 10 min puis presse-le très fort à la main pour évacuer l'eau (sinon les gyoza détrempent à la cuisson).",
      "Dans un saladier, mélange à la main le porc haché, le chou pressé, l'oignon vert ciselé, l'ail râpé, le gingembre, 2 c.s. de sauce soja et 1 c.s. d'huile de sésame. Tu obtiens une farce homogène et collante.",
      "Pose un disque dans ta paume. Dépose 1 c.c. bombée de farce au centre. Mouille le bord avec un peu d'eau au doigt, plie en demi-lune et fais 4-5 petits plis sur un seul côté pour souder. Recommence — tu obtiens environ 30 gyoza.",
      "Fais chauffer 2 c.s. d'huile végétale dans une grande poêle antiadhésive à feu moyen-vif. Pose les gyoza côte à côte, fond plat vers le bas. Laisse dorer 3 min sans toucher : la base doit être caramel.",
      "Verse 80 ml d'eau d'un coup (attention aux projections) et couvre IMMÉDIATEMENT. Cuis à la vapeur 5 min. Découvre, laisse l'eau s'évaporer 1 min. Termine par un filet d'huile de sésame.",
      "Mélange 4 c.s. de sauce soja + 2 c.s. de vinaigre de riz dans un petit bol — c'est la sauce. Sers les gyoza chauds, face dorée vers le haut.",
    ],
  },
  katsudon: {
    commisIngredients: [
      { name: "Escalopes de porc fines", qty: 2, unit: "u" },
      { name: "Sel et poivre", qty: 1, unit: "pincée" },
      { name: "Farine (panure)", qty: 3, unit: "c. à soupe" },
      { name: "Œuf (panure)", qty: 1, unit: "u" },
      { name: "Panko (ou chapelure classique)", qty: 100, unit: "g" },
      { name: "Huile de friture", qty: 200, unit: "ml" },
      { name: "Riz rond (japonais ou Arborio)", qty: 300, unit: "g" },
      { name: "Eau (riz)", qty: 400, unit: "ml" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Cube de bouillon de volaille (ou dashi)", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 250, unit: "ml" },
      { name: "Sauce soja", qty: 3, unit: "c. à soupe" },
      { name: "Miel ou sucre", qty: 1, unit: "c. à soupe" },
      { name: "Œufs (omelette finale)", qty: 4, unit: "u" },
      { name: "Ciboule ciselée", qty: 2, unit: "u" },
    ],
    commisSteps: [
      "Rince le riz à l'eau froide 3 fois. Mets-le avec 400 ml d'eau dans une casserole, couvre et porte à ébullition. Baisse à feu très doux et cuis 12 min sans toucher. Coupe le feu, laisse reposer 10 min couvert.",
      "Sale et poivre les escalopes. Prépare 3 assiettes : farine / œuf battu / panko. Passe chaque escalope dans la farine (tapote l'excédent), puis l'œuf, puis le panko en appuyant pour bien faire adhérer.",
      "Chauffe 1 cm d'huile dans une grande poêle profonde à feu moyen-vif. Fais dorer les escalopes 3 min de chaque côté jusqu'à panure caramel. Égoutte sur une grille et coupe en lanières d'1 cm.",
      "Émince l'oignon en demi-rondelles. Dans une petite poêle, verse 250 ml de bouillon (cube dilué dans l'eau chaude) + 3 c.s. de sauce soja + 1 c.s. de miel. Ajoute l'oignon et fais frémir 3 min à feu moyen jusqu'à ce qu'il devienne tendre.",
      "Dépose les lanières de tonkatsu dans la poêle sur l'oignon, panure vers le HAUT (pour qu'elle reste croustillante). Bats les 4 œufs à la fourchette (jamais au fouet — ils doivent rester en filaments distincts). Verse-les en pluie sur le tout.",
      "Couvre, baisse à feu doux et cuis 1-2 min : l'œuf doit rester baveux (blanc pris, jaune coulant en surface). Coupe le feu — la chaleur résiduelle termine la cuisson.",
      "Remplis 2 grands bols de riz chaud à mi-hauteur. Fais glisser le tonkatsu-oignon-œuf avec sa sauce par-dessus. Parsème de ciboule ciselée et mange immédiatement, à la cuillère.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "japon");
if (!country) {
  console.error("Pays 'japon' introuvable.");
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
    `  ✓ ${recipe.slug.padEnd(20)} commisIng:${update.commisIngredients.length} commisSteps:${update.commisSteps.length}`
  );
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`\n→ ${touched}/${country.recipes.length} recettes japonaises migrées.`);

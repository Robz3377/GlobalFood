#!/usr/bin/env node
/**
 * Lot 8 — Chine : ajoute commisIngredients + commisSteps aux 5 recettes
 * chinoises et supprime le legacy simplifiedSteps.
 *
 * Sources des versions commis :
 * - Mapo tofu : Cuisine Douce (Tofu Mapo facile 20 min), 750g.com, Marc Winer
 *   (Sriracha + concentré tomate + paprika fumé au lieu de doubanjiang
 *   Pixian + douchi + poivre du Sichuan torréfié)
 * - Canard laqué : Asiamarché (canard pékinois à la maison), Saveurs Magazine,
 *   Ricardo (presque comme à Pékin) — MAGRETS au lieu de canard entier 2.5 kg
 *   échaudé + farci ; laque miel + soja + vinaigre balsamique au lieu de
 *   miel + soja claire + soja foncée + vinaigre Chinkiang + Shaoxing
 * - Jiaozi : 196 Flavors, Marc Winer, Isa Popote et Papote
 *   (disques à gyoza/wonton PRÊTS au lieu de pâte maison à l'eau froide ;
 *   chou blanc au lieu de Napa ; vinaigre de riz au lieu de Chinkiang)
 * - Nouilles dan dan : Voyagez en cuisinant, Laurent Mariotte, Devorezmoi
 *   (tahini + Sriracha au lieu de zhima jiang + huile pimentée chinoise
 *   hongyou + sui mi ya cai + Shaoxing ; épinards au lieu de bok choy)
 * - Riz cantonais : Maman Guide (riz non collant), Hooky Recipes,
 *   La Cerise sur le Maillot (jambon blanc au lieu de lap cheong/char siu ;
 *   riz cuit du jour refroidi 15 min au lieu de riz cuit la veille 12h)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  "mapo-tofu": {
    commisIngredients: [
      { name: "Tofu ferme", qty: 400, unit: "g" },
      { name: "Porc haché", qty: 200, unit: "g" },
      { name: "Sauce soja foncée", qty: 3, unit: "c. à soupe" },
      { name: "Sriracha (ou pâte chili-soja)", qty: 1, unit: "c. à soupe" },
      { name: "Concentré de tomate", qty: 1, unit: "c. à soupe" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Gingembre frais râpé", qty: 1, unit: "c. à soupe" },
      { name: "Vin blanc sec", qty: 1, unit: "c. à soupe" },
      { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
      { name: "Eau chaude (bouillon)", qty: 250, unit: "ml" },
      { name: "Sucre", qty: 1, unit: "c. à café" },
      { name: "Paprika fumé + poivre noir moulu", qty: 1, unit: "c. à café (chaque)" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
      { name: "Huile de sésame grillé (finition)", qty: 1, unit: "c. à café" },
      { name: "Fécule de maïs", qty: 1, unit: "c. à soupe" },
      { name: "Eau froide (liaison)", qty: 3, unit: "c. à soupe" },
      { name: "Oignon vert ciselé", qty: 2, unit: "u" },
    ],
    commisSteps: [
      "Coupe le tofu en cubes de 2 cm. Plonge-les dans une casserole d'eau bouillante salée 2 min — ça raffermit le tofu et enlève l'amertume. Égoutte délicatement sur du papier absorbant.",
      "Dans un wok ou une grande poêle, fais chauffer 2 c.s. d'huile à feu vif. Ajoute le porc haché et fais-le revenir 3 min en l'émiettant à la spatule jusqu'à coloration dorée.",
      "Baisse à feu moyen. Ajoute l'ail écrasé, le gingembre, 1 c.s. de Sriracha + 1 c.s. de concentré de tomate + le paprika fumé + le poivre. Remue 30 s pour libérer les arômes (les épices doivent embaumer sans brûler).",
      "Verse le vin blanc, laisse évaporer 30 s. Ajoute le cube de bouillon dilué dans 250 ml d'eau chaude + 3 c.s. de sauce soja + 1 c.c. de sucre. Porte à frémissement.",
      "Ajoute délicatement les cubes de tofu égouttés (ils sont fragiles). Laisse mijoter 5 min à feu doux en remuant juste à la spatule en bois pour ne pas casser le tofu.",
      "Dans un petit bol, mélange 1 c.s. de fécule + 3 c.s. d'eau froide. Verse dans le wok en remuant doucement — la sauce épaissit en 1 min. Coupe le feu. Ajoute 1 c.c. d'huile de sésame et l'oignon vert ciselé. Sers chaud sur un bol de riz blanc.",
    ],
  },
  "canard-laque": {
    commisIngredients: [
      { name: "Magrets de canard (ou cuisses de canard)", qty: 2, unit: "u" },
      { name: "Miel liquide", qty: 4, unit: "c. à soupe" },
      { name: "Sauce soja", qty: 4, unit: "c. à soupe" },
      { name: "Vinaigre balsamique", qty: 2, unit: "c. à soupe" },
      { name: "5 épices chinoises", qty: 1, unit: "c. à café" },
      { name: "Gingembre frais râpé", qty: 1, unit: "c. à café" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Sauce hoisin (servir)", qty: 100, unit: "g" },
      { name: "Galettes de blé chinoises ou tortillas", qty: 12, unit: "u" },
      { name: "Concombre (julienne)", qty: 1, unit: "u" },
      { name: "Oignons verts (bâtonnets)", qty: 6, unit: "u" },
    ],
    commisSteps: [
      "Préchauffe le four à 200 °C. Avec un couteau bien aiguisé, incise la peau des magrets en quadrillage (sans entamer la chair) pour qu'elle libère sa graisse et devienne croustillante. Sale légèrement.",
      "Dans une poêle FROIDE, pose les magrets côté peau vers le bas. Allume à feu moyen et laisse cuire 8 min sans toucher — le gras fond doucement, la peau devient dorée et craquante. Vide le gras dans un bol à mi-cuisson.",
      "Pendant ce temps, prépare la laque : dans un petit bol, fouette le miel + sauce soja + vinaigre balsamique + 5 épices + gingembre + ail écrasé jusqu'à mélange homogène.",
      "Retourne les magrets, badigeonne généreusement la peau croustillante de laque au pinceau. Transfère dans un plat allant au four. Enfourne 8 min en re-badigeonnant 2-3 fois pour que la laque caramélise en croûte brillante (ATTENTION, ça brûle vite : surveille).",
      "Sors le plat, couvre lâche de papier alu et laisse reposer 5 min. Tranche les magrets en fines lamelles biseautées (3-4 mm d'épaisseur).",
      "Pendant le repos, réchauffe les galettes ou tortillas 10 s par face à la poêle sèche. Pour servir : chacun tartine une galette de sauce hoisin, dépose quelques lamelles de canard, des bâtonnets de concombre et d'oignon vert, et roule la crêpe. Mange à la main, c'est la tradition.",
    ],
  },
  jiaozi: {
    commisIngredients: [
      { name: "Disques à gyoza/wonton (rayon Asie)", qty: 30, unit: "u" },
      { name: "Porc haché", qty: 300, unit: "g" },
      { name: "Chou blanc (ou chou chinois)", qty: 250, unit: "g" },
      { name: "Sel (dégorger le chou)", qty: 1, unit: "c. à café" },
      { name: "Ciboule", qty: 4, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Gingembre frais râpé", qty: 1, unit: "c. à soupe" },
      { name: "Sauce soja (farce + sauce)", qty: 6, unit: "c. à soupe" },
      { name: "Huile de sésame", qty: 2, unit: "c. à soupe" },
      { name: "Vinaigre de riz (ou balsamique)", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Émince le chou très finement. Sale-le avec 1 c.c. de sel, masse 2 min, laisse dégorger 10 min puis presse-le très fort à la main pour évacuer l'eau — sinon les raviolis détrempent à la cuisson.",
      "Dans un grand saladier, mélange à la main le porc haché, le chou pressé, la ciboule ciselée, l'ail écrasé, le gingembre, 3 c.s. de sauce soja et 1 c.s. d'huile de sésame. La farce doit être homogène et collante.",
      "Pose un disque dans ta paume. Mets 1 c.c. bombée de farce au centre. Mouille le bord avec un peu d'eau au doigt, plie en demi-lune et pince fermement pour souder (technique simple, sans pliages compliqués). Recommence — tu obtiens environ 30 jiaozi.",
      "Porte une grande casserole d'eau salée à frémissement (jamais à gros bouillons : les jiaozi éclateraient). Plonge les jiaozi par 10-12 à la fois — ne surcharge pas la casserole.",
      "Quand ils remontent à la surface (3-4 min), ajoute 1 verre d'eau froide pour calmer l'ébullition. Attends qu'ils remontent une 2e fois, puis 1 minute supplémentaire. Égoutte à l'écumoire.",
      "Mélange dans un petit bol 3 c.s. de sauce soja + 2 c.s. de vinaigre de riz + 1 c.s. d'huile de sésame — c'est la sauce trempage classique. Sers les jiaozi brûlants avec la sauce à côté. Trempe-les un par un avant de croquer.",
    ],
  },
  "nouilles-dan-dan": {
    commisIngredients: [
      { name: "Nouilles chinoises sèches (rayon Asie)", qty: 250, unit: "g" },
      { name: "Porc haché", qty: 250, unit: "g" },
      { name: "Sauce soja", qty: 4, unit: "c. à soupe" },
      { name: "Tahini (ou beurre de cacahuète crémeux)", qty: 3, unit: "c. à soupe" },
      { name: "Sucre", qty: 1, unit: "c. à café" },
      { name: "Vinaigre de riz (ou balsamique)", qty: 2, unit: "c. à soupe" },
      { name: "Sriracha (ou huile pimentée)", qty: 2, unit: "c. à soupe" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Poivre noir + pincée piment", qty: 1, unit: "c. à café" },
      { name: "Cacahuètes concassées", qty: 30, unit: "g" },
      { name: "Ciboule", qty: 3, unit: "u" },
      { name: "Épinards frais (ou surgelés)", qty: 100, unit: "g" },
      { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
    ],
    commisSteps: [
      "Porte une grande casserole d'eau à ébullition. Pendant ce temps, prépare la SAUCE du fond de bol : dans un grand bol, mélange 3 c.s. de tahini + 3 c.s. de sauce soja + 1 c.c. de sucre + 2 c.s. de vinaigre de riz + 2 c.s. de Sriracha + ail écrasé extra fin + poivre. Réserve.",
      "Dans une grande poêle ou un wok, fais chauffer 2 c.s. d'huile à feu vif. Ajoute le porc haché et fais-le revenir 4 min en l'émiettant à la spatule jusqu'à coloration brune. Ajoute 1 c.s. de sauce soja, remue 1 min. Réserve à chaud.",
      "Plonge les nouilles dans l'eau bouillante salée et cuis selon le paquet (en général 3-4 min). 1 min avant la fin, ajoute les épinards (frais ou surgelés) dans la casserole pour les blanchir. Réserve 100 ml d'eau de cuisson avant d'égoutter.",
      "Verse 3-4 c.s. d'eau de cuisson chaude sur la sauce dans le grand bol pour la détendre — elle doit être fluide et nappante. Mélange.",
      "Ajoute les nouilles + épinards égouttés directement dans le bol de sauce. Mélange vivement à la pince pour bien enrober. Dresse dans des bols individuels, dépose le porc haché chaud sur le dessus, parsème de cacahuètes concassées et de ciboule ciselée. Mange immédiatement en mélangeant tout dans le bol — c'est le rituel.",
    ],
  },
  "riz-cantonais": {
    commisIngredients: [
      { name: "Riz long grain ou basmati", qty: 300, unit: "g" },
      { name: "Eau (cuisson riz)", qty: 450, unit: "ml" },
      { name: "Jambon blanc (en dés)", qty: 150, unit: "g" },
      { name: "Crevettes décortiquées cuites", qty: 150, unit: "g" },
      { name: "Œufs", qty: 3, unit: "u" },
      { name: "Petits pois surgelés", qty: 100, unit: "g" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Ciboule", qty: 4, unit: "u" },
      { name: "Sauce soja", qty: 3, unit: "c. à soupe" },
      { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
      { name: "Huile de sésame (finition)", qty: 1, unit: "c. à café" },
      { name: "Sel et poivre", qty: 1, unit: "pincée" },
    ],
    commisSteps: [
      "Cuis le riz : 300 g pour 450 ml d'eau salée dans une casserole couverte. Porte à ébullition, baisse à feu très doux 11 min, repose 5 min couvert. Étale le riz sur un grand plat froid pour qu'il refroidisse 15 min — le riz tiède colle moins au wok.",
      "Pendant le repos du riz, prépare tout : coupe le jambon en petits dés, émince l'oignon et la ciboule, hache l'ail. Bats les œufs à la fourchette dans un bol.",
      "Dans un wok ou grande poêle, fais chauffer 1 c.s. d'huile à feu vif. Verse les œufs battus, brouille-les 30 s en formant des morceaux. Réserve dans une assiette.",
      "Remets 2 c.s. d'huile dans le wok. Ajoute l'oignon et l'ail, remue 1 min. Ajoute les petits pois (directement surgelés) et le jambon, fais sauter 2 min.",
      "Ajoute les crevettes cuites, remue 1 min. Verse le riz refroidi en l'émiettant à la main pour séparer les grains. Fais sauter à feu vif 3 min en remuant constamment — le riz doit chauffer et se détacher en grains.",
      "Verse 3 c.s. de sauce soja, ajoute les œufs brouillés réservés, mélange 1 min. Coupe le feu. Ajoute 1 c.c. d'huile de sésame et la moitié de la ciboule ciselée. Sale et poivre. Sers chaud avec le reste de ciboule en finition.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "chine");
if (!country) {
  console.error("Pays 'chine' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes chinoises migrées.`);

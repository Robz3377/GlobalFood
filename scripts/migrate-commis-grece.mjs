#!/usr/bin/env node
/**
 * Lot 10 — Grèce : ajoute commisIngredients + commisSteps aux 5 recettes
 * grecques et supprime le legacy simplifiedSteps.
 *
 * DERNIER LOT — après cette migration, le champ simplifiedSteps n'est plus
 * utilisé par aucune recette et peut être supprimé du schéma.
 *
 * Sources des versions commis :
 * - Moussaka : Supertoinette (sans stress), La Cerise sur le Maillot (express
 *   légère), Mes Recettes Faciles (aubergines grillées AU FOUR au lieu de
 *   frites individuelles ; bœuf haché ou agneau ; béchamel express ;
 *   parmesan au lieu de kefalotyri grec)
 * - Souvlaki : Plan Bouffe (meilleure marinade), HelloFresh (assiette
 *   souvlaki + tzatziki), Sucre et Épices (marinade yaourt classique)
 *   — blancs de poulet au lieu de hauts de cuisse désossés ; tzatziki en
 *   pot OK ; pains pita classiques
 * - Tzatziki + pita : Papilles et Pupilles (rapportée de Crète), Hellonélo,
 *   Altergusto (yaourt grec classique ; concombre standard ; menthe ;
 *   jus de citron au lieu de vinaigre de vin blanc grec ; pita libanaise OK)
 * - Spanakopita : Cuisine Addict, Jesuisgourmandemaisjemesoigne,
 *   Atelier des Chefs (FEUILLES DE BRICK au lieu de pâte filo ; ÉPINARDS
 *   SURGELÉS au lieu de frais 1 kg ; feta classique ; pas de ricotta)
 * - Baklava : Femmes d'Aujourd'hui, La Bille Baude, Atelier et Saveurs
 *   (pâte filo PRÊTE au lieu de 25 feuilles à badigeonner ; mélange
 *   pistaches + noix au lieu de pistaches d'Antep vert intense ; beurre
 *   fondu simple au lieu de ghee clarifié écumé ; sirop simplifié)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "data.json");

const COMMIS = {
  moussaka: {
    commisIngredients: [
      { name: "Aubergines", qty: 1000, unit: "g" },
      { name: "Bœuf haché (ou agneau si dispo)", qty: 500, unit: "g" },
      { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
      { name: "Concentré de tomate", qty: 2, unit: "c. à soupe" },
      { name: "Oignon jaune", qty: 1, unit: "u" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Cannelle en poudre", qty: 1, unit: "c. à café" },
      { name: "4 épices (ou paprika)", qty: 0.5, unit: "c. à café" },
      { name: "Origan séché", qty: 1, unit: "c. à café" },
      { name: "Persil ciselé", qty: 0.5, unit: "bouquet" },
      { name: "Huile d'olive", qty: 5, unit: "c. à soupe" },
      { name: "Beurre (béchamel)", qty: 50, unit: "g" },
      { name: "Farine (béchamel)", qty: 50, unit: "g" },
      { name: "Lait entier (béchamel)", qty: 500, unit: "ml" },
      { name: "Œuf entier (béchamel dorée)", qty: 1, unit: "u" },
      { name: "Parmesan râpé", qty: 80, unit: "g" },
      { name: "Noix de muscade en poudre", qty: 1, unit: "pincée" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Préchauffe le four à 200 °C. Coupe les aubergines en tranches de 1 cm dans la longueur, badigeonne-les des deux côtés d'huile d'olive (3 c.s.), sale légèrement. Étale-les sur 2 plaques garnies de papier sulfurisé. Enfourne 20 min en retournant à mi-cuisson, jusqu'à coloration dorée. Réserve.",
      "Pendant ce temps, prépare la sauce viande : émince l'oignon. Dans une grande poêle, fais chauffer 2 c.s. d'huile à feu moyen, fais fondre l'oignon 5 min. Ajoute la viande hachée et fais-la revenir 5 min en l'émiettant à la spatule jusqu'à coloration brune. Ajoute l'ail écrasé, la cannelle, les 4 épices et l'origan, remue 30 s.",
      "Verse les tomates concassées et le concentré de tomate. Sale, poivre. Laisse mijoter 15 min à feu doux jusqu'à ce que la sauce épaississe. Ajoute le persil ciselé, mélange.",
      "BÉCHAMEL EXPRESS : dans une casserole, fais fondre 50 g de beurre. Ajoute 50 g de farine en pluie, remue à la spatule 1 min (c'est le roux). Verse le lait chaud d'un coup et fouette énergiquement pour éviter les grumeaux. Laisse épaissir 3-4 min à feu moyen en fouettant. Hors du feu, ajoute la muscade, le poivre, 40 g de parmesan et l'œuf entier en fouettant rapidement (l'œuf doit s'incorporer sans cuire en omelette).",
      "MONTAGE : dans un plat à gratin (~25×35 cm), dispose une première couche d'aubergines grillées. Couvre de la moitié de la sauce viande. Re-couche d'aubergines. Verse le reste de sauce viande. Termine par les aubergines restantes. Nappe de toute la béchamel en lissant. Saupoudre du reste de parmesan râpé (40 g).",
      "Enfourne 35-40 min à 180 °C jusqu'à coloration dorée et bouillonnement. Laisse reposer 10 min hors du four avant de servir — c'est important pour que les couches se stabilisent et que les parts se tiennent au service.",
    ],
  },
  souvlaki: {
    commisIngredients: [
      { name: "Blancs (ou hauts de cuisse) de poulet", qty: 700, unit: "g" },
      { name: "Yaourt grec (ou nature)", qty: 100, unit: "g" },
      { name: "Huile d'olive", qty: 6, unit: "c. à soupe" },
      { name: "Jus de citron jaune", qty: 4, unit: "c. à soupe" },
      { name: "Ail", qty: 4, unit: "gousses" },
      { name: "Origan séché", qty: 2, unit: "c. à café" },
      { name: "Paprika doux", qty: 1, unit: "c. à café" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
      { name: "Pains pita", qty: 4, unit: "u" },
      { name: "Tomates", qty: 2, unit: "u" },
      { name: "Oignon rouge", qty: 1, unit: "u" },
      { name: "Tzatziki (en pot ou maison)", qty: 200, unit: "g" },
      { name: "Brochettes en bois", qty: 8, unit: "u" },
    ],
    commisSteps: [
      "Coupe le poulet en cubes de 2,5 cm. Dans un grand saladier, mélange le yaourt + 4 c.s. d'huile d'olive + jus de citron + ail écrasé + origan + paprika + sel + poivre. Ajoute les cubes de poulet, mélange et laisse mariner 30 min minimum (2 h c'est encore mieux au frais).",
      "Pendant la marinade, fais tremper les brochettes en bois dans un verre d'eau 20 min pour qu'elles ne brûlent pas à la cuisson. Émince finement l'oignon rouge et coupe les tomates en quartiers.",
      "Enfile les cubes de poulet sur les brochettes en serrant bien (5-6 cubes par brochette, soit 8 brochettes).",
      "CUISSON POÊLE OU PLANCHA : fais chauffer une grande poêle ou plancha à feu vif avec 2 c.s. d'huile d'olive. Pose les brochettes et fais-les saisir 3 min de chaque côté (12 min total en tournant 4 fois). Le poulet doit être doré-grillé sur les arêtes mais juteux à cœur.",
      "Pendant la cuisson, réchauffe les pains pita 20 s par face dans une poêle sèche bien chaude (ou 30 s au micro-ondes sous un torchon humide).",
      "Pour servir : ouvre chaque pita en deux poches. Garnis de poulet sorti des brochettes, ajoute tomate, oignon rouge et 1 grosse cuillère de tzatziki. Mange à la main, c'est la tradition du street food grec.",
    ],
  },
  "tzatziki-pita": {
    commisIngredients: [
      { name: "Yaourt grec classique", qty: 400, unit: "g" },
      { name: "Concombre", qty: 1, unit: "u" },
      { name: "Sel (dégorger le concombre)", qty: 1, unit: "c. à café" },
      { name: "Ail", qty: 3, unit: "gousses" },
      { name: "Menthe fraîche ciselée", qty: 0.5, unit: "bouquet" },
      { name: "Huile d'olive", qty: 3, unit: "c. à soupe" },
      { name: "Jus de citron", qty: 1, unit: "c. à soupe" },
      { name: "Poivre noir du moulin", qty: 1, unit: "pincée" },
      { name: "Pains pita", qty: 4, unit: "u" },
      { name: "Huile d'olive (pita)", qty: 1, unit: "c. à soupe" },
      { name: "Origan séché (pita)", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Râpe le concombre à la grosse râpe (avec la peau si elle est fine). Mets-le dans une passoire au-dessus de l'évier, sale avec 1 c.c. de sel et laisse dégorger 15 min. Presse-le ensuite très fort à la main pour évacuer toute l'eau — sinon le tzatziki sera liquide.",
      "Pendant que le concombre dégorge, écrase l'ail au pilon (ou au presse-ail) en pâte fine avec une pincée de sel. Cisèle finement la menthe.",
      "Dans un grand bol, mélange le yaourt grec + concombre pressé + pâte d'ail + menthe + 3 c.s. d'huile d'olive + jus de citron + poivre. Mélange à la cuillère jusqu'à homogène. Goûte, rectifie sel et citron.",
      "Filme au contact et place au frais MINIMUM 1 heure (2-3 h c'est encore mieux) — le repos permet aux saveurs de se développer et au tzatziki d'épaissir naturellement.",
      "Au moment de servir : badigeonne les pitas d'un filet d'huile d'olive, saupoudre d'origan séché. Réchauffe-les 1 min par face dans une poêle sèche bien chaude (ou 2 min au four à 200 °C). Coupe-les en quartiers.",
      "Sers le tzatziki bien frais dans un bol creux avec un filet d'huile d'olive en finition, accompagné des quartiers de pita chauds à tremper. Se conserve 3 jours au frigo en bocal fermé.",
    ],
  },
  spanakopita: {
    commisIngredients: [
      { name: "Épinards surgelés en branches", qty: 600, unit: "g" },
      { name: "Feta émiettée", qty: 250, unit: "g" },
      { name: "Œufs", qty: 3, unit: "u" },
      { name: "Oignons verts (ou 1 oignon jaune)", qty: 4, unit: "u" },
      { name: "Ail", qty: 2, unit: "gousses" },
      { name: "Aneth ou persil ciselés", qty: 0.5, unit: "bouquet" },
      { name: "Menthe fraîche ciselée", qty: 1, unit: "c. à soupe" },
      { name: "Noix de muscade en poudre", qty: 1, unit: "pincée" },
      { name: "Feuilles de brick rondes", qty: 10, unit: "u" },
      { name: "Beurre fondu (ou huile d'olive)", qty: 80, unit: "g" },
      { name: "Graines de sésame (déco)", qty: 2, unit: "c. à soupe" },
      { name: "Sel et poivre", qty: 1, unit: "c. à café" },
    ],
    commisSteps: [
      "Décongèle les épinards surgelés dans une passoire (30 min à température ambiante, ou 5 min au micro-ondes). Presse-les très fort à la main pour évacuer un maximum d'eau — sinon la spanakopita détrempe la pâte.",
      "Émince finement les oignons verts. Dans une grande poêle, fais chauffer 2 c.s. d'huile (prélevée du beurre) à feu moyen. Fais revenir les oignons 3 min, ajoute l'ail écrasé, remue 30 s. Ajoute les épinards pressés et fais sauter 3 min pour évaporer le reste d'humidité.",
      "Transfère le mélange épinards dans un saladier, laisse tiédir 5 min. Ajoute la feta émiettée, les œufs battus, l'aneth/persil + menthe ciselés, la muscade, le poivre. Sale légèrement (la feta sale déjà). Mélange.",
      "Préchauffe le four à 180 °C. Beurre généreusement un moule rond ou rectangulaire (~24 cm) au pinceau.",
      "MONTAGE : dépose 5 feuilles de brick beurrées au pinceau au fond du moule en étoile (elles débordent largement). Verse toute la farce d'épinards et égalise à la spatule. Replie les feuilles débordantes vers le centre comme un emballage cadeau. Couvre de 5 autres feuilles beurrées en scellant les bords.",
      "Badigeonne la dernière couche de beurre fondu, saupoudre de graines de sésame. Enfourne 25-30 min à 180 °C jusqu'à coloration dorée intense et croustillante. Laisse reposer 10 min avant de couper en parts généreuses. Sers tiède ou à température ambiante.",
    ],
  },
  baklava: {
    commisIngredients: [
      { name: "Pâte filo prête (rayon frais ou bio)", qty: 16, unit: "feuilles" },
      { name: "Pistaches non salées", qty: 200, unit: "g" },
      { name: "Noix", qty: 150, unit: "g" },
      { name: "Sucre (mélange noix)", qty: 30, unit: "g" },
      { name: "Cannelle en poudre", qty: 1, unit: "c. à café" },
      { name: "Beurre fondu", qty: 200, unit: "g" },
      { name: "Sucre semoule (sirop)", qty: 200, unit: "g" },
      { name: "Eau (sirop)", qty: 200, unit: "ml" },
      { name: "Miel", qty: 100, unit: "g" },
      { name: "Jus de citron (sirop)", qty: 1, unit: "c. à soupe" },
      { name: "Pistaches concassées (déco)", qty: 30, unit: "g" },
    ],
    commisSteps: [
      "Préchauffe le four à 170 °C. Mixe ensemble les pistaches + les noix au mixeur en pulses courts — tu veux une texture concassée (grains 2-3 mm), pas une poudre fine. Mélange avec 30 g de sucre et 1 c.c. de cannelle dans un bol.",
      "Beurre généreusement un moule rectangulaire (~25×35 cm). Pose la première feuille de pâte filo dans le moule (si elle est plus grande, replie le surplus). Badigeonne-la de beurre fondu au pinceau. Recommence avec 7 autres feuilles, en beurrant chacune — total 8 feuilles beurrées.",
      "Étale uniformément TOUT le mélange noix-pistaches sur la 8e feuille beurrée en une couche égale.",
      "Couvre de 8 nouvelles feuilles de filo, beurrées une par une comme avant. Termine par une généreuse couche de beurre sur le dessus.",
      "Avec un couteau bien aiguisé, découpe le baklava AVANT cuisson en losanges ou rectangles de 4-5 cm (sinon il s'effrite après cuisson). Enfourne 35-40 min à 170 °C jusqu'à coloration dorée caramel.",
      "Pendant la cuisson, prépare le SIROP : dans une casserole, verse 200 g de sucre + 200 ml d'eau + le jus de citron. Porte à ébullition, laisse frémir 5 min. Coupe le feu, ajoute le miel et mélange. Quand le baklava sort du four BRÛLANT, verse IMMÉDIATEMENT le sirop FROID dessus dans toutes les découpes — ce choc thermique est la clé du croustillant. Laisse absorber 4 h minimum (toute une nuit c'est mieux). Parsème des pistaches concassées avant de servir.",
    ],
  },
};

const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
const country = data.countries.find((c) => c.slug === "grece");
if (!country) {
  console.error("Pays 'grece' introuvable.");
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
console.log(`\n→ ${touched}/${country.recipes.length} recettes grecques migrées.`);

// Vérif globale : aucune recette ne devrait plus avoir simplifiedSteps
const leftover = [];
for (const c of data.countries) {
  for (const r of c.recipes) {
    if (r.simplifiedSteps !== undefined) leftover.push(`${c.slug}/${r.slug}`);
  }
}
if (leftover.length === 0) {
  console.log(
    "\n🎉 LOT 10 TERMINÉ — Aucune recette n'a plus de simplifiedSteps."
  );
  console.log("   → Le champ peut être supprimé du schéma lib/types.ts.");
} else {
  console.log(`\n⚠ ${leftover.length} recettes ont encore simplifiedSteps :`);
  leftover.forEach((r) => console.log(`   - ${r}`));
}

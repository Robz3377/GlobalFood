#!/usr/bin/env node
/**
 * v2.7 — Ajout des pays Sénégal et Vietnam (10 nouvelles recettes).
 *
 * Génère data/countries/senegal.json + data/countries/vietnam.json avec
 * la structure complète (Chef + Commis, catégories, infinitif), puis
 * régénère data/index.json pour intégrer les 60 recettes au final.
 *
 * Conventions respectées :
 *   • Étapes à l'INFINITIF (style Marmiton, cohérent avec v2.3)
 *   • Catégories culinaires : entree | plat | dessert | boisson
 *   • Champ image : chemin théorique /images/{slug}-{country.slug}.jpg
 *     (le script map-images-to-recipes.mjs les remappera selon les
 *     fichiers physiques que l'user uploadera plus tard)
 *   • Mode Commis = ingrédients supermarché simples (vs Chef niche)
 */
import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COUNTRIES_DIR = join(ROOT, "data", "countries");
const INDEX_PATH = join(ROOT, "data", "index.json");

// ============================================================================
// SÉNÉGAL — 5 recettes
// ============================================================================
const SENEGAL = {
  slug: "senegal",
  name: "Sénégal",
  iso3: "SEN",
  isoNumeric: "686",
  flag: "🇸🇳",
  intro:
    "Cuisine de partage et de générosité, la table sénégalaise marie le riz brisé du fleuve, le poisson de l'Atlantique et les épices de l'arrière-pays. On mange ensemble, dans un grand plat commun, à la main droite ou à la cuillère.",
  tagline: "Le grand plat commun, à partager",
  recipes: [
    // === 1. PASTELS — entrée =============================================
    {
      slug: "pastels",
      title: "Pastels au poisson",
      image: "/images/pastels-senegal.jpg",
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      diets: [],
      category: "entree",
      events: ["ramadan-end"],
      ingredients: [
        { name: "Thon frais (filet sans peau)", qty: 400, unit: "g" },
        { name: "Oignons jaunes émincés", qty: 2, unit: "u" },
        { name: "Tomates mûres concassées", qty: 3, unit: "u" },
        { name: "Concentré de tomates", qty: 1, unit: "c. à soupe" },
        { name: "Ail dégermé écrasé", qty: 3, unit: "gousses" },
        { name: "Persil plat ciselé", qty: 1, unit: "bouquet" },
        { name: "Cube de bouillon de poisson", qty: 1, unit: "u" },
        { name: "Piment frais haché (optionnel)", qty: 1, unit: "u" },
        { name: "Huile d'arachide (farce + friture)", qty: 1, unit: "L" },
        { name: "PÂTE — Farine T55", qty: 400, unit: "g" },
        { name: "Sel fin (pâte)", qty: 5, unit: "g" },
        { name: "Eau tiède", qty: 200, unit: "ml" },
        { name: "Levure chimique", qty: 5, unit: "g" },
      ],
      steps: [
        "Faire pocher le thon 8 min dans l'eau frémissante salée. Égoutter, refroidir, émietter finement à la fourchette.",
        "Dans une poêle, faire chauffer 30 ml d'huile d'arachide à feu moyen. Faire suer les oignons 10 min jusqu'à translucidité. Ajouter l'ail, remuer 30 s.",
        "Incorporer les tomates concassées, le concentré, le cube de bouillon émietté. Cuire à découvert 15 min jusqu'à obtenir une \"confiture\" épaisse (étape clé : la farce doit être SÈCHE pour ne pas détremper la pâte).",
        "Hors du feu, ajouter le thon émietté, le persil, le piment haché. Saler, mélanger. Réserver et laisser refroidir complètement.",
        "PÂTE : mélanger farine + sel + levure dans un saladier. Verser l'eau tiède en filet, pétrir 5 min jusqu'à obtenir une pâte lisse, non collante. Couvrir, laisser reposer 30 min.",
        "Abaisser la pâte au rouleau sur un plan fariné à 2 mm d'épaisseur. Découper des disques de 10 cm de diamètre (verre retourné).",
        "Déposer 1 c.s. de farce au centre de chaque disque. Humidifier le bord à l'eau, plier en demi-lune, sceller à la fourchette (motif gaufré signature).",
        "Faire chauffer 1 L d'huile d'arachide dans une casserole haute à 170 °C. Faire frire les pastels par lots de 4-5, 3 min par face jusqu'à doré profond. Égoutter sur grille. Servir chauds avec une sauce kani (oignons-tomate piquants).",
      ],
      commisIngredients: [
        { name: "Thon en boîte au naturel (égoutté)", qty: 200, unit: "g" },
        { name: "Oignons jaunes", qty: 2, unit: "u" },
        { name: "Concentré de tomates", qty: 2, unit: "c. à soupe" },
        { name: "Persil ciselé", qty: 0.5, unit: "bouquet" },
        { name: "Disques de pâte brick OU à raviolis (rayon Asie)", qty: 20, unit: "u" },
        { name: "Œuf battu (souder)", qty: 1, unit: "u" },
        { name: "Huile de friture", qty: 500, unit: "ml" },
      ],
      commisSteps: [
        "Émincer finement les oignons. Dans une poêle, faire chauffer 2 c.s. d'huile, faire suer les oignons 10 min jusqu'à coloration dorée. Ajouter le concentré de tomates, cuire 3 min en remuant.",
        "Hors du feu, incorporer le thon en boîte émietté et le persil ciselé. Saler, poivrer. Laisser tiédir 10 min.",
        "Déposer 1 c.s. de farce au centre de chaque disque de pâte. Badigeonner le bord d'œuf battu, refermer en demi-lune, sceller à la fourchette.",
        "Faire chauffer 500 ml d'huile dans une casserole haute jusqu'à frémissement franc (test : un bout de pâte doit dorer en 30 s).",
        "Faire frire les pastels par 4-5 à la fois, 2 min par face jusqu'à coloration dorée. Égoutter sur papier absorbant. Servir chauds avec une sauce piquante.",
      ],
      story:
        "Servis chauds dans toute Dakar, les pastels accompagnent le ndogou (rupture du jeûne) et s'invitent dans les apéritifs familiaux du dimanche.",
      chefSecret:
        "Cuire l'oignon-tomate à part jusqu'au confit AVANT d'incorporer le thon : la farce reste sèche et ne détrempe pas la pâte à la friture.",
    },

    // === 2. THIÉBOUDIENNE — plat principal ===============================
    {
      slug: "thieboudienne",
      title: "Thiéboudienne",
      image: "/images/thieboudienne-senegal.jpg",
      prepTime: 30,
      cookTime: 90,
      servings: 6,
      diets: [],
      category: "plat",
      ingredients: [
        { name: "Mérou ou capitaine en darnes (3 cm)", qty: 1, unit: "kg" },
        { name: "Riz brisé (riz cassé)", qty: 600, unit: "g" },
        { name: "Persil plat ciselé", qty: 1, unit: "bouquet" },
        { name: "Ail dégermé écrasé", qty: 6, unit: "gousses" },
        { name: "Piment fort frais", qty: 1, unit: "u" },
        { name: "Carottes en bâtonnets épais", qty: 3, unit: "u" },
        { name: "Chou pommé en quartiers", qty: 0.5, unit: "u" },
        { name: "Aubergines amères (jaxatu)", qty: 3, unit: "u" },
        { name: "Manioc frais (ou patate douce)", qty: 300, unit: "g" },
        { name: "Gombos", qty: 100, unit: "g" },
        { name: "Tomates fraîches mondées", qty: 4, unit: "u" },
        { name: "Concentré de tomates", qty: 80, unit: "g" },
        { name: "Oignons jaunes", qty: 2, unit: "u" },
        { name: "Cubes bouillon Maggi crevette", qty: 2, unit: "u" },
        { name: "Huile d'arachide", qty: 150, unit: "ml" },
        { name: "Tamarin (boules ou pâte)", qty: 30, unit: "g" },
        { name: "Sel et poivre", qty: 1, unit: "c. à soupe" },
      ],
      steps: [
        "FARCE ROFF : piler au mortier le persil, 3 gousses d'ail, la moitié du piment, un peu de sel jusqu'à obtenir une pâte verte épaisse. Inciser les darnes en croix sur 2 cm de profondeur, garnir chaque incision de roff.",
        "Faire chauffer 150 ml d'huile d'arachide dans une grande marmite en fonte. Saisir les darnes 3 min de chaque côté jusqu'à coloration dorée. Réserver sur assiette (mais GARDER l'huile parfumée : c'est le xoss).",
        "Dans la même huile, faire suer les oignons émincés 8 min. Ajouter le reste d'ail écrasé, remuer 30 s.",
        "Incorporer le concentré de tomates, cuire 5 min en remuant. Ajouter les tomates mondées concassées, cuire 10 min jusqu'à réduction épaisse.",
        "Verser 2,5 L d'eau bouillante, ajouter les cubes Maggi, le tamarin, le reste de piment. Saler. Porter à frémissement.",
        "Ajouter les légumes les plus durs (manioc, carottes), cuire 20 min.",
        "Ajouter chou et aubergines, cuire 15 min. Ajouter les gombos, cuire 5 min. Tous les légumes doivent être tendres mais entiers.",
        "Sortir tous les légumes à l'écumoire, réserver dans un grand plat. Sortir aussi le poisson, recouvrir.",
        "PRÉLEVER 1,5 L de bouillon, réserver pour le service. Le reste doit représenter ~1,2 fois le volume du riz pour la cuisson absorbée.",
        "Rincer le riz brisé 3 fois. L'ajouter dans la marmite, lisser. Couvrir hermétiquement, cuire 25 min à feu très doux sans remuer (cuisson absorbée signature).",
        "Pendant ce temps, remettre poisson et légumes à réchauffer dans le bouillon réservé.",
        "SERVICE TRADITIONNEL : déposer le riz orange en dôme au centre d'un grand plat rond. Disposer le poisson au centre, les légumes en couronne autour. Arroser d'un peu de bouillon. Manger ensemble, à la main droite ou à la cuillère, dans le plat commun.",
      ],
      commisIngredients: [
        { name: "Pavés de cabillaud", qty: 600, unit: "g" },
        { name: "Riz long grain", qty: 400, unit: "g" },
        { name: "Carottes", qty: 2, unit: "u" },
        { name: "Chou blanc", qty: 0.25, unit: "u" },
        { name: "Aubergine", qty: 1, unit: "u" },
        { name: "Patate douce", qty: 200, unit: "g" },
        { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
        { name: "Concentré de tomates", qty: 3, unit: "c. à soupe" },
        { name: "Oignons jaunes", qty: 2, unit: "u" },
        { name: "Ail", qty: 4, unit: "gousses" },
        { name: "Cubes de bouillon de poisson", qty: 2, unit: "u" },
        { name: "Persil ciselé", qty: 1, unit: "bouquet" },
        { name: "Huile végétale", qty: 4, unit: "c. à soupe" },
        { name: "Sel et poivre", qty: 1, unit: "c. à café" },
      ],
      commisSteps: [
        "Émincer les oignons, écraser l'ail. Couper carottes, chou, aubergine, patate douce en gros cubes.",
        "Dans une grande cocotte, faire chauffer 3 c.s. d'huile. Saisir les pavés de cabillaud 2 min de chaque côté. Réserver.",
        "Dans la même cocotte, faire suer les oignons 6 min. Ajouter ail et concentré de tomates, cuire 1 min en remuant.",
        "Verser les tomates concassées et 1,5 L d'eau chaude avec les 2 cubes de bouillon dilués. Porter à frémissement. Ajouter carottes et patate douce, cuire 12 min.",
        "Ajouter chou et aubergine, cuire 10 min. Goûter, rectifier sel et poivre. Retirer les légumes à l'écumoire et garder au chaud.",
        "Verser le riz dans le bouillon (volume bouillon = 1,2 × volume riz). Couvrir, cuire 18 min à feu doux sans remuer.",
        "Remettre poisson et légumes sur le riz cuit pour réchauffer 5 min couvert. Parsemer de persil. Servir dans un grand plat commun avec les légumes en couronne autour.",
      ],
      story:
        "Plat national sénégalais inscrit à l'UNESCO depuis 2021, le « riz au poisson » est né à Saint-Louis sous la cuisinière Penda Mbaye. Il marie poisson, riz brisé et sept légumes dans un bouillon orange-rouge signature.",
      chefSecret:
        "Réserver l'huile de cuisson du poisson pour parfumer le riz : c'est ce « xoss » qui donne au plat sa couleur orange-rouge ambrée caractéristique.",
    },

    // === 3. YASSA POULET — plat principal ================================
    {
      slug: "yassa-poulet",
      title: "Yassa au poulet",
      image: "/images/yassa-poulet-senegal.jpg",
      prepTime: 30,
      cookTime: 60,
      servings: 4,
      diets: [],
      category: "plat",
      ingredients: [
        { name: "Cuisses de poulet entières (hauts + pilons)", qty: 6, unit: "u" },
        { name: "Oignons jaunes émincés très fin", qty: 5, unit: "u" },
        { name: "Jus de citrons verts frais (4 citrons)", qty: 150, unit: "ml" },
        { name: "Moutarde de Dijon", qty: 50, unit: "g" },
        { name: "Ail dégermé écrasé", qty: 6, unit: "gousses" },
        { name: "Vinaigre de vin blanc", qty: 30, unit: "ml" },
        { name: "Cube bouillon de poulet", qty: 1, unit: "u" },
        { name: "Piment Scotch Bonnet ou habanero (entier non percé)", qty: 1, unit: "u" },
        { name: "Olives vertes dénoyautées", qty: 80, unit: "g" },
        { name: "Feuilles de laurier", qty: 2, unit: "u" },
        { name: "Thym frais", qty: 3, unit: "brins" },
        { name: "Huile d'arachide", qty: 60, unit: "ml" },
        { name: "Sel et poivre noir", qty: 1, unit: "c. à soupe" },
      ],
      steps: [
        "MARINADE : dans un grand saladier, mélanger jus de citron + moutarde + ail écrasé + vinaigre + cube émietté + sel + poivre. Ajouter les cuisses de poulet, masser pour bien enrober. Ajouter la moitié des oignons émincés. Couvrir, laisser mariner 4 h minimum (idéal 24 h au frigo).",
        "Sortir les cuisses de la marinade, RÉSERVER la marinade avec ses oignons.",
        "Dans une grande cocotte, faire chauffer 30 ml d'huile à feu vif. Faire dorer les cuisses 4 min par côté jusqu'à coloration caramel dorée. Réserver.",
        "Dans la même cocotte, faire chauffer le reste d'huile. Ajouter le RESTE des oignons (non marinés). Faire suer à feu doux 25 min en remuant souvent, jusqu'à compote dorée jaune-orangée (étape signature : oignons fondants, pas grillés).",
        "Ajouter la marinade réservée (avec ses oignons), porter à frémissement. Laisser réduire 10 min.",
        "Remettre les cuisses dans la cocotte. Ajouter le piment entier (non percé pour le parfum sans piquant fort), le laurier, le thym, les olives.",
        "Verser 250 ml d'eau chaude. Couvrir, laisser mijoter à feu doux 35 min. Retourner les cuisses à mi-cuisson.",
        "Découvrir, retirer le piment entier. Si la sauce est trop liquide, réduire 10 min à découvert (sauce nappante avec beaucoup d'oignons-jus).",
        "Servir avec du riz blanc parfumé (jasmin), arroser généreusement de sauce et d'oignons confits.",
      ],
      commisIngredients: [
        { name: "Cuisses de poulet", qty: 4, unit: "u" },
        { name: "Oignons jaunes", qty: 3, unit: "u" },
        { name: "Jus de citron jaune (2 citrons)", qty: 80, unit: "ml" },
        { name: "Moutarde forte", qty: 2, unit: "c. à soupe" },
        { name: "Ail", qty: 3, unit: "gousses" },
        { name: "Cube de bouillon de volaille", qty: 1, unit: "u" },
        { name: "Olives vertes en bocal", qty: 60, unit: "g" },
        { name: "Bouquet garni (sachet)", qty: 1, unit: "u" },
        { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
        { name: "Sel et poivre", qty: 1, unit: "c. à café" },
      ],
      commisSteps: [
        "MARINADE : dans un grand saladier, mélanger jus de citron + moutarde + ail écrasé + sel + poivre. Ajouter les cuisses, masser, laisser mariner 30 min minimum (1 h c'est mieux).",
        "Émincer les oignons. Dans une cocotte, faire chauffer 2 c.s. d'huile à feu vif, faire dorer les cuisses 3 min par côté. Réserver.",
        "Dans la même cocotte, faire chauffer le reste d'huile. Faire suer les oignons 15 min à feu doux jusqu'à coloration dorée fondante.",
        "Ajouter la marinade restante + le cube de bouillon dilué dans 250 ml d'eau chaude + le bouquet garni. Porter à frémissement, laisser réduire 5 min.",
        "Remettre les cuisses dans la cocotte avec les olives égouttées. Couvrir, laisser mijoter à feu doux 30 min en retournant à mi-cuisson.",
        "Découvrir, laisser réduire 5 min si nécessaire. Servir avec du riz blanc, arroser de sauce et d'oignons confits.",
      ],
      story:
        "Né en Casamance, le yassa est devenu le plat dominical sénégalais par excellence. La marinade citron-oignon-moutarde fait la magie : elle attendrit la viande et parfume la sauce d'oignons confits.",
      chefSecret:
        "Mariner le poulet 24 h au frigo : les acides du citron et de la moutarde de Dijon décomposent les fibres pour une viande fondante.",
    },

    // === 4. MAAFÉ — plat principal =======================================
    {
      slug: "maafe",
      title: "Maafé (ragoût à la pâte d'arachide)",
      image: "/images/maafe-senegal.jpg",
      prepTime: 20,
      cookTime: 90,
      servings: 6,
      diets: [],
      category: "plat",
      seasons: ["autumn", "winter"],
      ingredients: [
        { name: "Bœuf à mijoter (gîte ou paleron) en cubes 4 cm", qty: 800, unit: "g" },
        { name: "Pâte d'arachide pure (100% cacahuètes)", qty: 250, unit: "g" },
        { name: "Oignons jaunes émincés", qty: 2, unit: "u" },
        { name: "Tomates fraîches concassées", qty: 4, unit: "u" },
        { name: "Concentré de tomates", qty: 50, unit: "g" },
        { name: "Ail dégermé écrasé", qty: 4, unit: "gousses" },
        { name: "Patate douce en cubes 3 cm", qty: 600, unit: "g" },
        { name: "Manioc en tronçons", qty: 400, unit: "g" },
        { name: "Chou pommé en quartiers", qty: 0.5, unit: "u" },
        { name: "Carottes en bâtonnets", qty: 3, unit: "u" },
        { name: "Aubergines amères (jaxatu) ou violettes", qty: 2, unit: "u" },
        { name: "Piment Scotch Bonnet entier non percé", qty: 1, unit: "u" },
        { name: "Cubes bouillon bœuf", qty: 2, unit: "u" },
        { name: "Huile d'arachide", qty: 60, unit: "ml" },
        { name: "Riz blanc (servir)", qty: 400, unit: "g" },
      ],
      steps: [
        "Saler et poivrer les cubes de bœuf. Dans une grande cocotte en fonte, faire chauffer 60 ml d'huile d'arachide à feu vif. Saisir les cubes 5 min en remuant jusqu'à coloration brune sur toutes faces. Réserver.",
        "Dans la même cocotte, baisser à feu moyen. Faire suer les oignons 10 min. Ajouter l'ail, remuer 30 s.",
        "Incorporer le concentré de tomates, cuire 3 min en remuant. Ajouter les tomates concassées, cuire 10 min jusqu'à réduction.",
        "Remettre la viande dans la cocotte. Verser 2 L d'eau bouillante avec les cubes Maggi. Ajouter le piment entier. Porter à frémissement, couvrir, laisser mijoter 45 min.",
        "Pendant ce temps, dans un bol, prélever 500 ml de bouillon CHAUD de la cocotte. Y délayer la pâte d'arachide en fouettant vigoureusement jusqu'à mélange parfaitement lisse (étape clé : pas de grumeaux).",
        "Verser la pâte d'arachide délayée dans la cocotte, mélanger doucement à la cuillère en bois. Continuer à cuire 20 min à feu très doux, en remuant souvent pour ne pas attacher (la pâte épaissit la sauce naturellement).",
        "Ajouter les légumes les plus durs (manioc, carottes), cuire 15 min.",
        "Ajouter patate douce et chou, cuire 10 min. Ajouter aubergines, cuire 5 min. Tous les légumes doivent être tendres.",
        "Goûter, rectifier le sel. Retirer le piment entier. La sauce doit être épaisse, brun-caramel, nappant les ingrédients.",
        "Pendant ce temps, cuire le riz blanc. Servir le maafé sur un lit de riz, dans un grand plat commun, à manger à la main droite ou à la cuillère.",
      ],
      commisIngredients: [
        { name: "Bœuf à mijoter en cubes", qty: 600, unit: "g" },
        { name: "Beurre de cacahuète sans sucre", qty: 180, unit: "g" },
        { name: "Oignons jaunes", qty: 2, unit: "u" },
        { name: "Tomates concassées en boîte", qty: 400, unit: "g" },
        { name: "Patate douce", qty: 500, unit: "g" },
        { name: "Carottes", qty: 3, unit: "u" },
        { name: "Cubes de bouillon de bœuf", qty: 2, unit: "u" },
        { name: "Eau chaude", qty: 1.5, unit: "L" },
        { name: "Huile végétale", qty: 3, unit: "c. à soupe" },
        { name: "Sel et poivre", qty: 1, unit: "c. à café" },
        { name: "Riz blanc (servir)", qty: 300, unit: "g" },
      ],
      commisSteps: [
        "Couper la viande en cubes de 3 cm. Émincer les oignons. Couper carottes et patate douce en gros cubes.",
        "Dans une grande cocotte, faire chauffer 3 c.s. d'huile à feu vif. Saisir la viande 5 min jusqu'à coloration. Réserver.",
        "Dans la même cocotte, faire suer les oignons 8 min à feu moyen. Verser les tomates concassées et 1,5 L d'eau chaude avec les 2 cubes de bouillon. Remettre la viande. Saler, poivrer. Couvrir, laisser mijoter 40 min.",
        "Dans un bol, prélever 500 ml de bouillon chaud de la cocotte. Délayer le beurre de cacahuète au fouet jusqu'à dissolution parfaite (zéro grumeau).",
        "Verser le mélange dans la cocotte, mélanger doucement. Ajouter carottes et patate douce. Continuer à cuire 25 min à découvert pour épaissir la sauce.",
        "Pendant ce temps, cuire le riz blanc (300 g pour 450 ml d'eau salée, 11 min à feu très doux, repos 5 min). Servir le maafé sur le riz dans un grand plat commun.",
      ],
      story:
        "Plat de fête mandingue partagé du Sénégal au Mali, le maafé tire sa richesse de la pâte d'arachide qui épaissit la sauce et lui donne sa profondeur caramel-grillée.",
      chefSecret:
        "Diluer la pâte d'arachide dans le bouillon CHAUD avant de l'incorporer à la cocotte. Mélangée directement à froid, elle forme des grumeaux qui ne se redéfont jamais.",
    },

    // === 5. THIAKRY — dessert ============================================
    {
      slug: "thiakry",
      title: "Thiakry (couscous de mil au lait)",
      image: "/images/thiakry-senegal.jpg",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      diets: ["vegetarian"],
      category: "dessert",
      seasons: ["summer"],
      ingredients: [
        { name: "Semoule de mil fine (couscous de mil)", qty: 300, unit: "g" },
        { name: "Lait caillé (lait de brebis fermenté, type « soow »)", qty: 800, unit: "g" },
        { name: "Lait concentré sucré", qty: 200, unit: "g" },
        { name: "Crème fraîche épaisse", qty: 100, unit: "g" },
        { name: "Sucre en poudre", qty: 80, unit: "g" },
        { name: "Gousse de vanille fendue", qty: 1, unit: "u" },
        { name: "Eau de fleur d'oranger", qty: 1, unit: "c. à soupe" },
        { name: "Raisins secs (optionnel)", qty: 50, unit: "g" },
        { name: "Sel fin (semoule)", qty: 1, unit: "pincée" },
      ],
      steps: [
        "HYDRATATION DU MIL : verser la semoule dans un grand plat, humidifier avec 150 ml d'eau froide salée. Rouler entre les paumes 5 min pour bien hydrater chaque grain (méthode signature des 3 vapeurs).",
        "1ʳᵉ VAPEUR : transférer dans le panier d'une couscoussière, sur de l'eau frémissante. Cuire 15 min sans couvrir. Sortir, étaler sur le plat, arroser de 80 ml d'eau froide, rouler entre paumes pour aérer.",
        "2ᵉ VAPEUR : remettre 10 min à la vapeur. Aération identique avec 60 ml d'eau.",
        "3ᵉ VAPEUR : remettre 5 min à la vapeur. Aération finale, laisser refroidir totalement (les grains doivent être tendres, séparés, légers).",
        "Pendant ce temps, gratter la gousse de vanille pour extraire les graines.",
        "CRÈME : dans un grand saladier, fouetter le lait caillé + lait concentré sucré + crème fraîche + sucre + graines de vanille + fleur d'oranger jusqu'à mélange parfaitement lisse et crémeux. Goûter, rectifier le sucre (à doser selon le pétillant du lait caillé).",
        "Incorporer la semoule refroidie dans la crème, mélanger délicatement à la spatule (le mil absorbe la crème mais reste perceptible en grains).",
        "Ajouter les raisins secs si utilisés. Filmer au contact, placer au frais 2 h minimum (idéal 4 h) — le thiakry doit être TRÈS frais.",
        "Servir dans des bols individuels ou dans un grand plat commun à partager à la cuillère.",
      ],
      commisIngredients: [
        { name: "Semoule fine (couscous de blé, à défaut de mil)", qty: 250, unit: "g" },
        { name: "Yaourt nature brassé", qty: 500, unit: "g" },
        { name: "Lait concentré sucré", qty: 200, unit: "g" },
        { name: "Sucre vanillé", qty: 2, unit: "sachets" },
        { name: "Eau de fleur d'oranger", qty: 1, unit: "c. à soupe" },
        { name: "Raisins secs", qty: 50, unit: "g" },
        { name: "Eau (hydratation semoule)", qty: 250, unit: "ml" },
      ],
      commisSteps: [
        "Verser la semoule fine dans un grand bol. Verser 250 ml d'eau bouillante salée par-dessus, couvrir d'une assiette, laisser gonfler 5 min. Aérer à la fourchette pour séparer les grains. Laisser refroidir complètement.",
        "Dans un grand saladier, fouetter le yaourt + lait concentré sucré + sucre vanillé + fleur d'oranger jusqu'à mélange crémeux.",
        "Incorporer la semoule refroidie dans la crème, mélanger à la spatule en soulevant la masse de bas en haut.",
        "Ajouter les raisins secs. Filmer au contact, placer au frais 2 h minimum.",
        "Servir très frais dans des bols ou dans un grand plat commun à la cuillère.",
      ],
      story:
        "Dessert frais des fins de repas sénégalais, le thiakry marie la semoule de mil cuite à la vapeur avec un lait caillé crémeux sucré à la vanille. Servi très frais après la prière du vendredi.",
      chefSecret:
        "Faire 3 vapeurs successives sur la semoule de mil avec des aérations intercalées — c'est ce qui donne le grain qui ne colle pas et reste léger en bouche.",
    },
  ],
};

// ============================================================================
// VIETNAM — 5 recettes
// ============================================================================
const VIETNAM = {
  slug: "vietnam",
  name: "Vietnam",
  iso3: "VNM",
  isoNumeric: "704",
  flag: "🇻🇳",
  intro:
    "Cuisine d'équilibre où chaque plat marie le salé, le sucré, l'acide et le piquant. Les herbes fraîches sont reines, la galette de riz transparente est un art, et le bouillon parfumé à l'anis étoilé court de Hanoï à Hô Chi Minh-Ville.",
  tagline: "L'équilibre des cinq saveurs",
  recipes: [
    // === 1. GỎI CUỐN — entrée =============================================
    {
      slug: "goi-cuon",
      title: "Gỏi Cuốn (rouleaux de printemps)",
      image: "/images/goi-cuon-vietnam.jpg",
      prepTime: 40,
      cookTime: 10,
      servings: 4,
      diets: ["gluten-free", "dairy-free"],
      category: "entree",
      ingredients: [
        { name: "Galettes de riz vietnamiennes 22 cm (bánh tráng)", qty: 12, unit: "u" },
        { name: "Crevettes tigres cuites décortiquées (queue gardée)", qty: 12, unit: "u" },
        { name: "Poitrine de porc cuite à l'eau froide 30 min", qty: 200, unit: "g" },
        { name: "Vermicelles de riz fins (bún)", qty: 100, unit: "g" },
        { name: "Salade rouge (feuilles tendres)", qty: 12, unit: "feuilles" },
        { name: "Menthe fraîche (feuilles entières)", qty: 1, unit: "bouquet" },
        { name: "Coriandre fraîche (avec tiges fines)", qty: 1, unit: "bouquet" },
        { name: "Basilic thaï (horapa)", qty: 1, unit: "bouquet" },
        { name: "Ciboule (longueurs entières)", qty: 6, unit: "brins" },
        { name: "SAUCE NUOC CHẤM — Sauce nuoc-mâm", qty: 60, unit: "ml" },
        { name: "Jus de citron vert frais", qty: 30, unit: "ml" },
        { name: "Sucre", qty: 30, unit: "g" },
        { name: "Ail dégermé haché EXTRÊMEMENT FIN", qty: 2, unit: "gousses" },
        { name: "Piment oiseau haché", qty: 1, unit: "u" },
        { name: "Eau chaude (sauce)", qty: 60, unit: "ml" },
      ],
      steps: [
        "Faire bouillir une casserole d'eau, plonger les vermicelles de riz 3 min, égoutter, rafraîchir à l'eau froide pour stopper la cuisson, étaler sur un plat.",
        "Faire pocher la poitrine de porc 30 min dans l'eau frémissante salée (départ eau froide pour viande tendre). Refroidir, émincer à la mandoline en tranches très fines de 2 mm.",
        "Décortiquer les crevettes en gardant la queue. Les ouvrir en deux dans le sens de la longueur pour qu'elles tiennent à plat dans le rouleau.",
        "Effeuiller herbes et salade, laver, sécher PARFAITEMENT (essoreuse + torchon).",
        "SAUCE NUOC CHẤM : mélanger eau chaude + sucre dans un bol jusqu'à dissolution. Ajouter nuoc-mâm + jus de citron + ail extra fin + piment. Goûter, équilibrer salé-sucré-acide-piquant. Réserver.",
        "PRÉPARER LE POSTE : grande assiette d'eau tiède (pas chaude), torchon humide propre sur le plan de travail, tous les ingrédients à portée de main dans l'ordre de garniture.",
        "ASSEMBLAGE (1 rouleau à la fois) : plonger 1 galette de riz dans l'eau tiède PENDANT 5 SECONDES (chronométrer). Étaler sur le torchon humide.",
        "Sur le tiers inférieur de la galette, disposer dans cet ordre : 1 feuille de salade légèrement déchirée, 2 c.s. de vermicelles, 2 tranches de porc, 4-5 feuilles de menthe/coriandre/basilic. Au-dessus, aligner 2 crevettes coupées en deux, face rouge contre la galette (elles apparaîtront roses à travers).",
        "ROULAGE : replier le bord gauche puis le bord droit vers le centre. Rouler depuis le bas vers le haut, en serrant FERMEMENT mais sans déchirer. Le rouleau doit être bien tendu.",
        "Réserver les rouleaux côte à côte sur un plat (sans qu'ils se touchent, sinon ils collent). Servir frais avec la sauce nuoc chấm à part. Manger à la main en trempant chaque rouleau.",
      ],
      commisIngredients: [
        { name: "Galettes de riz rondes (rayon Asie)", qty: 12, unit: "u" },
        { name: "Crevettes cuites décortiquées surgelées", qty: 200, unit: "g" },
        { name: "Vermicelles de riz (paquet rayon Asie)", qty: 100, unit: "g" },
        { name: "Salade type batavia", qty: 12, unit: "feuilles" },
        { name: "Menthe fraîche", qty: 1, unit: "bouquet" },
        { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
        { name: "Sauce nuoc-mâm", qty: 4, unit: "c. à soupe" },
        { name: "Jus de citron vert (1 citron)", qty: 2, unit: "c. à soupe" },
        { name: "Sucre", qty: 2, unit: "c. à soupe" },
        { name: "Ail", qty: 1, unit: "gousse" },
        { name: "Eau chaude (sauce)", qty: 4, unit: "c. à soupe" },
      ],
      commisSteps: [
        "Faire bouillir de l'eau, plonger les vermicelles 3 min, égoutter, rafraîchir à l'eau froide. Étaler sur un plat.",
        "SAUCE : dans un bol, mélanger eau chaude + sucre jusqu'à dissolution. Ajouter nuoc-mâm + jus de citron + ail écrasé fin. Goûter et rectifier.",
        "Préparer le poste : grande assiette d'eau tiède, torchon humide, ingrédients alignés.",
        "Pour chaque rouleau : tremper la galette 5 secondes dans l'eau tiède, étaler sur le torchon. Au tiers inférieur, déposer 1/2 feuille de salade + 2 c.s. de vermicelles + 2 crevettes + 4 feuilles de menthe/coriandre.",
        "Replier les bords gauche-droite vers le centre, puis rouler du bas vers le haut en serrant. Réserver les rouleaux séparés sur un plat. Servir frais avec la sauce.",
      ],
      story:
        "Délicats rouleaux frais du Sud-Vietnam, les gỏi cuốn arrivent en première étape d'un repas familial. La galette de riz transparente laisse voir les couleurs : rose des crevettes, vert de la menthe, blanc des vermicelles.",
      chefSecret:
        "Tremper la galette de riz dans l'eau tiède SEULEMENT 5 secondes (pas plus), puis poser-la sur un torchon humide. Elle finit de s'assouplir pendant qu'on la garnit.",
    },

    // === 2. PHỞ BÒ — plat principal ======================================
    {
      slug: "pho-bo",
      title: "Phở Bò (soupe de nouilles au bœuf)",
      image: "/images/pho-bo-vietnam.jpg",
      prepTime: 30,
      cookTime: 240,
      servings: 4,
      diets: ["dairy-free"],
      category: "plat",
      seasons: ["winter"],
      events: ["chinese-new-year"],
      ingredients: [
        { name: "Os à moelle de bœuf", qty: 1, unit: "kg" },
        { name: "Jarret de bœuf (bouillon + tranches finales)", qty: 800, unit: "g" },
        { name: "Faux-filet ou romsteak cru bien froid (à trancher fin)", qty: 300, unit: "g" },
        { name: "Nouilles de riz larges plates (bánh phở)", qty: 400, unit: "g" },
        { name: "Oignons jaunes ENTIERS non pelés (à torréfier)", qty: 2, unit: "u" },
        { name: "Gingembre frais ENTIER (morceau 8 cm)", qty: 1, unit: "u" },
        { name: "Anis étoilé", qty: 4, unit: "u" },
        { name: "Bâton de cannelle (5 cm)", qty: 1, unit: "u" },
        { name: "Clous de girofle", qty: 5, unit: "u" },
        { name: "Graines de coriandre", qty: 1, unit: "c. à soupe" },
        { name: "Cardamome noire (grande)", qty: 2, unit: "u" },
        { name: "Sucre de canne", qty: 30, unit: "g" },
        { name: "Sauce nuoc-mâm", qty: 60, unit: "ml" },
        { name: "GARNITURES — Ciboule blanche en biais", qty: 4, unit: "brins" },
        { name: "Oignon rouge en lamelles fines", qty: 0.5, unit: "u" },
        { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
        { name: "Basilic thaï (horapa)", qty: 1, unit: "bouquet" },
        { name: "Pousses de soja crues", qty: 200, unit: "g" },
        { name: "Citrons verts en quartiers", qty: 2, unit: "u" },
        { name: "Piments oiseaux en rondelles", qty: 2, unit: "u" },
        { name: "Sauce hoisin et Sriracha (à part pour chaque convive)", qty: 1, unit: "u" },
      ],
      steps: [
        "BLANCHIR LES OS (étape clé pour bouillon CLAIR) : déposer os et jarret dans une grande marmite d'eau froide, porter à ébullition franche, cuire 10 min. L'eau devient brunâtre (impuretés). Égoutter, rincer os et viande sous l'eau froide. JETER l'eau.",
        "TORRÉFIER OIGNONS + GINGEMBRE : faire griller les oignons non pelés et le gingembre entier directement sur la flamme du gaz (rotation à la pince) pendant 8-10 min jusqu'à noircissement extérieur (à défaut : sous le grill du four à 250 °C, 15 min). Peler grossièrement les parties carbonisées.",
        "TORRÉFIER LES ÉPICES : dans une poêle sèche, faire torréfier anis + cannelle + clous + coriandre + cardamome 2 min à feu moyen jusqu'à libération des arômes (étape clé : sans cette torréfaction le bouillon est plat).",
        "Dans la marmite rincée, remettre os et jarret. Couvrir d'eau froide PROPRE (5 L). Ajouter oignons et gingembre torréfiés + épices torréfiées (dans une gaze de mousseline pour faciliter le retrait).",
        "Porter à ébullition franche, puis IMMÉDIATEMENT baisser à frémissement très doux. Écumer toutes les impuretés qui remontent en surface pendant les 30 premières minutes.",
        "Laisser frémir doucement 3 h 30 à découvert (le bouillon doit JUSTE frémir). Ajouter le sucre et 30 ml de nuoc-mâm à 2 h 30. Goûter, ajuster sel et nuoc-mâm.",
        "PRÉPARATION DU BŒUF CRU : pendant le bouillon, placer le faux-filet 1 h au congélateur (ça fige les fibres). Le sortir, trancher au couteau bien aiguisé en lamelles ULTRA-FINES (1,5-2 mm, translucides). Réserver couvert au frais.",
        "Sortir le jarret cuit du bouillon, laisser tiédir, trancher en lamelles fines. Réserver.",
        "Filtrer le bouillon à la passoire fine doublée d'une mousseline. Le bouillon final doit être DORÉ AMBRÉ et CLAIR (signature visuelle). Maintenir à frémissement.",
        "Cuire les nouilles plates 4-5 min dans une grande casserole d'eau bouillante non salée. Égoutter, ne pas rafraîchir.",
        "DRESSAGE (rapide, le bouillon doit être BRÛLANT) : répartir les nouilles dans 4 grands bols à phở. Disposer les tranches de jarret cuit et 5-6 lamelles de bœuf cru sur le dessus. Verser le bouillon brûlant directement sur le bœuf cru (la chaleur va le saisir).",
        "Garnir immédiatement de ciboule, oignon rouge, herbes. Servir avec assiette de pousses de soja, basilic, citron vert, piments, et sauces hoisin + Sriracha à part — chacun assaisonne dans son bol selon son goût.",
      ],
      commisIngredients: [
        { name: "Bœuf à mijoter (gîte)", qty: 600, unit: "g" },
        { name: "Faux-filet (pour les tranches crues finales)", qty: 200, unit: "g" },
        { name: "Nouilles de riz plates (rayon Asie)", qty: 400, unit: "g" },
        { name: "Cubes de bouillon de bœuf", qty: 3, unit: "u" },
        { name: "Eau", qty: 2, unit: "L" },
        { name: "Gingembre frais", qty: 50, unit: "g" },
        { name: "Oignon jaune", qty: 1, unit: "u" },
        { name: "Anis étoilé (badiane)", qty: 3, unit: "u" },
        { name: "Bâton de cannelle", qty: 1, unit: "u" },
        { name: "Sauce nuoc-mâm", qty: 3, unit: "c. à soupe" },
        { name: "Sucre", qty: 1, unit: "c. à soupe" },
        { name: "Pousses de soja", qty: 150, unit: "g" },
        { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
        { name: "Citrons verts", qty: 2, unit: "u" },
        { name: "Sriracha (au choix de chacun)", qty: 1, unit: "u" },
      ],
      commisSteps: [
        "Couper l'oignon en deux. Faire griller l'oignon et le gingembre entier sur la flamme du gaz 5 min (ou sous le grill au four 10 min à 230 °C) jusqu'à coloration extérieure noircie.",
        "Dans une grande casserole, verser 2 L d'eau avec les 3 cubes de bouillon. Ajouter oignon et gingembre grillés + anis étoilé + cannelle. Porter à frémissement.",
        "Ajouter le bœuf à mijoter en gros cubes. Couvrir, laisser mijoter 1 h 30 à feu doux. Ajouter nuoc-mâm + sucre. Cuire encore 30 min. Goûter, rectifier.",
        "Sortir le gîte du bouillon, trancher en lamelles fines. Filtrer le bouillon à la passoire (retirer oignon, gingembre, épices). Maintenir à frémissement.",
        "Trancher le faux-filet en lamelles ULTRA-FINES (1-2 mm). Pour faciliter : placer la viande 30 min au congélateur avant de trancher.",
        "Cuire les nouilles 4 min dans l'eau bouillante non salée. Égoutter, répartir dans 4 bols. Ajouter les tranches de gîte cuit + les lamelles de faux-filet cru. Verser le bouillon BRÛLANT par-dessus (cuit la viande crue à point). Garnir de pousses de soja, coriandre, citron vert. Sriracha au choix.",
      ],
      story:
        "Soupe nationale vietnamienne née à Hanoï au début du XXᵉ siècle, le phở est le petit-déjeuner traditionnel du Nord. Son bouillon clair-doré, parfumé à l'anis étoilé et au gingembre torréfié, est le secret de sa profondeur.",
      chefSecret:
        "TORRÉFIER le gingembre et l'oignon ENTIERS directement sur la flamme du gaz jusqu'à ce qu'ils noircissent. Cette caramélisation donne au bouillon sa couleur ambrée et son parfum signature.",
    },

    // === 3. BÁNH MÌ — plat principal =====================================
    {
      slug: "banh-mi",
      title: "Bánh Mì (sandwich vietnamien)",
      image: "/images/banh-mi-vietnam.jpg",
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      diets: ["dairy-free"],
      category: "plat",
      ingredients: [
        { name: "Échine de porc en tranches 1 cm (ou poitrine désossée)", qty: 600, unit: "g" },
        { name: "MARINADE — Sauce soja", qty: 30, unit: "ml" },
        { name: "Sauce nuoc-mâm", qty: 15, unit: "ml" },
        { name: "Miel ou sucre de canne", qty: 20, unit: "g" },
        { name: "Citronnelle hachée fin (partie tendre)", qty: 2, unit: "tiges" },
        { name: "Ail dégermé écrasé", qty: 4, unit: "gousses" },
        { name: "Échalote thaïe hachée fin", qty: 1, unit: "u" },
        { name: "5 épices chinoises", qty: 1, unit: "c. à café" },
        { name: "Huile végétale (marinade)", qty: 30, unit: "ml" },
        { name: "PICKLES — Carottes en julienne 3 mm", qty: 1, unit: "u" },
        { name: "Daikon (radis blanc) en julienne 3 mm", qty: 1, unit: "u" },
        { name: "Vinaigre de riz", qty: 100, unit: "ml" },
        { name: "Sucre (pickles)", qty: 50, unit: "g" },
        { name: "Sel (pickles)", qty: 5, unit: "g" },
        { name: "Baguette tradition française (peu cuite)", qty: 4, unit: "u" },
        { name: "Pâté de campagne français OU pâté chinois", qty: 80, unit: "g" },
        { name: "Mayonnaise", qty: 4, unit: "c. à soupe" },
        { name: "Concombre en bâtonnets", qty: 0.5, unit: "u" },
        { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
        { name: "Piments oiseaux en rondelles", qty: 2, unit: "u" },
        { name: "Sauce soja Maggi pour arroser", qty: 2, unit: "c. à soupe" },
      ],
      steps: [
        "PICKLES (la veille idéal, ou 2 h minimum) : mélanger carotte et daikon en julienne dans un saladier. Saler avec 5 g de sel, masser 2 min, laisser dégorger 15 min, presser pour évacuer l'eau.",
        "Dans une casserole, porter vinaigre de riz + sucre + 100 ml d'eau à frémissement, fouetter jusqu'à dissolution. Verser chaud sur les juliennes, laisser mariner 2 h minimum à T° ambiante.",
        "MARINADE PORC : dans un saladier, mélanger sauce soja + nuoc-mâm + miel + citronnelle + ail + échalote + 5 épices + 30 ml d'huile. Ajouter les tranches de porc, masser, laisser mariner 30 min à 4 h.",
        "Faire chauffer une plancha ou poêle striée à feu vif. Égoutter les tranches de porc, faire griller 3 min par côté jusqu'à coloration caramel-laquée (la marinade au miel caramélise).",
        "Laisser reposer 5 min, trancher en lamelles épaisses de 1 cm contre le sens des fibres.",
        "PRÉPARER LES BAGUETTES : passer brièvement les baguettes 3 min au four à 200 °C pour les réchauffer et raviver la croûte. Fendre en deux dans la longueur sans détacher les deux côtés.",
        "Tartiner un côté intérieur de pâté, l'autre côté de mayonnaise (le pâté + la mayo imperméabilisent la mie contre le jus du porc).",
        "Garnir abondamment : tranches de porc grillé, pickles carotte-daikon (bien essorés), concombre, coriandre en bouquet, rondelles de piment.",
        "Arroser de quelques gouttes de sauce soja Maggi (touche signature vietnamienne).",
        "Refermer en pressant fermement. Couper en deux dans le sens de la largeur si grande baguette. Servir immédiatement (le bánh mì se mange tout de suite, sinon les pickles détrempent le pain).",
      ],
      commisIngredients: [
        { name: "Émincé de porc déjà coupé fin", qty: 500, unit: "g" },
        { name: "Sauce soja", qty: 3, unit: "c. à soupe" },
        { name: "Miel", qty: 1, unit: "c. à soupe" },
        { name: "Ail", qty: 2, unit: "gousses" },
        { name: "5 épices (sachet)", qty: 1, unit: "c. à café" },
        { name: "Huile végétale", qty: 2, unit: "c. à soupe" },
        { name: "PICKLES — Carottes râpées (sachet)", qty: 200, unit: "g" },
        { name: "Vinaigre blanc", qty: 4, unit: "c. à soupe" },
        { name: "Sucre (pickles)", qty: 2, unit: "c. à soupe" },
        { name: "Baguettes", qty: 4, unit: "u" },
        { name: "Mayonnaise", qty: 4, unit: "c. à soupe" },
        { name: "Pâté de campagne", qty: 80, unit: "g" },
        { name: "Concombre", qty: 0.5, unit: "u" },
        { name: "Coriandre fraîche", qty: 1, unit: "bouquet" },
      ],
      commisSteps: [
        "PICKLES EXPRESS : dans un bol, mélanger les carottes râpées + vinaigre blanc + sucre + une pincée de sel. Laisser mariner 15 min minimum (1 h c'est mieux).",
        "MARINADE PORC : mélanger sauce soja + miel + ail écrasé + 5 épices + 1 c.s. d'huile. Ajouter l'émincé de porc, mélanger, laisser mariner 10 min.",
        "Dans une grande poêle, faire chauffer 1 c.s. d'huile à feu vif. Faire sauter le porc 4 min en remuant jusqu'à coloration caramel.",
        "Réchauffer les baguettes 3 min au four à 200 °C. Fendre en deux sans détacher.",
        "Tartiner un côté de pâté, l'autre de mayonnaise. Garnir avec porc grillé + pickles essorés + bâtonnets de concombre + coriandre.",
        "Refermer en pressant. Servir immédiatement (les bánh mì se mangent dans la foulée).",
      ],
      story:
        "Héritage de la colonisation française (la baguette) marié aux saveurs vietnamiennes (porc laqué, pickles, coriandre), le bánh mì est devenu un emblème de la cuisine de rue à Saïgon comme à Hanoï.",
      chefSecret:
        "Tartiner la baguette de mayonnaise sur UN côté intérieur et de pâté sur l'AUTRE : c'est ce qui imperméabilise le pain et l'empêche de se détremper du jus du porc.",
    },

    // === 4. BÚN CHẢ — plat principal =====================================
    {
      slug: "bun-cha",
      title: "Bún Chả (porc grillé et vermicelles)",
      image: "/images/bun-cha-vietnam.jpg",
      prepTime: 30,
      cookTime: 20,
      servings: 4,
      diets: ["dairy-free"],
      category: "plat",
      ingredients: [
        { name: "Échine de porc en tranches 1 cm", qty: 400, unit: "g" },
        { name: "Porc haché à 30% de gras", qty: 300, unit: "g" },
        { name: "MARINADE — Sauce nuoc-mâm", qty: 60, unit: "ml" },
        { name: "Miel ou caramel salé", qty: 40, unit: "g" },
        { name: "Sauce soja", qty: 30, unit: "ml" },
        { name: "Ail dégermé écrasé", qty: 6, unit: "gousses" },
        { name: "Échalote thaïe hachée fin", qty: 2, unit: "u" },
        { name: "Huile d'arachide", qty: 30, unit: "ml" },
        { name: "Poivre noir du moulin", qty: 5, unit: "g" },
        { name: "Sauce huître (boulettes)", qty: 1, unit: "c. à soupe" },
        { name: "BOUILLON TREMPAGE — Sauce nuoc-mâm", qty: 60, unit: "ml" },
        { name: "Sucre (bouillon)", qty: 50, unit: "g" },
        { name: "Jus de citron vert frais", qty: 50, unit: "ml" },
        { name: "Eau tiède (bouillon)", qty: 400, unit: "ml" },
        { name: "Ail écrasé fin (bouillon)", qty: 3, unit: "gousses" },
        { name: "Piments oiseaux en rondelles", qty: 2, unit: "u" },
        { name: "Carottes en très fine julienne", qty: 1, unit: "u" },
        { name: "Vermicelles de riz fins (bún)", qty: 400, unit: "g" },
        { name: "Salade verte croquante (laitue)", qty: 1, unit: "u" },
        { name: "Coriandre, menthe, perilla (lá tía tô)", qty: 1, unit: "bouquet de chaque" },
      ],
      steps: [
        "MARINADE TRANCHES + BOULETTES : dans un saladier, mélanger nuoc-mâm + miel + sauce soja + 4 gousses d'ail écrasées + 1 échalote hachée + 30 ml d'huile + poivre + une pincée de sucre. Diviser en deux.",
        "Mettre les tranches de porc dans la moitié, masser, laisser mariner 2 h à 4 h.",
        "Dans la 2ᵉ moitié, ajouter la sauce huître + 1 échalote + 2 gousses d'ail. Mélanger avec le porc haché. Former 16 boulettes (~20 g chacune), aplatir légèrement en galettes. Réserver au frais.",
        "BOUILLON TREMPAGE : dans un bol, dissoudre le sucre dans l'eau tiède. Ajouter nuoc-mâm + jus de citron + ail extra fin + piment + carotte en julienne. Goûter, équilibrer salé-sucré-acide-piquant. Couvrir, réserver à T° ambiante.",
        "Préparer la table : grande assiette de salades + herbes lavées-essorées, vermicelles cuits égouttés répartis dans 4 bols séparés, baguettes prêtes.",
        "CUISSON DES VERMICELLES : porter une grande casserole d'eau à ébullition non salée. Plonger les vermicelles 3 min, égoutter, rafraîchir IMMÉDIATEMENT à l'eau glacée pour stopper la cuisson (les vermicelles se mangent FROIDS dans le bún chả).",
        "PRÉCHAUFFER LE GRILL CHARBON (idéal) ou plancha-grill fonte à feu vif. Quand les braises sont blanches, déposer tranches de porc et galettes de boulettes côte à côte.",
        "Cuire 3 min par face en arrosant d'un peu de marinade au pinceau (le miel caramélise = laque foncée brillante). Les boulettes prennent 4 min par face, plus épaisses.",
        "ASSEMBLAGE INDIVIDUEL : verser le bouillon trempage tiède dans un grand bol de service. Y déposer 3-4 tranches de porc + 4 boulettes (toutes chaudes). Servir avec assiette d'herbes/salade et bol de vermicelles à part pour chacun.",
        "À MANGER : prélever vermicelles + herbes + porc à la baguette, tremper dans le bouillon, manger immédiatement. Alterner tremper-déguster jusqu'à la fin.",
      ],
      commisIngredients: [
        { name: "Porc haché", qty: 400, unit: "g" },
        { name: "Émincé de porc", qty: 300, unit: "g" },
        { name: "Sauce nuoc-mâm (marinade + bouillon)", qty: 8, unit: "c. à soupe" },
        { name: "Miel", qty: 3, unit: "c. à soupe" },
        { name: "Ail", qty: 5, unit: "gousses" },
        { name: "Sucre", qty: 4, unit: "c. à soupe" },
        { name: "Jus de citron vert (2 citrons)", qty: 4, unit: "c. à soupe" },
        { name: "Eau tiède", qty: 400, unit: "ml" },
        { name: "Sriracha (remplace piment frais)", qty: 1, unit: "c. à soupe" },
        { name: "Vermicelles de riz (rayon Asie)", qty: 400, unit: "g" },
        { name: "Salade verte", qty: 1, unit: "u" },
        { name: "Coriandre + menthe", qty: 1, unit: "bouquet chacun" },
        { name: "Carotte (pour le bouillon)", qty: 1, unit: "u" },
      ],
      commisSteps: [
        "MARINADE : mélanger 4 c.s. nuoc-mâm + 3 c.s. miel + 3 gousses d'ail écrasées dans un saladier. Diviser en deux. Mettre les tranches de porc dans une moitié, le porc haché dans l'autre. Former 12 boulettes plates avec le porc haché. Laisser mariner 30 min minimum.",
        "BOUILLON TREMPAGE : dans un grand bol, dissoudre 4 c.s. de sucre dans 400 ml d'eau tiède. Ajouter 4 c.s. nuoc-mâm + 4 c.s. jus de citron + 2 gousses d'ail écrasées + 1 c.s. Sriracha + carotte râpée. Goûter, équilibrer.",
        "Cuire les vermicelles 3 min dans l'eau bouillante non salée. Égoutter, rafraîchir à l'eau glacée. Répartir dans 4 bols.",
        "Faire chauffer une plancha ou grande poêle à feu vif. Faire griller tranches de porc + boulettes 3 min par face jusqu'à coloration caramel.",
        "Pour chaque convive : grand bol avec une part de bouillon tiède. Ajouter 3-4 tranches de porc et 3 boulettes chaudes.",
        "Servir avec assiette de salade + herbes, bol de vermicelles à part. Manger en trempant vermicelles + herbes + porc dans le bouillon.",
      ],
      story:
        "Spécialité hanoïenne immortalisée par le déjeuner d'Anthony Bourdain et Barack Obama en 2016. Boulettes et tranches de porc grillé au charbon, vermicelles de riz froids, bol de bouillon tiède aigre-doux-pimenté — c'est un puzzle gustatif à assembler dans le bol.",
      chefSecret:
        "Le grillage AU CHARBON DE BOIS est non négociable pour les puristes : la fumée caramélise le miel de la marinade et donne le parfum signature.",
    },

    // === 5. CHÈ CHUỐI — dessert ==========================================
    {
      slug: "che-chuoi",
      title: "Chè Chuối (banane au lait de coco)",
      image: "/images/che-chuoi-vietnam.jpg",
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      diets: ["vegan", "gluten-free", "dairy-free"],
      category: "dessert",
      ingredients: [
        { name: "Bananes mûres mais fermes (Cavendish ou plantains semi-mûres)", qty: 6, unit: "u" },
        { name: "Lait de coco entier", qty: 600, unit: "ml" },
        { name: "Perles de tapioca (petites, blanches)", qty: 80, unit: "g" },
        { name: "Sucre de palme thaï (jaggery) ou sucre roux", qty: 80, unit: "g" },
        { name: "Sel fin", qty: 1, unit: "pincée" },
        { name: "Feuille de pandanus nouée (optionnel)", qty: 1, unit: "u" },
        { name: "Cacahuètes torréfiées concassées (finition)", qty: 50, unit: "g" },
        { name: "Graines de sésame blanches torréfiées (finition)", qty: 1, unit: "c. à soupe" },
        { name: "Maïzena (épaississant)", qty: 1, unit: "c. à café" },
      ],
      steps: [
        "Faire tremper les perles de tapioca dans un bol d'eau froide 15 min (elles vont gonfler). Égoutter, rincer.",
        "Faire bouillir une casserole d'eau, plonger les perles 8 min jusqu'à ce qu'elles deviennent transparentes au centre. Égoutter, rafraîchir à l'eau froide pour stopper la cuisson. Réserver.",
        "Pendant ce temps, peler les bananes et les couper en biais en tronçons de 4 cm (les coupes biaisées présentent mieux à l'assiette).",
        "Dans une casserole large à fond épais, verser le lait de coco + sucre de palme + pincée de sel + feuille de pandanus (si utilisée). Chauffer doucement à feu moyen en remuant jusqu'à dissolution complète du sucre. JAMAIS bouillir (le lait de coco se sépare en huile + solides).",
        "Quand le lait frémit doucement, ajouter les tronçons de banane. Pocher 5 min à feu très doux en retournant délicatement à mi-cuisson (les bananes deviennent tendres mais doivent garder leur forme).",
        "Ajouter les perles de tapioca pré-cuites. Diluer la maïzena dans 2 c.s. d'eau froide, verser dans la casserole en remuant doucement. Cuire 2 min jusqu'à léger épaississement (texture nappante).",
        "Servir tiède dans des bols individuels. Parsemer généreusement de cacahuètes concassées et de graines de sésame torréfiées. La chaleur résiduelle finit de marier les saveurs.",
      ],
      commisIngredients: [
        { name: "Bananes mûres mais fermes", qty: 5, unit: "u" },
        { name: "Lait de coco entier (boîte 400 ml)", qty: 400, unit: "ml" },
        { name: "Perles de tapioca (rayon Asie ou bio)", qty: 60, unit: "g" },
        { name: "Sucre roux", qty: 60, unit: "g" },
        { name: "Sel fin", qty: 1, unit: "pincée" },
        { name: "Cacahuètes salées concassées (finition)", qty: 50, unit: "g" },
      ],
      commisSteps: [
        "Faire tremper les perles de tapioca dans un bol d'eau froide 10 min. Égoutter.",
        "Plonger les perles dans une casserole d'eau bouillante 7 min jusqu'à transparence. Égoutter, rincer à l'eau froide.",
        "Peler les bananes, couper en biais en tronçons de 3-4 cm.",
        "Dans une casserole, verser le lait de coco + sucre roux + pincée de sel. Chauffer à feu doux en remuant jusqu'à dissolution du sucre. JAMAIS bouillir.",
        "Ajouter les bananes, pocher 5 min à feu très doux. Ajouter les perles de tapioca, mélanger doucement. Servir tiède dans des bols, parsemer de cacahuètes concassées.",
      ],
      story:
        "Dessert chaud-tiède du Sud-Vietnam, le chè chuối marie des bananes mûres dans une crème de coco onctueuse parfumée au tapioca. Servi en fin de repas ou comme goûter dans les rues de Hô Chi Minh-Ville.",
      chefSecret:
        "Choisir des bananes MÛRES MAIS FERMES (peau jaune avec quelques points bruns). Trop mûres elles se désintègrent dans le sirop, pas assez elles restent amères et farineuses.",
    },
  ],
};

// === Génération des fichiers ==============================================
const out1 = join(COUNTRIES_DIR, "senegal.json");
const out2 = join(COUNTRIES_DIR, "vietnam.json");
writeFileSync(out1, JSON.stringify(SENEGAL, null, 2) + "\n", "utf8");
writeFileSync(out2, JSON.stringify(VIETNAM, null, 2) + "\n", "utf8");
console.log(`✓ ${SENEGAL.slug}.json créé (${SENEGAL.recipes.length} recettes)`);
console.log(`✓ ${VIETNAM.slug}.json créé (${VIETNAM.recipes.length} recettes)`);

// === Régénération data/index.json =========================================
const allCountries = [];
for (const file of readdirSync(COUNTRIES_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  allCountries.push(JSON.parse(readFileSync(join(COUNTRIES_DIR, file), "utf8")));
}

const index = {
  countries: allCountries.map((c) => ({
    slug: c.slug,
    name: c.name,
    iso3: c.iso3,
    isoNumeric: c.isoNumeric,
    flag: c.flag,
    intro: c.intro,
    tagline: c.tagline,
    recipeSlugs: c.recipes.map((r) => r.slug),
  })),
  recipes: allCountries.flatMap((c) =>
    c.recipes.map((r) => ({
      countrySlug: c.slug,
      slug: r.slug,
      title: r.title,
      image: r.image,
      prepTime: r.prepTime,
      cookTime: r.cookTime,
      servings: r.servings,
      diets: r.diets,
      category: r.category,
      seasons: r.seasons ?? [],
      events: r.events ?? [],
      ingredientNames: Array.from(
        new Set(
          [
            ...r.ingredients.map((i) => i.name),
            ...(r.commisIngredients || []).map((i) => i.name),
          ].map((n) => n.trim())
        )
      ),
    }))
  ),
};

writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(
  `\n✓ data/index.json régénéré : ${index.recipes.length} recettes / ${index.countries.length} pays`
);

export type Diet = "vegan" | "vegetarian" | "gluten-free" | "dairy-free";

export type Season = "winter" | "spring" | "summer" | "autumn";

/**
 * Catégorie culinaire — utilisée pour le tri et le regroupement sur la page
 * /parcourir (v2.4). Chaque recette appartient à UNE catégorie.
 *   • entree   — soupes, salades, mezze, finger food, dim sum
 *   • plat     — plats principaux (chauds ou froids)
 *   • dessert  — pâtisseries, fruits préparés, douceurs sucrées
 *   • boisson  — thés, infusions, cocktails non-alcoolisés
 */
export type RecipeCategory = "entree" | "plat" | "dessert" | "boisson";

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  entree: "Entrées",
  plat: "Plats principaux",
  dessert: "Desserts",
  boisson: "Boissons",
};

/** Ordre de tri canonique des catégories (séquence d'un repas complet). */
export const RECIPE_CATEGORY_ORDER: RecipeCategory[] = [
  "entree",
  "plat",
  "dessert",
  "boisson",
];

export type CulturalEvent =
  | "chinese-new-year"
  | "ramadan-end"
  | "cinco-de-mayo"
  | "ferragosto"
  | "diwali"
  | "christmas"
  | "easter"
  | "bastille-day"
  | "carnaval"
  | "songkran"
  | "orthodox-easter"
  // Nouveaux events v2.2 — couverture culturelle complète de tous les pays
  | "holi" // Inde, fête des couleurs, mars
  | "dia-de-los-muertos" // Mexique, 1-2 novembre
  | "hanami"; // Japon, contemplation cerisiers en fleurs, fin mars/début avril

export type Ingredient = {
  name: string;
  qty: number;
  unit: string;
};

export type Recipe = {
  slug: string;
  title: string;
  image: string;
  prepTime: number;
  cookTime: number;
  /**
   * Temps en mode Commis (raccourcis : pas de marinade longue, ingrédients
   * supermarché, étapes simplifiées). Optionnels — l'UI retombe sur
   * prepTime/cookTime si absents.
   */
  commisPrepTime?: number;
  commisCookTime?: number;
  servings: number;
  diets: Diet[];
  /**
   * Catégorie culinaire (entrée, plat, dessert, boisson) — utilisée pour le
   * regroupement sur /parcourir. Champ requis depuis v2.4.
   */
  category: RecipeCategory;
  seasons?: Season[];
  events?: CulturalEvent[];
  /**
   * Ingrédients de la version "Chef culinaire" (niche, AOP, techniques pro).
   * C'est la version par défaut — toujours présente.
   */
  ingredients: Ingredient[];
  /**
   * Étapes complètes "Chef culinaire" — techniques, jargons, précisions pro.
   */
  steps: string[];
  /**
   * Ingrédients "Commis de cuisine" — alternatives supermarché classiques
   * (ex: guanciale → lardons fumés, pecorino DOP → parmesan, mascarpone
   * italien → mascarpone du frigo). Optionnel : si absent, le toggle
   * Commis affiche les ingrédients Chef en repli.
   *
   * Note : depuis la migration des recettes (lots 1-10), TOUTES les
   * recettes existantes ont leur variante Commis. Le champ reste optionnel
   * pour permettre l'ajout futur de recettes "Chef-only" sans variante.
   */
  commisIngredients?: Ingredient[];
  /**
   * Étapes "Commis de cuisine" — cuissons rapides, mots du quotidien,
   * pas de matériel exotique. Repli sur `steps` si absent (cohérent
   * avec `commisIngredients`).
   */
  commisSteps?: string[];
  story?: string;
  /** Tip professionnel — temp. d'huile, technique précise, astuce de dressage. */
  chefSecret?: string;
};

export type Country = {
  slug: string;
  name: string;
  iso3: string;
  isoNumeric: string;
  flag: string;
  intro: string;
  /**
   * Slogan court (4-7 mots) affiché sous le nom du pays dans la grille
   * d'accueil. Style "carnet de voyage" : poétique, évocateur, élégant.
   */
  tagline?: string;
  recipes: Recipe[];
};

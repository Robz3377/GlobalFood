export type Diet = "vegan" | "vegetarian" | "gluten-free" | "dairy-free";

export type Season = "winter" | "spring" | "summer" | "autumn";

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
  | "orthodox-easter";

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
  servings: number;
  diets: Diet[];
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
   * italien → mascarpone du frigo). Optionnel : si absent, le toggle Commis
   * affiche les ingrédients Chef en repli.
   */
  commisIngredients?: Ingredient[];
  /**
   * Étapes "Commis de cuisine" — cuissons rapides, mots du quotidien, pas
   * de matériel exotique. Optionnel : repli sur `simplifiedSteps` puis sur
   * `steps` si absent.
   */
  commisSteps?: string[];
  /**
   * @deprecated Champ legacy "Mode Famille" — version vulgarisée des steps
   * Pro (mêmes ingrédients, langage simple). Utilisé comme fallback pour
   * le mode Commis tant que `commisSteps` n'est pas rédigé. À supprimer
   * une fois les 10 lots de migration terminés.
   */
  simplifiedSteps?: string[];
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

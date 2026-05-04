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
  ingredients: Ingredient[];
  steps: string[];
  story?: string;
};

export type Country = {
  slug: string;
  name: string;
  iso3: string;
  isoNumeric: string;
  flag: string;
  intro: string;
  recipes: Recipe[];
};

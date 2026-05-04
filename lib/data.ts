import data from "@/data/data.json";
import type { Country, Recipe } from "./types";

const countries = data.countries as Country[];

export function getAllCountries(): Country[] {
  return countries;
}

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find((c) => c.slug === slug);
}

export function getCountryByIso3(iso3: string): Country | undefined {
  return countries.find((c) => c.iso3 === iso3);
}

export function getCountryByIsoNumeric(id: string): Country | undefined {
  return countries.find((c) => c.isoNumeric === id);
}

export function getRecipe(countrySlug: string, recipeSlug: string): {
  country: Country;
  recipe: Recipe;
} | undefined {
  const country = getCountryBySlug(countrySlug);
  if (!country) return undefined;
  const recipe = country.recipes.find((r) => r.slug === recipeSlug);
  if (!recipe) return undefined;
  return { country, recipe };
}

export function getAllRecipes(): { country: Country; recipe: Recipe }[] {
  return countries.flatMap((country) =>
    country.recipes.map((recipe) => ({ country, recipe }))
  );
}

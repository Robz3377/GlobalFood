import type { Country, Recipe } from "./types";
import { getActiveEvents, getISOWeek, getSeason } from "./seasons";

export type Recommendation = {
  country: Country;
  recipe: Recipe;
  score: number;
  reasons: string[];
};

type ScoreCtx = {
  date: Date;
  visitedCountries: Set<string>;
  visitedRecipes: Set<string>;
};

function score(
  recipe: Recipe,
  country: Country,
  ctx: ScoreCtx
): { score: number; reasons: string[] } {
  let total = 1;
  const reasons: string[] = [];

  const season = getSeason(ctx.date);
  if (recipe.seasons?.includes(season)) {
    total += 3;
    reasons.push(`Plat de ${labelSeason(season)}`);
  }

  const active = getActiveEvents(ctx.date);
  for (const event of active) {
    if (recipe.events?.includes(event.id)) {
      total += 6 + Math.max(0, 5 - Math.abs(event.daysAway));
      reasons.push(
        event.daysAway === 0
          ? `${event.label} aujourd'hui`
          : event.daysAway > 0
          ? `${event.label} dans ${event.daysAway} j`
          : `${event.label} il y a ${Math.abs(event.daysAway)} j`
      );
    }
  }

  // Already visited a recipe of this country → push the *other* recipes
  if (
    ctx.visitedCountries.has(country.slug) &&
    !ctx.visitedRecipes.has(`${country.slug}/${recipe.slug}`)
  ) {
    total += 2;
    reasons.push(`Vous avez aimé ${country.name}`);
  }

  // Stable per-week jitter so the order doesn't change every reload
  const week = getISOWeek(ctx.date);
  const seed = hash(`${week}:${country.slug}:${recipe.slug}`);
  total += (seed % 100) / 200;

  return { score: total, reasons };
}

function hash(s: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return Math.abs(h);
}

function labelSeason(s: ReturnType<typeof getSeason>): string {
  return { winter: "saison froide", spring: "printemps", summer: "été", autumn: "automne" }[s];
}

export function getRecommendations({
  recipes,
  date = new Date(),
  visitedCountries = [],
  visitedRecipes = [],
  count = 3,
}: {
  recipes: { country: Country; recipe: Recipe }[];
  date?: Date;
  visitedCountries?: string[];
  visitedRecipes?: string[];
  count?: number;
}): Recommendation[] {
  const ctx: ScoreCtx = {
    date,
    visitedCountries: new Set(visitedCountries),
    visitedRecipes: new Set(visitedRecipes),
  };

  const ranked = recipes
    .map(({ country, recipe }) => ({
      country,
      recipe,
      ...score(recipe, country, ctx),
    }))
    .sort((a, b) => b.score - a.score);

  // Pick top `count` while preferring distinct countries
  const seen = new Set<string>();
  const result: Recommendation[] = [];
  for (const r of ranked) {
    if (seen.has(r.country.slug)) continue;
    result.push(r);
    seen.add(r.country.slug);
    if (result.length >= count) break;
  }
  // Fill with remaining if we couldn't reach count with distinct countries
  if (result.length < count) {
    for (const r of ranked) {
      if (result.includes(r)) continue;
      result.push(r);
      if (result.length >= count) break;
    }
  }

  return result;
}

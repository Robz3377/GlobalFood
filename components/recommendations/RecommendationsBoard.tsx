"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useHistory } from "@/lib/hooks/useHistory";
import {
  getRecommendations,
  type Recommendation,
} from "@/lib/recommendations";
import {
  SEASON_LABELS,
  getActiveEvents,
  getSeason,
} from "@/lib/seasons";
import type { CountryIndex, RecipeIndex } from "@/lib/types-index";

type Props = {
  recipes: RecipeIndex[];
  countries: CountryIndex[];
};

export function RecommendationsBoard({ recipes, countries }: Props) {
  const { history, hydrated } = useHistory();
  // Force a stable date for the algo (today). Memoised to keep results steady.
  const today = useMemo(() => new Date(), []);
  const season = getSeason(today);
  const events = getActiveEvents(today);

  const visitedCountries = useMemo(
    () => Array.from(new Set(history.map((h) => h.countrySlug))),
    [history]
  );
  const visitedRecipes = useMemo(
    () =>
      history
        .filter((h) => h.recipeSlug)
        .map((h) => `${h.countrySlug}/${h.recipeSlug}`),
    [history]
  );

  const recos = useMemo(
    () =>
      getRecommendations({
        recipes,
        countries,
        date: today,
        visitedCountries,
        visitedRecipes,
        count: 3,
      }),
    [recipes, countries, today, visitedCountries, visitedRecipes]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-soft-lg bg-paper-card p-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <span className="inline-flex items-center gap-2 text-ink-soft">
          <Calendar className="h-4 w-4" strokeWidth={1.75} />
          Saison : <strong className="text-ink">{SEASON_LABELS[season]}</strong>
        </span>
        {events.length > 0 ? (
          <span className="inline-flex items-center gap-2 text-ink-soft">
            <Sparkles className="h-4 w-4 text-terracotta" strokeWidth={1.75} />
            <span>
              Événement :{" "}
              <strong className="text-ink">{events[0].label}</strong>{" "}
              <span className="text-ink-soft">
                ({events[0].daysAway === 0
                  ? "aujourd'hui"
                  : events[0].daysAway > 0
                  ? `dans ${events[0].daysAway} j`
                  : `il y a ${Math.abs(events[0].daysAway)} j`})
              </span>
            </span>
          </span>
        ) : (
          <span className="text-ink-soft">Aucun événement culturel proche.</span>
        )}
        <span className="ml-auto text-ink-soft">
          {hydrated && visitedCountries.length > 0
            ? `${visitedCountries.length} pays visité${
                visitedCountries.length > 1 ? "s" : ""
              } pris en compte`
            : "Visitez des recettes pour personnaliser vos suggestions"}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {recos.map((reco, i) => (
          <RecoCard key={`${reco.country.slug}-${reco.recipe.slug}`} reco={reco} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function RecoCard({ reco, rank }: { reco: Recommendation; rank: number }) {
  const { country, recipe, reasons } = reco;
  return (
    <Link
      href={`/pays/${country.slug}/${recipe.slug}`}
      className="group relative flex flex-col rounded-soft-lg bg-paper-card overflow-hidden hover:shadow-warm hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          aria-hidden
          className="absolute top-3 left-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-bone font-serif font-semibold shadow-soft"
        >
          {rank}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-bone/95 backdrop-blur px-2.5 py-1 text-xs font-medium shadow-soft">
          <span aria-hidden>{country.flag}</span>
          {country.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-semibold leading-tight">
          {recipe.title}
        </h3>
        {reasons.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i}>
                <Badge tone={i === 0 ? "terracotta" : "sage"}>{r}</Badge>
              </li>
            ))}
          </ul>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-2 text-terracotta text-sm font-medium">
          Voir la recette
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

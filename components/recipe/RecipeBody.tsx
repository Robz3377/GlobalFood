"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Flame, Minus, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { RecipeIngredients } from "./RecipeIngredients";
import { StepList } from "./StepList";
import type { Country, Recipe } from "@/lib/types";

const SERVINGS_MIN = 1;
const SERVINGS_MAX = 12;

const dietLabels: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Végétarien",
  "gluten-free": "Sans gluten",
  "dairy-free": "Sans lactose",
};

type Props = {
  country: Country;
  recipe: Recipe;
};

/**
 * RecipeBody — Client Component qui possède l'état partagé `servings`.
 *
 * Conception :
 * - Le hero (image + lien retour) reste rendu par la page server pour LCP.
 * - Ici, on rend le titre + sticky info bar (avec contrôle portions interactif)
 *   + story/chefSecret + ingrédients (mode contrôlé) + étapes.
 * - Une seule source de vérité pour les portions = state local de ce composant,
 *   propagé en prop à RecipeIngredients.
 */
export function RecipeBody({ country, recipe }: Props) {
  const baseline = recipe.servings;
  const [servings, setServings] = useState<number>(baseline);
  const totalTime = recipe.prepTime + recipe.cookTime;

  function dec() {
    setServings((v) => Math.max(SERVINGS_MIN, v - 1));
  }
  function inc() {
    setServings((v) => Math.min(SERVINGS_MAX, v + 1));
  }

  return (
    <>
      {/* TITRE — débordant le hero, façon magazine, avec badge pays intégré */}
      <section className="relative -mt-12 md:-mt-16 mx-auto max-w-3xl px-4 md:px-6">
        <div className="rounded-soft-xl bg-bone shadow-paper p-6 md:p-10 border border-bone-deep/60">
          {/* Badge pays — clickable, retour au pays */}
          <Link
            href={`/pays/${country.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-bone-deep px-3.5 py-1.5 text-sm font-medium hover:bg-ochre-soft/60 active:scale-95 transition-all duration-200"
          >
            <span aria-hidden className="text-lg leading-none">
              {country.flag}
            </span>
            <span className="text-ink">{country.name}</span>
          </Link>
          <p className="font-serif italic text-sm text-ink-soft mt-3 mb-2">
            Cuisine {country.name.toLowerCase()}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            {recipe.title}
          </h1>
          {recipe.diets.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {recipe.diets.map((d) => (
                <Badge key={d} tone="sage">
                  {dietLabels[d] ?? d}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STICKY INFO BAR — interactive : prép / cuisson / portions ± */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+4rem)] z-20 mt-6 md:mt-8">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="grid grid-cols-3 items-center gap-1 rounded-full bg-white/95 backdrop-blur shadow-warm p-1.5 border border-bone-deep">
            <StickyStat icon={Clock} label="Prép." value={`${recipe.prepTime}'`} />
            <StickyStat icon={Flame} label="Cuisson" value={`${recipe.cookTime}'`} />
            <PortionsControl
              value={servings}
              baseline={baseline}
              onDec={dec}
              onInc={inc}
            />
          </div>
          {totalTime >= 60 && (
            <p className="mt-2 text-center text-xs text-ink-soft">
              Temps total ≈{" "}
              <strong className="font-medium text-ink">
                {Math.floor(totalTime / 60)}h
                {(totalTime % 60).toString().padStart(2, "0")}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* STORY + SECRET DU CHEF */}
      {(recipe.story || recipe.chefSecret) && (
        <section className="mx-auto max-w-3xl px-4 md:px-6 mt-8 space-y-3">
          {recipe.story && (
            <article className="rounded-soft-lg bg-ochre-soft/30 border-l-4 border-ochre p-5 md:p-6">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.15em] text-ochre">
                L'histoire
              </h2>
              <p className="mt-2 text-ink leading-relaxed text-base md:text-lg">
                {recipe.story}
              </p>
            </article>
          )}
          {recipe.chefSecret && (
            <article className="rounded-soft-lg bg-terracotta/10 border-l-4 border-terracotta p-5 md:p-6">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.15em] text-terracotta-deep">
                Le secret du Chef
              </h2>
              <p className="mt-2 text-ink leading-relaxed text-base md:text-lg">
                {recipe.chefSecret}
              </p>
            </article>
          )}
        </section>
      )}

      {/* INGRÉDIENTS — accordéon mobile, déplié desktop, servings contrôlé */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 mt-10 md:mt-14">
        <RecipeIngredients
          ingredients={recipe.ingredients}
          servings={servings}
          baseline={baseline}
          collapsible
        />
      </section>

      {/* PRÉPARATION — magazine style avec drop-cap serif italique */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 mt-10 md:mt-14 pb-24">
        <header className="mb-6 md:mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            Préparation
          </h2>
          <span className="font-serif italic text-sm text-ink-soft">
            {recipe.steps.length} étapes
          </span>
        </header>
        <StepList steps={recipe.steps} />
      </section>
    </>
  );
}

function StickyStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-2 py-2 min-w-0">
      <Icon
        className="h-4 w-4 shrink-0 text-ink-soft"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-ink-soft leading-none">
          {label}
        </div>
        <div className="font-serif text-base md:text-lg font-semibold leading-tight tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

function PortionsControl({
  value,
  baseline,
  onDec,
  onInc,
}: {
  value: number;
  baseline: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const dirty = value !== baseline;
  return (
    <div className="flex items-center justify-center gap-0.5 px-1 py-1 min-w-0">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= SERVINGS_MIN}
        aria-label="Diminuer les portions"
        className={clsx(
          "h-11 w-11 inline-flex items-center justify-center rounded-full transition-all active:scale-90",
          value > SERVINGS_MIN
            ? "text-ink hover:bg-bone-deep"
            : "text-ink-soft/30 cursor-not-allowed"
        )}
      >
        <Minus className="h-4 w-4" strokeWidth={2.25} />
      </button>
      <div className="min-w-0 px-1 text-center">
        <div className="text-[10px] uppercase tracking-wider text-ink-soft leading-none">
          {dirty ? (
            <span className="inline-flex items-center gap-1">
              Portions
              <span className="text-terracotta">●</span>
            </span>
          ) : (
            "Portions"
          )}
        </div>
        <div
          className="font-serif text-base md:text-lg font-semibold leading-tight tabular-nums"
          aria-live="polite"
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= SERVINGS_MAX}
        aria-label="Augmenter les portions"
        className={clsx(
          "h-11 w-11 inline-flex items-center justify-center rounded-full transition-all active:scale-90",
          value < SERVINGS_MAX
            ? "text-ink hover:bg-bone-deep"
            : "text-ink-soft/30 cursor-not-allowed"
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}

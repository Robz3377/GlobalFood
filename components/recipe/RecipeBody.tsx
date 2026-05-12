"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChefHat, ChevronDown, Clock, Flame, Minus, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { RecipeIngredients } from "./RecipeIngredients";
import { StepList } from "./StepList";
import { StepsModeToggle, type StepsMode } from "./StepsModeToggle";
import type { Country, Recipe } from "@/lib/types";

const STEPS_MODE_KEY = "mapandfork.steps-mode";
const STEPS_MODE_LEGACY_KEY = "global-food.steps-mode";

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
  const hasFamilyMode =
    Array.isArray(recipe.simplifiedSteps) && recipe.simplifiedSteps.length > 0;
  // Préférence Pro/Famille persistée en localStorage (avec migration legacy).
  // Si la recette n'a pas de version simplifiée, on force "pro".
  const [storedMode, setStoredMode] = useLocalStorage<StepsMode>(
    STEPS_MODE_KEY,
    "pro",
    STEPS_MODE_LEGACY_KEY
  );
  const mode: StepsMode = hasFamilyMode ? storedMode : "pro";
  const activeSteps =
    mode === "family" && recipe.simplifiedSteps
      ? recipe.simplifiedSteps
      : recipe.steps;

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

      {/* STORY + SECRET DU CHEF — accordéons fermés par défaut.
          Focus immédiat sur Ingrédients + Étapes au scroll. */}
      {(recipe.story || recipe.chefSecret) && (
        <section className="mx-auto max-w-3xl px-4 md:px-6 mt-8 space-y-3">
          {recipe.story && (
            <Accordion
              tone="ochre"
              icon={BookOpen}
              label="L'histoire"
              text={recipe.story}
            />
          )}
          {recipe.chefSecret && (
            <Accordion
              tone="terracotta"
              icon={ChefHat}
              label="Le secret du Chef"
              text={recipe.chefSecret}
            />
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
        <header className="mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Préparation
            </h2>
            <span className="font-serif italic text-sm text-ink-soft">
              {activeSteps.length} étapes
            </span>
          </div>
          {hasFamilyMode && (
            <StepsModeToggle mode={mode} onChange={setStoredMode} />
          )}
        </header>
        <StepList steps={activeSteps} />
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

/**
 * Accordion inline (Histoire / Secret du Chef).
 *
 * Slide-down fluide via la "CSS grid trick" :
 * - Container parent : `grid-template-rows: 0fr` ou `1fr` avec transition
 * - Enfant : `overflow: hidden`
 * Le navigateur anime nativement la transition entre 0fr et 1fr, ce qui
 * équivaut à animer de height: 0 à height: auto (impossible historiquement
 * en CSS pur). Supporté Chrome 117+, Safari 17+, Firefox 122+.
 *
 * Bénéfices vs `<details>` natif :
 * - Ouverture/fermeture FLUIDE (300ms ease-soft, pas abrupte)
 * - ChevronDown qui pivote en douceur
 * - Contrôle total du styling tonal (ochre vs terracotta)
 */
function Accordion({
  tone,
  icon: Icon,
  label,
  text,
}: {
  tone: "ochre" | "terracotta";
  icon: typeof Clock;
  label: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const isOchre = tone === "ochre";
  return (
    <article
      className={clsx(
        "rounded-soft-lg border-l-4 overflow-hidden",
        isOchre
          ? "bg-ochre-soft/30 border-ochre"
          : "bg-terracotta/10 border-terracotta"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 md:px-6 py-3.5 md:py-4 text-left transition-colors hover:bg-black/[0.02] active:bg-black/[0.04]"
      >
        <span className="flex items-center gap-3">
          <Icon
            className={clsx(
              "h-4 w-4 shrink-0",
              isOchre ? "text-ochre" : "text-terracotta-deep"
            )}
            strokeWidth={2}
            aria-hidden
          />
          <h2
            className={clsx(
              "font-serif text-sm font-semibold uppercase tracking-[0.15em]",
              isOchre ? "text-ochre" : "text-terracotta-deep"
            )}
          >
            {label}
          </h2>
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 transition-transform duration-300 ease-out",
            isOchre ? "text-ochre" : "text-terracotta-deep",
            open && "rotate-180"
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {/* Grid trick pour slide-down fluide (0fr ↔ 1fr) */}
      <div
        className={clsx(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <p className="px-5 md:px-6 pb-4 md:pb-5 text-ink leading-relaxed text-base md:text-lg">
            {text}
          </p>
        </div>
      </div>
    </article>
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

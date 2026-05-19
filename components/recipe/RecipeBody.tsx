"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  ChevronDown,
  Clock,
  Flame,
  ListChecks,
  Minus,
  Plus,
  ShoppingBasket,
} from "lucide-react";
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

/**
 * Étapes du parcours séquentiel sur la page recette (recettes ayant la
 * variante Commis) :
 * - 0 : choix de la brigade. Ingrédients + préparation masqués.
 * - 1 : ingrédients révélés. Préparation masquée.
 * - 2 : préparation révélée. Tout le contenu est visible.
 *
 * Les recettes sans variante Commis sautent ce parcours (rendu legacy
 * direct, identique à avant).
 */
type FlowStep = 0 | 1 | 2;

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
  // Toggle Brigade disponible si la recette a la variante Commis.
  // Depuis la migration des recettes (lots 1-10), toutes les recettes
  // existantes ont commisSteps. Le champ reste optionnel pour permettre
  // d'ajouter des recettes "Chef-only" sans variante Commis dans le futur.
  const hasCommisMode =
    Array.isArray(recipe.commisSteps) && recipe.commisSteps.length > 0;
  // Préférence Brigade persistée en localStorage. Le stockage migre depuis
  // les anciennes valeurs Pro/Famille (cf. readBrigadeMode).
  const [storedMode, setStoredMode] = useLocalStorage<StepsMode>(
    STEPS_MODE_KEY,
    "chef",
    STEPS_MODE_LEGACY_KEY
  );
  // Migration silencieuse pour les anciens utilisateurs qui ont "pro"/"family"
  const migratedMode: StepsMode =
    (storedMode as string) === "pro"
      ? "chef"
      : (storedMode as string) === "family"
      ? "commis"
      : storedMode;
  const mode: StepsMode = hasCommisMode ? migratedMode : "chef";
  // Sélection des étapes : chef → steps. commis → commisSteps si présent,
  // sinon repli sur steps (sécurité — ne devrait pas arriver tant que
  // hasCommisMode gate l'accès au mode commis).
  const activeSteps =
    mode === "commis"
      ? recipe.commisSteps ?? recipe.steps
      : recipe.steps;
  // Sélection des ingrédients : commis → commisIngredients si présent,
  // sinon repli sur les ingrédients Chef (transition de schéma).
  const activeIngredients =
    mode === "commis"
      ? recipe.commisIngredients ?? recipe.ingredients
      : recipe.ingredients;

  // Parcours séquentiel — l'état est désormais PERSISTÉ en localStorage
  // (clé globale, pas par recette). Un utilisateur qui a déjà validé son
  // mode sur n'importe quelle recette retombe directement à l'étape où il
  // s'était arrêté la dernière fois. La friction "re-cliquer à chaque
  // visite" devient inexistante pour les utilisateurs récurrents.
  // Pour les recettes sans variante Commis, on force step=2 (tout visible)
  // indépendamment de ce qui est stocké.
  const [storedStep, setStoredStep] = useLocalStorage<FlowStep>(
    "mapandfork.recipe-flow-step",
    hasCommisMode ? 0 : 2
  );
  const step: FlowStep = hasCommisMode ? storedStep : 2;
  const setStep = setStoredStep;
  const ingredientsRevealed = step >= 1;
  const stepsRevealed = step >= 2;

  function dec() {
    setServings((v) => Math.max(SERVINGS_MIN, v - 1));
  }
  function inc() {
    setServings((v) => Math.min(SERVINGS_MAX, v + 1));
  }

  // === STICKY HEADER DYNAMIQUE ===
  // Le sticky bar (Prép./Cuisson/Portions) reste en place ; quand le titre
  // h1 sort de la vue (l'utilisateur a scrollé au-delà de la carte titre),
  // on swap son contenu pour afficher le NOM DE LA RECETTE à la place. Ça
  // donne un contexte permanent sur mobile sans gaspiller de surface.
  // Implémentation IntersectionObserver : zéro re-render par scroll.
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [titleInView, setTitleInView] = useState(true);
  useEffect(() => {
    const el = titleRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setTitleInView(entry.isIntersecting),
      // rootMargin top négatif = on considère le titre "sorti" dès qu'il
      // passe sous la sticky bar (~ 64px header + 60px sticky bar).
      { rootMargin: "-130px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
          <h1
            ref={titleRef}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
          >
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

      {/* STICKY INFO BAR — DYNAMIQUE selon la position de scroll :
          • Quand le titre h1 est visible (haut de page) → bar large avec
            Prép. / Cuisson uniquement (les portions ne sont plus dans le
            sticky depuis v2.3, elles ont été déplacées en tête de la
            section Ingrédients qui est leur cible logique).
          • Quand le titre est sorti (scroll vers ingrédients/étapes) → bar
            ULTRA-COMPACTE : drapeau + nom de la recette, point. Libère un
            maximum de surface de lecture sur mobile. */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+4rem)] z-20 mt-6 md:mt-8">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div
            className={clsx(
              "relative bg-white/95 backdrop-blur shadow-warm border border-bone-deep overflow-hidden transition-all duration-300 ease-out",
              // En mode large : pill arrondi (rounded-full) pour le look
              // info-bar élégant. En mode compact : rounded-2xl pour
              // accueillir proprement la vignette horizontale (rectangle
              // ne va pas avec un pill complet).
              titleInView ? "rounded-full p-1.5" : "rounded-2xl p-1.5"
            )}
          >
            {titleInView ? (
              // MODE LARGE — page haute, focus sur les meta lecture.
              <div className="grid grid-cols-2 items-center gap-1">
                <StickyStat icon={Clock} label="Prép." value={`${recipe.prepTime}'`} />
                <StickyStat icon={Flame} label="Cuisson" value={`${recipe.cookTime}'`} />
              </div>
            ) : (
              // MODE COMPACT — page basse, focus sur le plat lu.
              // v2.5 : ajout d'une mini-vignette horizontale (h-9 w-14 =
              // ratio 14/9, proche du 16/9 cinéma de la card principale).
              // object-cover object-center : crop centré, jamais déformé.
              <div className="flex items-center gap-2.5 pr-3 min-w-0">
                <div className="relative h-9 w-14 shrink-0 rounded-lg overflow-hidden bg-bone-deep">
                  <Image
                    src={recipe.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-center"
                  />
                </div>
                <span aria-hidden className="text-base leading-none shrink-0">
                  {country.flag}
                </span>
                <h2 className="font-serif text-sm md:text-base font-semibold text-ink leading-tight truncate flex-1 min-w-0">
                  {recipe.title}
                </h2>
              </div>
            )}
          </div>
          {titleInView && totalTime >= 60 && (
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

      {/* === ÉTAPE 1 — CHOIX DU MODE (BRIGADE) ===
          Affiché uniquement si la recette propose la variante Commis. Sinon
          on saute direct aux ingrédients. Le composant gate le reste du
          parcours : tant que l'utilisateur n'a pas confirmé sa brigade,
          ni les ingrédients ni les étapes ne sont rendus. */}
      {hasCommisMode && (
        <section className="mx-auto max-w-3xl px-4 md:px-6 mt-10 md:mt-14">
          <div className="bg-paper-card rounded-soft-xl p-6 md:p-10">
            <header className="mb-5 md:mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 text-terracotta-deep px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
                Étape 1 · Choisis ta brigade
              </span>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold leading-tight">
                Comment tu cuisines aujourd&rsquo;hui&nbsp;?
              </h2>
              <p className="mt-2 text-ink-soft text-base leading-relaxed">
                Chaque mode adapte la liste d&rsquo;ingrédients ET les étapes
                de préparation. Tu pourras changer d&rsquo;avis à tout moment.
              </p>
            </header>
            <div className="flex flex-col gap-5">
              <StepsModeToggle mode={mode} onChange={setStoredMode} />
              {step === 0 ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="self-stretch md:self-start inline-flex items-center justify-center gap-2 rounded-full bg-terracotta text-bone font-semibold px-6 py-3 shadow-warm hover:bg-terracotta-deep active:scale-95 transition-all"
                  >
                    Valider — voir les ingrédients
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </button>
                  {/* Escape hatch pour cuisiniers pressés : saute directement à
                      l'étape 2 (ingrédients + étapes visibles). Discret pour
                      ne pas casser l'incitation au parcours guidé, mais
                      accessible aux récurrents qui savent ce qu'ils font. */}
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="self-stretch md:self-start text-sm text-ink-soft hover:text-terracotta underline underline-offset-4 transition-colors py-1"
                  >
                    Sauter — tout afficher d&rsquo;un coup
                  </button>
                </div>
              ) : (
                <p className="text-sm text-sage flex items-center gap-2">
                  <span aria-hidden>✓</span>
                  Mode validé. Tu peux toujours basculer ci-dessus.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* === ÉTAPE 2 — INGRÉDIENTS ===
          Révélés après validation du mode (ou directement si pas de variante
          Commis). Padding généreux pour aérer le texte du bord de la
          "feuille". Un bouton de progression vers les étapes apparaît à la
          fin de la liste tant que les étapes ne sont pas dévoilées. */}
      {ingredientsRevealed && (
        <section
          id="ingredients"
          className={clsx(
            "mx-auto max-w-3xl px-4 md:px-6 animate-[revealIn_280ms_var(--ease-soft)]",
            hasCommisMode ? "mt-6 md:mt-8" : "mt-10 md:mt-14"
          )}
        >
          <div className="bg-paper-card rounded-soft-xl p-6 md:p-10">
            {hasCommisMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ochre/15 text-ochre px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] mb-4">
                <ShoppingBasket className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Étape 2 · Tes courses
              </span>
            )}
            {/* PortionsControl déplacé du sticky bar vers ici (v2.3) — c'est
                le contrôle qui pilote les quantités d'ingrédients, sa place
                est donc naturellement à côté de la liste. Sticky désencombré
                pour libérer de la surface de lecture sur mobile. */}
            <div className="mb-5 flex items-center justify-between gap-3 rounded-soft border border-bone-deep bg-bone/60 px-4 py-2.5">
              <span className="text-xs uppercase tracking-wider text-ink-soft font-medium">
                Quantités pour
              </span>
              <PortionsControl
                value={servings}
                baseline={baseline}
                onDec={dec}
                onInc={inc}
              />
            </div>
            {/* key={mode} → remount animé (crossfade) au lieu d'un swap sec
                quand on bascule Chef ⇄ Commis. */}
            <div
              key={`ing-${mode}`}
              className="animate-[swapIn_220ms_var(--ease-soft)]"
            >
              <RecipeIngredients
                ingredients={activeIngredients}
                servings={servings}
                baseline={baseline}
                collapsible
              />
            </div>
            {hasCommisMode && !stepsRevealed && (
              <div className="mt-8 pt-6 border-t border-bone-deep flex flex-col gap-3">
                <p className="text-sm text-ink-soft">
                  Tu as tout sous la main&nbsp;? Passe à la préparation.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="self-stretch md:self-start inline-flex items-center justify-center gap-2 rounded-full bg-terracotta text-bone font-semibold px-6 py-3 shadow-warm hover:bg-terracotta-deep active:scale-95 transition-all"
                >
                  Voir les étapes de préparation
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* === ÉTAPE 3 — PRÉPARATION ===
          Dernière étape du parcours. Feuille de carnet jumelle, drop-cap
          serif. Toggle Brigade rappelé dans le header pour permettre une
          bascule rapide pendant la lecture (les étapes se mettent à jour
          instantanément). */}
      {stepsRevealed && (
        <section
          id="preparation"
          // v2.3 : container élargi max-w-4xl (vs 3xl) + padding latéraux
          // réduits px-3 md:px-4 (vs px-4 md:px-6) → ~80px de plus en
          // largeur sur desktop, surface de lecture étapes maximisée.
          className="mx-auto max-w-4xl px-3 md:px-4 mt-6 md:mt-8 pb-24 animate-[revealIn_280ms_var(--ease-soft)]"
        >
          {/* Padding intérieur réduit : p-4 md:p-7 (vs p-6 md:p-10) — moins
              d'espace perdu autour des étapes, plus de focus sur le texte. */}
          <div className="bg-paper-card rounded-soft-xl p-4 md:p-7">
            <header className="mb-5 md:mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                {hasCommisMode && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/20 text-sage px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] mb-2">
                    <ListChecks className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Étape 3 · À la casserole
                  </span>
                )}
                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                    Préparation
                  </h2>
                  <span className="font-serif italic text-sm text-ink-soft">
                    {activeSteps.length} étapes
                  </span>
                </div>
              </div>
              {hasCommisMode && (
                <StepsModeToggle mode={mode} onChange={setStoredMode} />
              )}
            </header>
            <div
              key={`steps-${mode}`}
              className="animate-[swapIn_220ms_var(--ease-soft)]"
            >
              <StepList steps={activeSteps} />
            </div>
          </div>
        </section>
      )}
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

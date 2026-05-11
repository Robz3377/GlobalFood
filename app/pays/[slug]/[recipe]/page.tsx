import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Flame, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RecipeIngredients } from "@/components/recipe/RecipeIngredients";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { StepList } from "@/components/recipe/StepList";
import { PassportStamper } from "@/components/passport/PassportStamper";
import { getAllCountries, getRecipe } from "@/lib/data";

export function generateStaticParams() {
  return getAllCountries().flatMap((country) =>
    country.recipes.map((recipe) => ({
      slug: country.slug,
      recipe: recipe.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; recipe: string }>;
}) {
  const { slug, recipe } = await params;
  const data = getRecipe(slug, recipe);
  if (!data) return {};
  return {
    title: `${data.recipe.title} · ${data.country.name}`,
    description:
      data.recipe.story ??
      `Recette authentique de ${data.recipe.title} (${data.country.name}) — avec le secret du chef.`,
  };
}

const dietLabels: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Végétarien",
  "gluten-free": "Sans gluten",
  "dairy-free": "Sans lactose",
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string; recipe: string }>;
}) {
  const { slug, recipe } = await params;
  const data = getRecipe(slug, recipe);
  if (!data) notFound();
  const { country, recipe: r } = data;
  const totalTime = r.prepTime + r.cookTime;

  return (
    <main className="flex-1">
      <PassportStamper countrySlug={country.slug} recipeSlug={r.slug} />

      {/* HERO IMMERSIF — pleine largeur mobile (16/9), contenu desktop */}
      <header className="relative">
        <RecipeImage
          src={r.image}
          alt={r.title}
          priority
          aspect="aspect-[16/9] sm:aspect-[2/1] lg:aspect-[21/9]"
          sizes="100vw"
          className="rounded-none"
        />
        {/* Gradient overlay du bas pour la lisibilité du badge pays */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
        />
        {/* Lien retour, flottant en haut-gauche */}
        <Link
          href={`/pays/${country.slug}`}
          className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-bone/95 backdrop-blur px-3.5 py-2 text-sm font-medium shadow-soft hover:bg-bone transition-colors"
          aria-label={`Retour à la page ${country.name}`}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">{country.name}</span>
        </Link>
        {/* Badge pays en bas-droite du hero */}
        <span className="absolute bottom-4 right-4 md:bottom-6 md:right-6 inline-flex items-center gap-2 rounded-full bg-bone/95 backdrop-blur px-3.5 py-2 text-sm font-medium shadow-soft">
          <span aria-hidden className="text-base">
            {country.flag}
          </span>
          {country.name}
        </span>
      </header>

      {/* TITRE — débordant le hero, façon magazine */}
      <section className="relative -mt-10 md:-mt-16 mx-auto max-w-3xl px-4 md:px-6">
        <div className="rounded-soft-lg bg-bone shadow-soft-lg p-6 md:p-10">
          <p className="font-serif italic text-sm text-ink-soft mb-3">
            Cuisine {country.name.toLowerCase()}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            {r.title}
          </h1>
          {r.diets.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {r.diets.map((d) => (
                <Badge key={d} tone="sage">
                  {dietLabels[d] ?? d}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STICKY INFO BAR — colle sous le Header sur mobile (top-16) */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+4rem)] z-20 mt-6 md:mt-8">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="grid grid-cols-3 gap-2 rounded-full bg-white/95 backdrop-blur shadow-soft p-1.5 border border-bone-deep">
            <StickyStat icon={Clock} label="Prép." value={`${r.prepTime}'`} />
            <StickyStat icon={Flame} label="Cuisson" value={`${r.cookTime}'`} />
            <StickyStat icon={Users} label="Portions" value={String(r.servings)} />
          </div>
          {totalTime >= 60 && (
            <p className="mt-2 text-center text-xs text-ink-soft">
              Temps total ≈{" "}
              <strong className="font-medium text-ink">
                {Math.floor(totalTime / 60)}h{(totalTime % 60).toString().padStart(2, "0")}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* STORY + SECRET DU CHEF */}
      {(r.story || r.chefSecret) && (
        <section className="mx-auto max-w-3xl px-4 md:px-6 mt-8 space-y-3">
          {r.story && (
            <article className="rounded-soft-lg bg-ochre-soft/30 border-l-4 border-ochre p-5 md:p-6">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.15em] text-ochre">
                L'histoire
              </h2>
              <p className="mt-2 text-ink leading-relaxed text-base md:text-lg">
                {r.story}
              </p>
            </article>
          )}
          {r.chefSecret && (
            <article className="rounded-soft-lg bg-terracotta/10 border-l-4 border-terracotta p-5 md:p-6">
              <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.15em] text-terracotta-deep">
                Le secret du Chef
              </h2>
              <p className="mt-2 text-ink leading-relaxed text-base md:text-lg">
                {r.chefSecret}
              </p>
            </article>
          )}
        </section>
      )}

      {/* INGRÉDIENTS — accordéon sur mobile, déplié sur desktop */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 mt-10 md:mt-14">
        <RecipeIngredients
          ingredients={r.ingredients}
          servings={r.servings}
          collapsible
        />
      </section>

      {/* PRÉPARATION — magazine style avec gros chiffres serif */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 mt-10 md:mt-14 pb-24">
        <header className="mb-6 md:mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            Préparation
          </h2>
          <span className="font-serif italic text-sm text-ink-soft">
            {r.steps.length} étapes
          </span>
        </header>
        <StepList steps={r.steps} />
      </section>
    </main>
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

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
    title: `${data.recipe.title} · ${data.country.name} — Map and Fork`,
    description: `Recette de ${data.recipe.title} (${data.country.name}).`,
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

  return (
    <main className="flex-1">
      <PassportStamper countrySlug={country.slug} recipeSlug={r.slug} />
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <Link
          href={`/pays/${country.slug}`}
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à {country.name}
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
        <RecipeImage
          src={r.image}
          alt={r.title}
          priority
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="rounded-soft-lg shadow-soft"
        />
        <div>
          <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <span aria-hidden>{country.flag}</span>
            <Link href={`/pays/${country.slug}`} className="hover:text-ink">
              {country.name}
            </Link>
          </span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
            {r.title}
          </h1>

          <dl className="mt-6 grid grid-cols-3 gap-4">
            <Stat icon={Clock} label="Préparation" value={`${r.prepTime} min`} />
            <Stat icon={Flame} label="Cuisson" value={`${r.cookTime} min`} />
            <Stat icon={Users} label="Portions" value={String(r.servings)} />
          </dl>

          {r.diets.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {r.diets.map((d) => (
                <Badge key={d} tone="sage">
                  {dietLabels[d] ?? d}
                </Badge>
              ))}
            </div>
          )}

          {r.story && (
            <p className="mt-6 rounded-soft bg-ochre-soft/40 p-4 text-sm text-ink leading-relaxed border-l-4 border-ochre">
              <strong className="font-serif font-semibold mr-1">L'histoire :</strong>
              {r.story}
            </p>
          )}

          {r.chefSecret && (
            <p className="mt-3 rounded-soft bg-terracotta/10 p-4 text-sm text-ink leading-relaxed border-l-4 border-terracotta">
              <strong className="font-serif font-semibold mr-1">Le secret du Chef :</strong>
              {r.chefSecret}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <RecipeIngredients ingredients={r.ingredients} servings={r.servings} />
        <div>
          <h2 className="font-serif text-2xl font-semibold mb-4">Préparation</h2>
          <StepList steps={r.steps} />
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-soft bg-white p-3 shadow-soft">
      <div className="flex items-center gap-1.5 text-ink-soft text-xs">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </div>
      <div className="mt-1 font-serif text-lg font-semibold">{value}</div>
    </div>
  );
}

import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "La Gazette — Map and Fork",
  description: "Les histoires culturelles derrière les recettes du monde.",
};

export default function GazettePage() {
  const stories = getAllRecipes()
    .filter(({ recipe }) => recipe.story)
    .sort((a, b) => a.recipe.title.localeCompare(b.recipe.title, "fr"));

  if (stories.length === 0) {
    return (
      <main className="flex-1 mx-auto max-w-3xl px-6 pt-16">
        <p className="text-ink-soft">Aucune histoire disponible pour le moment.</p>
      </main>
    );
  }

  const [feature, ...rest] = stories;

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-4">
        <Badge tone="ochre">
          <Newspaper className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          La Gazette
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          Les histoires derrière les saveurs
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Une lecture courte sur l'origine des recettes, des épices et des
          traditions qui ont façonné nos cuisines.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href={`/pays/${feature.country.slug}/${feature.recipe.slug}`}
          className="group grid lg:grid-cols-[1.2fr_1fr] gap-0 rounded-soft-lg overflow-hidden bg-paper-card hover:shadow-warm transition-shadow"
        >
          <RecipeImage
            src={feature.recipe.image}
            alt={feature.recipe.title}
            priority
            aspect="aspect-[5/3] lg:aspect-auto"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <span aria-hidden>{feature.country.flag}</span>
              {feature.country.name}
              <span className="text-ink-soft/50">·</span>
              À la une
            </span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold leading-tight">
              {feature.recipe.title}
            </h2>
            <p className="mt-4 text-ink leading-relaxed">{feature.recipe.story}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-terracotta font-medium">
              Lire la recette
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="font-serif text-2xl font-semibold mb-5">
          Autres récits
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map(({ country, recipe }) => (
            <Link
              key={`${country.slug}-${recipe.slug}`}
              href={`/pays/${country.slug}/${recipe.slug}`}
              className="group flex gap-5 rounded-soft-lg bg-paper-card p-5 hover:shadow-warm transition-shadow"
            >
              <RecipeImage
                src={recipe.image}
                alt={recipe.title}
                aspect=""
                sizes="112px"
                className="h-28 w-28 flex-none rounded-soft transition-transform duration-500 group-hover:scale-105"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                  <span aria-hidden>{country.flag}</span>
                  {country.name}
                </span>
                <h3 className="mt-1 font-serif text-lg font-semibold leading-tight">
                  {recipe.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft line-clamp-3">
                  {recipe.story}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

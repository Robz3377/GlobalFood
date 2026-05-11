import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllCountries, getCountryBySlug } from "@/lib/data";
import { RecipeCard } from "@/components/recipe/RecipeCard";

export function generateStaticParams() {
  return getAllCountries().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return {};
  return {
    title: `${country.name} — Map and Fork`,
    description: country.intro,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à la carte
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl md:text-6xl leading-none" aria-hidden>
            {country.flag}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
            {country.name}
          </h1>
        </div>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">{country.intro}</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="font-serif text-2xl font-semibold mb-5">
          {country.recipes.length} recettes emblématiques
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {country.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              country={{ slug: country.slug, name: country.name, flag: country.flag }}
              recipe={recipe}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

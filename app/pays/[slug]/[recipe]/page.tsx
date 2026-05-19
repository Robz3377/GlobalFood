import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { RecipeBody } from "@/components/recipe/RecipeBody";
import { RecipeFeedback } from "@/components/recipe/RecipeFeedback";
import { PassportStamper } from "@/components/passport/PassportStamper";
import { getCountriesIndex, getRecipe } from "@/lib/data";

export function generateStaticParams() {
  // L'index allégé contient tous les recipeSlugs par pays — suffit pour
  // pré-rendre toutes les pages au build sans charger les recettes complètes.
  return getCountriesIndex().flatMap((country) =>
    country.recipeSlugs.map((recipeSlug) => ({
      slug: country.slug,
      recipe: recipeSlug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; recipe: string }>;
}) {
  const { slug, recipe } = await params;
  // generateMetadata utilise la recette complète pour `story` — coût OK
  // car SSG (build-time) et le cache Map évite les rechargements.
  const data = await getRecipe(slug, recipe);
  if (!data) return {};
  return {
    title: `${data.recipe.title} · ${data.country.name}`,
    description:
      data.recipe.story ??
      `Recette authentique de ${data.recipe.title} (${data.country.name}) — avec le secret du chef.`,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string; recipe: string }>;
}) {
  const { slug, recipe } = await params;
  const data = await getRecipe(slug, recipe);
  if (!data) notFound();
  const { country, recipe: r } = data;

  return (
    <main className="flex-1">
      <PassportStamper countrySlug={country.slug} recipeSlug={r.slug} />

      {/* HERO IMMERSIF — pleine largeur. Le badge pays est désormais dans le
          bloc titre (cf. RecipeBody) pour éviter le conflit z-index avec la
          carte titre qui déborde en négative margin. */}
      <header className="relative">
        {/* v2.5 — hero en aspect-[3/2] uniforme (au lieu d'un mélange
            16/9 → 2/1 → 21/9 selon le breakpoint). Format plus court
            sur mobile → ingrédients remontent plus haut dans la vue
            initiale. quality=92 pour magnifier les nouvelles photos HD. */}
        <RecipeImage
          src={r.image}
          alt={r.title}
          priority
          aspect="aspect-[3/2]"
          sizes="100vw"
          quality={92}
          className="rounded-none"
        />
        {/* Gradient overlay bas pour la profondeur visuelle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-black/10 to-transparent"
        />
        {/* Lien retour, flottant en haut-gauche */}
        <Link
          href={`/pays/${country.slug}`}
          className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-2 rounded-full bg-bone/95 backdrop-blur px-3.5 py-2 text-sm font-medium shadow-warm hover:bg-bone hover:-translate-x-0.5 active:scale-95 transition-all duration-200"
          aria-label={`Retour à la page ${country.name}`}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">{country.name}</span>
        </Link>
      </header>

      {/* Corps interactif (titre + sticky bar interactif + story + ingrédients + steps) */}
      <RecipeBody country={country} recipe={r} />

      {/* Avis communautaires (Phase 3) — notation + commentaires, branchés
          sur /api/ratings et /api/comments. CSR : aucun impact sur le SSG
          ni sur le LCP du hero. */}
      <RecipeFeedback countrySlug={country.slug} recipeSlug={r.slug} />
    </main>
  );
}

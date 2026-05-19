import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import type { Diet } from "@/lib/types";

const dietLabels: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Végétarien",
  "gluten-free": "Sans gluten",
  "dairy-free": "Sans lactose",
};

/**
 * Forme minimale acceptée par RecipeCard. Compatible à la fois avec :
 *   • `Recipe` (lib/types.ts) — recette complète
 *   • `RecipeIndex` (lib/types-index.ts) — meta sans ingredients/steps
 */
type RecipeCardRecipe = {
  slug: string;
  title: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  diets: Diet[];
};

type RecipeCardCountry = {
  slug: string;
  flag: string;
  name: string;
};

/**
 * RecipeCard — refonte v2.5 : format HORIZONTAL pour mettre en valeur les
 * nouvelles photos HD horizontales.
 *
 * Changements vs v2.4 :
 *   • Photo en aspect-[16/9] cinéma au lieu de 4/5 portrait
 *   • Suppression du chevauchement -mt-10 mx-3 (titre masquait le cœur du
 *     plat). Le titre est désormais dans un bloc propre directement sous
 *     l'image, séparé par une légère bordure pour clarté.
 *   • object-cover + object-center pour cadrage centré sans déformation
 *   • Carte unifiée bg-bone shadow-warm rounded-soft-lg overflow-hidden
 *   • Badge pays semi-transparent maintenu en haut-droite
 */
export function RecipeCard({
  country,
  recipe,
}: {
  country: RecipeCardCountry;
  recipe: RecipeCardRecipe;
}) {
  const total = recipe.prepTime + recipe.cookTime;
  return (
    <Link
      href={`/pays/${country.slug}/${recipe.slug}`}
      className="group block transition-all duration-300 ease-[var(--ease-soft)] hover:-translate-y-1 active:scale-[0.98]"
    >
      <article className="rounded-soft-lg overflow-hidden bg-bone shadow-warm border border-bone-deep/40 transition-shadow duration-300 group-hover:shadow-warm-lg">
        {/* === PHOTO HORIZONTALE (16/9 cinéma) ===
            object-cover + object-center via RecipeImage. Crop centré
            magnifie le plat sans le déformer. */}
        <div className="relative">
          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            aspect="aspect-[16/9]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 92vw"
            quality={90}
          />
          {/* Badge pays — top-right, semi-transparent pour laisser respirer
              la photo (point d'identité culturelle sans dominer). */}
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-bone/90 backdrop-blur-sm px-2 py-1 text-[11px] font-medium shadow-soft"
            aria-label={`Pays : ${country.name}`}
          >
            <span aria-hidden className="text-sm leading-none">
              {country.flag}
            </span>
            <span className="text-ink">{country.name}</span>
          </span>
        </div>

        {/* === BLOC TITRE / META — directement sous la photo, épuré ===
            Plus de chevauchement. Le bloc ivoire avec une fine bordure
            top en bone-deep crée une transition visuelle douce sans
            cacher l'image. */}
        <div className="p-4 border-t border-bone-deep/30">
          <h3 className="font-serif text-lg font-semibold leading-snug text-ink line-clamp-2">
            {recipe.title}
          </h3>
          <div className="mt-2 flex items-center gap-4 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
              {total} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {recipe.servings} pers.
            </span>
          </div>
          {recipe.diets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {recipe.diets.map((d) => (
                <Badge key={d} tone="sage">
                  {dietLabels[d] ?? d}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

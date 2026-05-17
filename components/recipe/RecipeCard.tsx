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
 * Évite de bundler les Ingredient[] et string[] dans les pages clients
 * qui n'affichent qu'une carte.
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
 * RecipeCard — refonte "magazine" v2.2.
 *
 * L'image occupe désormais 75% de la hauteur (ratio 4/5 portrait) pour
 * valoriser le visuel — c'est l'élément central d'une fiche recette. Le
 * titre est rendu dans une carte papier qui CHEVAUCHE légèrement le bas
 * de l'image (-mt-6), créant une superposition photo→titre comme dans
 * les éditoriaux food (Vogue, Saveurs, Bon Appétit).
 *
 * Préparé pour photos HD :
 *   • RecipeImage configuré en `quality={90}` (vs 75 par défaut Next)
 *   • Ratio 4/5 idéal pour cadrage produit alimentaire vertical
 *   • `sizes` ajusté à la nouvelle géométrie 50vw mobile / 33vw desktop
 *   • Hover : zoom doux + élévation de l'ombre — focus sur la photo
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
      className="group block transition-all duration-300 ease-out hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* === PHOTO DOMINANTE ===
          Ratio portrait 4/5 — donne ~25% de hauteur en plus vs 4/3 et
          cadre les plats en vertical (style éditorial). */}
      <div className="relative">
        <RecipeImage
          src={recipe.image}
          alt={recipe.title}
          aspect="aspect-[4/5]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 92vw"
          quality={90}
          className="rounded-soft-lg shadow-warm transition-shadow duration-300 group-hover:shadow-warm-lg"
        />
        {/* Gradient bas pour transition douce vers la carte titre qui
            chevauche. Évite la coupure brutale photo → bone. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-soft-lg bg-gradient-to-t from-black/35 via-black/10 to-transparent"
        />
        {/* Image scale au hover, contenue dans le aspect ratio */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-soft-lg overflow-hidden pointer-events-none"
        >
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
        </div>

        {/* Badge pays — semi-transparent, posé sur la photo en haut-droite.
            Plus discret qu'avant pour laisser respirer l'image. */}
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

      {/* === CARTE TITRE CHEVAUCHANT (style magazine) ===
          -mt-10 fait remonter la carte sur le bas de l'image (~40% de
          recouvrement). mx-3 réduit la largeur pour aération visuelle. */}
      <div className="relative -mt-10 mx-3 rounded-soft-lg bg-bone shadow-paper border border-bone-deep/60 p-4">
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
    </Link>
  );
}

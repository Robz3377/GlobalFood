import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import type { Country, Recipe } from "@/lib/types";

const dietLabels: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Végétarien",
  "gluten-free": "Sans gluten",
  "dairy-free": "Sans lactose",
};

export function RecipeCard({
  country,
  recipe,
}: {
  country: Pick<Country, "slug" | "flag" | "name">;
  recipe: Recipe;
}) {
  const total = recipe.prepTime + recipe.cookTime;
  return (
    <Link
      href={`/pays/${country.slug}/${recipe.slug}`}
      className="group flex flex-col rounded-soft-lg bg-white shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-0.5"
    >
      <div className="relative">
        <RecipeImage
          src={recipe.image}
          alt={recipe.title}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-bone/95 backdrop-blur px-2.5 py-1 text-xs font-medium shadow-soft"
          aria-label={`Pays : ${country.name}`}
        >
          <span aria-hidden>{country.flag}</span>
          <span>{country.name}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-semibold leading-tight">
          {recipe.title}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" strokeWidth={1.75} />
            {total} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" strokeWidth={1.75} />
            {recipe.servings} pers.
          </span>
        </div>
        {recipe.diets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
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

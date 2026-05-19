import { StarRating } from "./StarRating";
import { RecipeComments } from "./RecipeComments";

/**
 * Bloc « avis » de la page recette : notation + commentaires.
 *
 * Server Component léger qui pose juste la mise en page (largeur lisible,
 * séparateur) et délègue l'interactivité aux deux Client Components. Rendu
 * en bas de l'article, après le corps de la recette.
 */
export function RecipeFeedback({
  countrySlug,
  recipeSlug,
}: {
  countrySlug: string;
  recipeSlug: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14 space-y-12">
      <StarRating countrySlug={countrySlug} recipeSlug={recipeSlug} />
      <hr className="border-bone-deep" />
      <RecipeComments countrySlug={countrySlug} recipeSlug={recipeSlug} />
    </section>
  );
}

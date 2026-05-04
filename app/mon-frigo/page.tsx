import { Refrigerator } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FridgeFinder } from "@/components/fridge/FridgeFinder";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "Mon Frigo — Global Food",
  description:
    "Indiquez vos ingrédients disponibles, trouvez les recettes parfaites.",
};

export default function MonFrigoPage() {
  const recipes = getAllRecipes();
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <Badge tone="sage">
          <Refrigerator className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Mon Frigo
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          Cuisinez avec ce que vous avez
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Ajoutez vos ingrédients un par un (Entrée pour valider). Nous trouverons
          les recettes les plus proches de votre frigo.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <FridgeFinder recipes={recipes} />
      </section>
    </main>
  );
}

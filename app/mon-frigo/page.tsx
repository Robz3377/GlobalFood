import { Refrigerator } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FridgeFinder } from "@/components/fridge/FridgeFinder";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "Mon Frigo — Map and Fork",
  description:
    "Indiquez vos ingrédients disponibles, trouvez les recettes parfaites.",
};

export default function MonFrigoPage() {
  const recipes = getAllRecipes();
  return (
    <main className="flex-1">
      {/* Hero chaleureux ochre — palette "épices" */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-warm-gradient texture-paper opacity-95"
        />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6 pt-12 pb-8">
          <Badge tone="ochre">
            <Refrigerator className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
            Mon Frigo
          </Badge>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Cuisinez avec{" "}
            <span className="text-ochre-deep italic">ce que vous avez</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Ajoutez vos ingrédients un par un (Entrée pour valider). Nous
            trouverons les recettes les plus proches de votre frigo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-20">
        <FridgeFinder recipes={recipes} />
      </section>
    </main>
  );
}

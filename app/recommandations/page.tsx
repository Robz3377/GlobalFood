import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RecommendationsBoard } from "@/components/recommendations/RecommendationsBoard";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "Recommandations — Map and Fork",
  description: "Trois plats par semaine, choisis selon la saison et les fêtes.",
};

export default function RecommandationsPage() {
  const recipes = getAllRecipes();
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <Badge tone="ochre">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Recommandations
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          Trois plats pour cette semaine
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Sélectionnés en fonction de la saison, des fêtes culturelles
          imminentes et de votre historique de consultation.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <RecommendationsBoard recipes={recipes} />
      </section>
    </main>
  );
}

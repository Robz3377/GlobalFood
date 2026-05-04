import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ParcourirView } from "@/components/parcourir/ParcourirView";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "Parcourir — Global Food",
  description: "Toutes les recettes du monde, classées de A à Z.",
};

export default function ParcourirPage() {
  const all = getAllRecipes();

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <Badge tone="sage">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Parcourir
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          Toutes les recettes, de A à Z
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          {all.length} recettes au total. Filtrez par régime alimentaire pour
          affiner vos envies.
        </p>
      </section>

      <ParcourirView items={all} />
    </main>
  );
}

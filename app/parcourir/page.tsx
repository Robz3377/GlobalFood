import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ParcourirView } from "@/components/parcourir/ParcourirView";
import { getAllRecipes } from "@/lib/data";

export const metadata = {
  title: "Parcourir — Map and Fork",
  description: "Toutes les recettes du monde, classées de A à Z.",
};

export default function ParcourirPage() {
  const all = getAllRecipes();

  return (
    <main className="flex-1">
      {/* Hero chaleureux terracotta */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-spice-gradient texture-paper opacity-90"
        />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6 pt-12 pb-8">
          <Badge tone="terracotta">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
            Parcourir
          </Badge>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Toutes les recettes,{" "}
            <span className="text-terracotta italic">de A à Z</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            <strong className="text-ink font-medium">{all.length} recettes</strong>{" "}
            au total. Filtrez par régime alimentaire pour affiner vos envies.
          </p>
        </div>
      </section>

      <ParcourirView items={all} />
    </main>
  );
}

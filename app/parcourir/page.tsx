import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ParcourirView } from "@/components/parcourir/ParcourirView";
import { getAllRecipesIndex, getCountriesIndex } from "@/lib/data";

export const metadata = {
  title: "Parcourir — Map and Fork",
  description: "Toutes nos recettes par catégorie : entrées, plats, desserts et boissons.",
};

export default function ParcourirPage() {
  // Index allégé — pas d'ingredients/steps embarqués (économie ~454 → ~78 KB).
  const all = getAllRecipesIndex();
  const countries = getCountriesIndex();
  // Map slug → meta pays pour reconstituer les infos d'affichage (flag/name)
  // sans embarquer les Country[] complets.
  const countryBySlug = new Map(countries.map((c) => [c.slug, c]));

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
            Toutes nos recettes{" "}
            <span className="text-terracotta italic">par catégorie</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            <strong className="text-ink font-medium">{all.length} recettes</strong>{" "}
            regroupées en entrées, plats principaux, desserts et boissons. Filtrez
            par régime alimentaire pour affiner vos envies.
          </p>
        </div>
      </section>

      <ParcourirView
        items={all.map((r) => {
          const c = countryBySlug.get(r.countrySlug)!;
          return {
            country: { slug: c.slug, name: c.name, flag: c.flag },
            recipe: r,
          };
        })}
      />
    </main>
  );
}

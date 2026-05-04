import Link from "next/link";
import { Suspense } from "react";
import { Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WorldMapClient } from "@/components/map/WorldMapClient";
import { getAllCountries } from "@/lib/data";

export default function Home() {
  const countries = getAllCountries();
  const recipeCount = countries.reduce((acc, c) => acc + c.recipes.length, 0);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-12 pb-6 text-center md:text-left">
        <Badge tone="sage">
          <Globe2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Carte interactive
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
          Choisissez un pays,{" "}
          <span className="text-terracotta">cuisinez le monde</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto md:mx-0 text-lg text-ink-soft">
          {countries.length} pays disponibles · {recipeCount} recettes emblématiques.
          Survolez pour découvrir, cliquez pour cuisiner.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-10">
        <Suspense
          fallback={
            <div className="aspect-[10/7] w-full rounded-soft-lg bg-gradient-to-b from-bone to-bone-deep shadow-soft animate-pulse" />
          }
        >
          <WorldMapClient countries={countries} />
        </Suspense>
      </section>

      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <h2 className="font-serif text-2xl font-semibold mb-4">
          Les pays disponibles
        </h2>
        <div className="flex flex-wrap gap-3">
          {countries.map((c) => (
            <Link
              key={c.slug}
              href={`/pays/${c.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
            >
              <span aria-hidden className="text-lg">
                {c.flag}
              </span>
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-ink-soft">
                · {c.recipes.length} recettes
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

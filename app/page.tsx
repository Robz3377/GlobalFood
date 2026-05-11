import Link from "next/link";
import { Suspense } from "react";
import { Globe2, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WorldMapClient } from "@/components/map/WorldMapClient";
import { getAllCountries } from "@/lib/data";

/**
 * Cycle de teintes pour les cartes de pays. Opacités basses (15-70%) pour
 * rester raffiné — chaque pays hérite d'une teinte via son index modulo 5.
 * Validé avec le user pour éviter le côté "kitsch".
 */
const COUNTRY_TONES = [
  "bg-ochre-soft/60",
  "bg-sage-soft/70",
  "bg-terracotta/15",
  "bg-bone-deep",
  "bg-ochre/15",
] as const;

export default function Home() {
  const countries = getAllCountries();
  const recipeCount = countries.reduce((acc, c) => acc + c.recipes.length, 0);

  return (
    <main className="flex-1">
      {/* HERO ACCUEIL — chaleur via dégradé bone → ochre-soft */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-warm-gradient texture-paper opacity-90"
        />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-12 pb-8 text-center md:text-left">
          <Badge tone="ochre">
            <Globe2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
            Carte interactive
          </Badge>
          <h1 className="mt-5 font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
            Choisissez un pays,{" "}
            <span className="text-terracotta italic">cuisinez le monde</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto md:mx-0 text-lg text-ink-soft">
            <strong className="text-ink font-medium">{countries.length} pays</strong>{" "}
            disponibles ·{" "}
            <strong className="text-ink font-medium">{recipeCount} recettes</strong>{" "}
            emblématiques. Survolez pour découvrir, cliquez pour cuisiner.
          </p>
        </div>
      </section>

      {/* GLOBE 3D */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-10">
        <Suspense
          fallback={
            <div className="aspect-[10/7] w-full rounded-soft-xl bg-gradient-to-b from-bone to-bone-deep shadow-paper animate-pulse" />
          }
        >
          <WorldMapClient countries={countries} />
        </Suspense>
      </section>

      {/* GRILLE PAYS — 2 cols mobile, 3 sm, 5 lg, cartes uniformes carte-postale */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <header className="mb-5 md:mb-7 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold">
            Les pays disponibles
          </h2>
          <span className="font-serif italic text-sm text-ink-soft">
            10 destinations
          </span>
        </header>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {countries.map((c, i) => {
            const tone = COUNTRY_TONES[i % COUNTRY_TONES.length];
            const delay = `${Math.min(i * 40, 320)}ms`;
            return (
              <li
                key={c.slug}
                style={{ animationDelay: delay }}
                className="animate-[liftIn_400ms_var(--ease-soft)_both]"
              >
                <Link
                  href={`/pays/${c.slug}`}
                  className={`group relative flex aspect-[4/5] flex-col items-center justify-between rounded-soft-xl ${tone} px-3 py-5 md:px-4 md:py-6 shadow-soft ring-1 ring-bone-deep/60 hover:shadow-warm hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 ease-out`}
                >
                  {/* Drapeau XL en haut */}
                  <span
                    aria-hidden
                    className="text-5xl md:text-6xl leading-none drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  >
                    {c.flag}
                  </span>

                  {/* Nom du pays au centre */}
                  <div className="text-center">
                    <h3 className="font-serif text-base md:text-lg font-semibold leading-tight tracking-tight line-clamp-1">
                      {c.name}
                    </h3>
                  </div>

                  {/* Footer : nb recettes + chevron */}
                  <div className="flex items-center justify-between w-full text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles
                        className="h-3 w-3 text-terracotta"
                        strokeWidth={2}
                        aria-hidden
                      />
                      {c.recipes.length}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

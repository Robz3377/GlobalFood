import Link from "next/link";
import { Suspense } from "react";
import { Globe2, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WorldMapClient } from "@/components/map/WorldMapClient";
import { GlobeFrame } from "@/components/map/GlobeFrame";
import { getCountriesIndex } from "@/lib/data";

export default function Home() {
  const countries = getCountriesIndex();
  const recipeCount = countries.reduce(
    (acc, c) => acc + c.recipeSlugs.length,
    0
  );

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

      {/* GLOBE 3D — habillé d'un cadre "carnet de voyage" (grille de
          coordonnées + tampons de douane + rose des vents + compteur). */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-10">
        <GlobeFrame totalCountries={countries.length}>
          <Suspense
            fallback={
              // Mêmes bornes que le globe réel (clamp(w*0.7, 360, 560)) →
              // le swap fallback → canvas WebGL se fait SANS saut.
              <div
                aria-hidden
                className="relative aspect-[10/7] min-h-[360px] max-h-[560px] w-full rounded-soft-lg bg-bone-deep overflow-hidden animate-pulse"
              />
            }
          >
            <WorldMapClient countries={countries} />
          </Suspense>
        </GlobeFrame>
      </section>

      {/* GRILLE PAYS — esthétique "fiches papier de carnet de voyage".
          Le fond pattern-topo du body est visible entre les cartes. */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <header className="mb-5 md:mb-7 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold">
            Les pays disponibles
          </h2>
          <span className="font-serif italic text-sm text-ink-soft">
            {countries.length} destinations
          </span>
        </header>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {countries.map((c, i) => {
            const delay = `${Math.min(i * 40, 320)}ms`;
            return (
              <li
                key={c.slug}
                style={{ animationDelay: delay }}
                className="animate-[liftIn_400ms_var(--ease-soft)_both]"
              >
                <Link
                  href={`/pays/${c.slug}`}
                  className="group relative flex aspect-[4/5] flex-col items-center justify-between rounded-soft-xl bg-paper-card px-3 py-5 md:px-4 md:py-6 hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 ease-out"
                >
                  {/* Drapeau XL en haut */}
                  <span
                    aria-hidden
                    className="text-5xl md:text-6xl leading-none drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  >
                    {c.flag}
                  </span>

                  {/* Nom du pays + slogan au centre */}
                  <div className="text-center space-y-1.5">
                    <h3 className="font-serif text-base md:text-lg font-semibold leading-tight tracking-tight line-clamp-1">
                      {c.name}
                    </h3>
                    {c.tagline && (
                      <p className="font-serif italic text-[11px] md:text-xs leading-snug text-ink-soft line-clamp-2 px-1">
                        {c.tagline}
                      </p>
                    )}
                  </div>

                  {/* Footer : nb recettes + chevron */}
                  <div className="flex items-center justify-between w-full text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles
                        className="h-3 w-3 text-terracotta"
                        strokeWidth={2}
                        aria-hidden
                      />
                      {c.recipeSlugs.length}
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

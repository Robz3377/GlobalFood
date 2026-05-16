import { Stamp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PassportGrid } from "@/components/passport/PassportGrid";
import { getCountriesIndex } from "@/lib/data";

export const metadata = {
  title: "Passeport Culinaire — Map and Fork",
  description: "Collectionnez vos tampons gourmands au fil de vos voyages.",
};

export default function PasseportPage() {
  const countries = getCountriesIndex();
  return (
    <main className="flex-1">
      {/* Hero "carnet de voyage" — grain papier sobre ocre/sage */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pattern-grain opacity-90"
        />
        <div className="relative mx-auto max-w-5xl px-4 md:px-6 pt-12 pb-8">
          <Badge tone="terracotta">
            <Stamp className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
            Passeport Culinaire
          </Badge>
          <h1 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Vos{" "}
            <span className="text-terracotta-deep italic">voyages gourmands</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Chaque pays cuisiné débloque un tampon. Visitez une fiche recette pour
            le déclencher automatiquement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-20">
        <PassportGrid countries={countries} />
      </section>
    </main>
  );
}

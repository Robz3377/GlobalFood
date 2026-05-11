import { Stamp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PassportGrid } from "@/components/passport/PassportGrid";
import { getAllCountries } from "@/lib/data";

export const metadata = {
  title: "Passeport Culinaire — Map and Fork",
  description: "Collectionnez vos tampons gourmands au fil de vos voyages.",
};

export default function PasseportPage() {
  const countries = getAllCountries();
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-6">
        <Badge tone="sage">
          <Stamp className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Passeport Culinaire
        </Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          Vos voyages gourmands
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Chaque pays cuisiné débloque un tampon. Visitez une fiche recette pour
          le déclencher automatiquement.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <PassportGrid countries={countries} />
      </section>
    </main>
  );
}

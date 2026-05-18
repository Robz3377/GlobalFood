import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connecte-toi par lien magique pour synchroniser ton passeport et ton historique entre tes appareils.",
  robots: { index: false, follow: false },
};

/**
 * Page de connexion (Server Component) — héberge le formulaire client de
 * lien magique. `robots: noindex` : une page d'auth n'a pas vocation à
 * être indexée.
 */
export default function ConnexionPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-md px-6 pt-16 pb-24">
        <Badge tone="ochre">
          <KeyRound className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Connexion
        </Badge>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight">
          Retrouve ton carnet de voyage
        </h1>
        <p className="mt-4 text-ink-soft leading-relaxed">
          La connexion est facultative. Elle sert uniquement à synchroniser
          ton passeport, ton historique et tes avis sur tous tes appareils.
        </p>

        <div className="mt-8 rounded-soft-lg bg-paper-card p-6 shadow-soft">
          <MagicLinkForm next="/passeport" />
        </div>
      </section>
    </main>
  );
}

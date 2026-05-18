import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

/**
 * Gabarit partagé des pages légales (mentions légales, confidentialité).
 *
 * Server Component pur — aucune interactivité, indexable, pré-rendu SSG.
 * Reprend la grammaire visuelle "papier de magazine" du reste du site :
 * conteneur étroit lisible (max-w-3xl), titres Fraunces, corps Inter.
 *
 * Le projet n'utilise pas @tailwindcss/typography : on stylise donc le
 * contenu via les sous-composants <LegalSection> / <LegalNote> plutôt
 * qu'une classe `prose` globale.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: {
  /** Petit label contextuel affiché dans le Badge ochre. */
  eyebrow: string;
  title: string;
  /** Phrase d'introduction sous le titre (optionnelle). */
  intro?: string;
  /** Date ISO (YYYY-MM-DD) de dernière mise à jour du document. */
  updatedAt: string;
  children: ReactNode;
}) {
  const formatted = new Date(updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 pt-12 pb-20">
        <Badge tone="ochre">{eyebrow}</Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">{intro}</p>
        )}
        <p className="mt-3 text-sm text-ink-soft">
          Dernière mise à jour&nbsp;:{" "}
          <time dateTime={updatedAt}>{formatted}</time>
        </p>

        <div className="mt-10 space-y-10">{children}</div>
      </section>
    </main>
  );
}

/** Section titrée d'un document légal. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink">
        {title}
      </h2>
      <div className="space-y-3 text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * Encadré "à compléter" — repère visuel des champs à renseigner avant
 * mise en production (raison sociale, e-mail de contact, etc.).
 */
export function LegalTodo({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-soft bg-terracotta/10 px-1.5 py-0.5 text-terracotta-deep font-medium">
      [{children}]
    </span>
  );
}

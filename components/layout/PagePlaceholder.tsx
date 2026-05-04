import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PagePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24">
        <Badge tone="sage">{eyebrow}</Badge>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">{description}</p>

        <div className="mt-10 rounded-soft-lg bg-white p-10 shadow-soft flex flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-ink">
            <Icon className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <p className="mt-5 font-serif text-2xl font-semibold">Bientôt ici</p>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            Cette section sera construite dans une prochaine étape. La navigation
            est déjà en place pour valider l'ergonomie globale.
          </p>
        </div>
      </section>
    </main>
  );
}

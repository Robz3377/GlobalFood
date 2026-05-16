"use client";

import Link from "next/link";
import { Lock, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { usePassport } from "@/lib/hooks/usePassport";
import type { Country } from "@/lib/types";

export function PassportGrid({ countries }: { countries: Country[] }) {
  const { stamps, has, count, hydrated, reset } = usePassport();

  const total = countries.length;
  const ratio = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-soft-lg bg-paper-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-serif text-3xl font-semibold">
              {hydrated ? count : "—"}{" "}
              <span className="text-ink-soft text-base font-sans font-normal">
                / {total} pays cuisinés
              </span>
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {hydrated && count === 0
                ? "Votre carnet de voyage est encore vierge."
                : hydrated
                ? `${ratio}% du tour du monde accompli.`
                : "Chargement…"}
            </p>
          </div>
          {hydrated && count > 0 && (
            <Button variant="ghost" onClick={reset}>
              <Trash2 className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-bone-deep">
          <div
            className="h-full bg-terracotta transition-all duration-500"
            style={{ width: hydrated ? `${ratio}%` : 0 }}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {countries.map((c) => {
          const stampedAt = stamps[c.slug];
          const stamped = has(c.slug);
          return (
            <article
              key={c.slug}
              className={clsx(
                "relative rounded-soft-lg p-6 transition-all",
                stamped
                  ? "bg-paper-card"
                  : "bg-bone-deep/40 border-2 border-dashed border-bone-deep shadow-soft"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={clsx(
                      "block text-5xl leading-none transition-all",
                      stamped ? "" : "grayscale opacity-40"
                    )}
                    aria-hidden
                  >
                    {c.flag}
                  </span>
                  <h2 className="mt-3 font-serif text-xl font-semibold">
                    {c.name}
                  </h2>
                </div>
                {stamped ? (
                  <span
                    className="font-serif text-xs font-semibold uppercase tracking-wider text-terracotta border-2 border-terracotta rounded-full px-3 py-1.5 -rotate-6 select-none"
                    aria-hidden
                  >
                    Visité
                  </span>
                ) : (
                  <Lock
                    className="h-5 w-5 text-ink-soft/50"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                )}
              </div>

              {stamped && stampedAt && (
                <p className="mt-3 text-xs text-ink-soft">
                  Tamponné le{" "}
                  {new Date(stampedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <Link
                href={`/pays/${c.slug}`}
                className={clsx(
                  "mt-4 inline-flex text-sm font-medium transition-colors",
                  stamped
                    ? "text-terracotta hover:text-terracotta-deep"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                {stamped ? "Revoir les recettes →" : "Découvrir le pays →"}
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

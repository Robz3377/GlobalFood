"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";

type Stats = { average: number | null; count: number; mine: number | null };
type Phase = "loading" | "ready" | "unavailable" | "error";

/**
 * Notation par étoiles, branchée sur /api/ratings.
 *
 * - Lecture publique : moyenne + nombre d'avis (GET).
 * - Connecté : clic = upsert (PUT), clic sur sa note actuelle = retrait
 *   (DELETE). Mise à jour optimiste puis re-fetch pour la moyenne exacte.
 * - Anonyme : étoiles en lecture seule + invitation à se connecter.
 * - Backend non configuré (503) : message neutre, aucun crash.
 */
export function StarRating({
  countrySlug,
  recipeSlug,
}: {
  countrySlug: string;
  recipeSlug: string;
}) {
  const { user } = useSupabaseUser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [stats, setStats] = useState<Stats>({
    average: null,
    count: 0,
    mine: null,
  });
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const qs = `country=${encodeURIComponent(
    countrySlug
  )}&recipe=${encodeURIComponent(recipeSlug)}`;

  async function load() {
    try {
      const res = await fetch(`/api/ratings?${qs}`, { cache: "no-store" });
      if (res.status === 503) return setPhase("unavailable");
      if (!res.ok) return setPhase("error");
      const data = (await res.json()) as Stats;
      setStats(data);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }

  useEffect(() => {
    load();
    // re-fetch quand l'utilisateur se connecte/déconnecte (récupère `mine`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, recipeSlug, user]);

  async function setScore(score: number) {
    if (!user || busy) return;
    setBusy(true);
    const isRemoval = stats.mine === score;
    try {
      const res = isRemoval
        ? await fetch(`/api/ratings?${qs}`, { method: "DELETE" })
        : await fetch(`/api/ratings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              country: countrySlug,
              recipe: recipeSlug,
              score,
            }),
          });
      if (res.ok) await load();
    } catch {
      /* offline-first : on ignore, la moyenne se resynchronise au prochain load */
    } finally {
      setBusy(false);
    }
  }

  const display =
    hover ?? (stats.mine ?? Math.round(stats.average ?? 0));

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl md:text-3xl font-semibold">
        Votre avis
      </h2>

      {phase === "loading" && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Chargement…
        </p>
      )}

      {phase === "unavailable" && (
        <p className="text-sm text-ink-soft">
          Les notes seront bientôt disponibles.
        </p>
      )}

      {phase === "error" && (
        <button
          onClick={load}
          className="text-sm text-terracotta-deep underline underline-offset-2"
        >
          Échec du chargement — réessayer
        </button>
      )}

      {phase === "ready" && (
        <div className="space-y-2">
          <div
            className="flex items-center gap-1"
            role={user ? "radiogroup" : undefined}
            aria-label="Note de la recette"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={!user || busy}
                onClick={() => setScore(n)}
                onMouseEnter={() => user && setHover(n)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                aria-pressed={stats.mine === n}
                className={clsx(
                  "p-0.5 transition-transform",
                  user && !busy
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-default"
                )}
              >
                <Star
                  className={clsx(
                    "h-7 w-7",
                    n <= display
                      ? "fill-terracotta text-terracotta"
                      : "text-sage-soft"
                  )}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-ink-soft tabular-nums">
              {stats.average != null
                ? `${stats.average.toFixed(1)} · ${stats.count} avis`
                : "Aucune note"}
            </span>
          </div>

          {!user && (
            <p className="text-sm text-ink-soft">
              <Link
                href="/connexion"
                className="text-terracotta-deep underline underline-offset-2"
              >
                Connecte-toi
              </Link>{" "}
              pour noter cette recette.
            </p>
          )}
          {user && stats.mine != null && (
            <p className="text-xs text-ink-soft">
              Votre note : {stats.mine}/5 — cliquez à nouveau dessus pour la
              retirer.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

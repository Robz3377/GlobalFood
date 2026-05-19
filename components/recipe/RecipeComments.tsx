"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, Trash2, Loader2, Send } from "lucide-react";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";

type Comment = {
  id: number;
  body: string;
  createdAt: string;
  author: string;
  mine: boolean;
};
type Phase = "loading" | "ready" | "unavailable" | "error";

const MAX = 2000;

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Liste + formulaire de commentaires, branchés sur /api/comments.
 *
 * - Lecture publique (GET, commentaires visibles).
 * - Connecté : formulaire d'ajout (POST) + suppression de ses propres
 *   commentaires (DELETE, drapeau `mine` fourni par l'API).
 * - Anonyme : invitation à se connecter.
 * - 503 → message neutre. Re-fetch après ajout/suppression (liste courte).
 */
export function RecipeComments({
  countrySlug,
  recipeSlug,
}: {
  countrySlug: string;
  recipeSlug: string;
}) {
  const { user } = useSupabaseUser();
  const [phase, setPhase] = useState<Phase>("loading");
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const qs = `country=${encodeURIComponent(
    countrySlug
  )}&recipe=${encodeURIComponent(recipeSlug)}`;

  async function load() {
    try {
      const res = await fetch(`/api/comments?${qs}`, { cache: "no-store" });
      if (res.status === 503) return setPhase("unavailable");
      if (!res.ok) return setPhase("error");
      const data = (await res.json()) as { comments: Comment[] };
      setComments(data.comments);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countrySlug, recipeSlug, user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: countrySlug,
          recipe: recipeSlug,
          body: trimmed,
        }),
      });
      if (res.status === 429) {
        setFormError("Trop de commentaires d'affilée. Réessaie dans un instant.");
      } else if (!res.ok) {
        const j = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setFormError(j?.error ?? "Échec de l'envoi.");
      } else {
        setBody("");
        await load();
      }
    } catch {
      setFormError("Erreur réseau. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: number) {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) setComments((c) => c.filter((x) => x.id !== id));
    } catch {
      /* on ignore : l'utilisateur peut réessayer */
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-2 font-serif text-2xl md:text-3xl font-semibold">
        <MessageCircle
          className="h-6 w-6 text-terracotta"
          strokeWidth={2}
          aria-hidden
        />
        Commentaires
        {phase === "ready" && comments.length > 0 && (
          <span className="text-base font-normal text-ink-soft">
            ({comments.length})
          </span>
        )}
      </h2>

      {phase === "unavailable" && (
        <p className="text-sm text-ink-soft">
          Les commentaires seront bientôt disponibles.
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

      {phase === "loading" && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Chargement…
        </p>
      )}

      {phase === "ready" && (
        <>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <label htmlFor="comment" className="sr-only">
                Votre commentaire
              </label>
              <textarea
                id="comment"
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX))}
                rows={3}
                placeholder="Partage ton expérience, une variante, un conseil…"
                disabled={submitting}
                className="w-full rounded-soft border border-bone-deep bg-bone px-4 py-3 text-ink placeholder:text-ink-soft/60 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 disabled:opacity-60"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-soft tabular-nums">
                  {body.length}/{MAX}
                </span>
                <button
                  type="submit"
                  disabled={submitting || body.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-soft bg-terracotta px-4 py-2 text-sm font-medium text-bone hover:bg-terracotta-deep transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" strokeWidth={2} aria-hidden />
                  )}
                  Publier
                </button>
              </div>
              {formError && (
                <p
                  className="text-sm text-terracotta-deep"
                  aria-live="assertive"
                >
                  {formError}
                </p>
              )}
            </form>
          ) : (
            <p className="text-sm text-ink-soft">
              <Link
                href="/connexion"
                className="text-terracotta-deep underline underline-offset-2"
              >
                Connecte-toi
              </Link>{" "}
              pour laisser un commentaire.
            </p>
          )}

          <ul className="space-y-4">
            {comments.length === 0 && (
              <li className="text-sm text-ink-soft">
                Aucun commentaire pour l'instant. Sois le premier !
              </li>
            )}
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-soft-lg bg-paper-card p-4 shadow-soft"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif font-semibold text-ink">
                    {c.author}
                  </p>
                  <time
                    dateTime={c.createdAt}
                    className="text-xs text-ink-soft"
                  >
                    {dateFmt.format(new Date(c.createdAt))}
                  </time>
                </div>
                <p className="mt-2 text-ink-soft leading-relaxed whitespace-pre-line">
                  {c.body}
                </p>
                {c.mine && (
                  <button
                    onClick={() => remove(c.id)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-terracotta-deep transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Supprimer
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

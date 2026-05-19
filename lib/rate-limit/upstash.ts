import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Limiteurs de débit Upstash (anti-abus — Phase 4).
 *
 * Principe directeur identique à Supabase : OPT-IN. Sans
 * `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, chaque limiteur
 * vaut `null` → le garde `enforce()` laisse passer. Aucune régression en
 * dev/local ou si Upstash n'est pas provisionné.
 *
 * La limitation est une défense en profondeur CONTRE L'ABUS, pas la
 * frontière d'autorisation : la RLS Postgres reste la source de vérité.
 *
 * Algorithme : fenêtre glissante (sliding window) — équilibre précision /
 * coût Redis, sans pic de bord comme le fixed-window.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRateLimitConfigured = Boolean(url && token);

const redis = isRateLimitConfigured
  ? new Redis({ url: url as string, token: token as string })
  : null;

function make(
  prefix: string,
  limiter: ReturnType<typeof Ratelimit.slidingWindow>
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter,
    prefix,
    analytics: false,
    // Cache mémoire process-local : évite un aller-retour Redis quand un
    // identifiant est déjà bloqué (utile sous rafale).
    ephemeralCache: new Map(),
  });
}

// --- Budgets (cf. plan Phase 4) -------------------------------------------
/** Création de commentaire : 5 / minute par utilisateur. */
export const commentCreateMinute = make(
  "rl:comment:min",
  Ratelimit.slidingWindow(5, "60 s")
);
/** Création de commentaire : 50 / 24 h par utilisateur (plafond anti-spam). */
export const commentCreateDay = make(
  "rl:comment:day",
  Ratelimit.slidingWindow(50, "86400 s")
);
/** Édition de commentaire : 10 / minute par utilisateur. */
export const commentEdit = make(
  "rl:comment:edit",
  Ratelimit.slidingWindow(10, "60 s")
);
/** Note (upsert) : 20 / minute par utilisateur. */
export const ratingWrite = make(
  "rl:rating",
  Ratelimit.slidingWindow(20, "60 s")
);
/** Lecture publique (par IP) : généreux, juste un plafond anti-scraping. */
export const publicRead = make(
  "rl:read",
  Ratelimit.slidingWindow(60, "60 s")
);

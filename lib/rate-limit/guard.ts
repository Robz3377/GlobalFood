import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import type { Ratelimit } from "@upstash/ratelimit";

/**
 * Garde de limitation de débit pour les Route Handlers.
 *
 * - `identifier()` : préfère l'ID utilisateur authentifié ; sinon l'IP
 *   (issue de `x-forwarded-for` injecté par Vercel) HACHÉE — on ne stocke
 *   jamais d'IP en clair dans Redis (RGPD / minimisation).
 * - `enforce()` : `null` si autorisé ; sinon une réponse 429 prête à
 *   renvoyer avec en-têtes `Retry-After` + `RateLimit-*`.
 * - Limiteur `null` (Upstash non configuré) ⇒ toujours autorisé.
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "0.0.0.0";
}

export function userIdentifier(userId: string): string {
  return `u:${userId}`;
}

export function ipIdentifier(request: Request): string {
  const hash = createHash("sha256")
    .update(clientIp(request))
    .digest("hex")
    .slice(0, 24);
  return `ip:${hash}`;
}

export async function enforce(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // Upstash non configuré → on laisse passer

  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (success) return null;

  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  const response = NextResponse.json(
    { error: "Trop de requêtes. Réessaie dans un instant." },
    { status: 429 }
  );
  response.headers.set("Retry-After", String(retryAfter));
  response.headers.set("RateLimit-Limit", String(limit));
  response.headers.set("RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("RateLimit-Reset", String(retryAfter));
  return response;
}

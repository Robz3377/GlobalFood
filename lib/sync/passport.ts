import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { PassportState } from "@/lib/hooks/usePassport";

/**
 * Mappers de synchronisation du PASSEPORT (Phase 2).
 *
 * Modèle : PassportState = Record<countrySlug, isoDate>  ⇄  table
 * `passport_stamps (user_id, country_slug, stamped_at)`.
 *
 * Philosophie : « un tampon ne se perd jamais ». La fusion est une UNION ;
 * en cas de conflit on garde la date la PLUS ANCIENNE (premier obtention).
 *
 * Toutes les fonctions sont défensives : une erreur réseau ne doit jamais
 * remonter jusqu'à l'UI (offline-first).
 */
type DB = TypedSupabaseClient;

export async function pullPassport(
  sb: DB,
  userId: string
): Promise<PassportState> {
  const { data, error } = await sb
    .from("passport_stamps")
    .select("country_slug, stamped_at")
    .eq("user_id", userId);

  if (error || !data) return {};
  const out: PassportState = {};
  for (const row of data) out[row.country_slug] = row.stamped_at;
  return out;
}

export function mergePassport(
  local: PassportState,
  remote: PassportState
): PassportState {
  const merged: PassportState = { ...remote };
  for (const [slug, date] of Object.entries(local)) {
    if (!merged[slug] || date < merged[slug]) merged[slug] = date;
  }
  return merged;
}

export async function pushPassport(
  sb: DB,
  userId: string,
  state: PassportState
): Promise<void> {
  const rows = Object.entries(state).map(([country_slug, stamped_at]) => ({
    user_id: userId,
    country_slug,
    stamped_at,
  }));
  if (rows.length === 0) return;
  // Idempotent : on n'écrase pas une date déjà présente (premier obtention).
  await sb
    .from("passport_stamps")
    .upsert(rows, { onConflict: "user_id,country_slug", ignoreDuplicates: true });
}

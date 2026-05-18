import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { HistoryEntry } from "@/lib/hooks/useHistory";

/**
 * Mappers de synchronisation de l'HISTORIQUE (Phase 2).
 *
 * Modèle : HistoryEntry[] = { countrySlug, recipeSlug?, at }[]  ⇄  table
 * `history_entries (user_id, country_slug, recipe_slug, viewed_at)`.
 *
 * Borné à 30 entrées (aligné sur useHistory MAX). La table n'a pas de clé
 * naturelle unique : on déduplique sur la clé composite
 * (country_slug, recipe_slug, viewed_at) et `pushHistory` n'insère que les
 * entrées absentes (idempotent sans contrainte UNIQUE).
 */
const MAX = 30;
type DB = TypedSupabaseClient;

const keyOf = (e: HistoryEntry) =>
  `${e.countrySlug}::${e.recipeSlug ?? ""}::${e.at}`;

export async function pullHistory(
  sb: DB,
  userId: string
): Promise<HistoryEntry[]> {
  const { data, error } = await sb
    .from("history_entries")
    .select("country_slug, recipe_slug, viewed_at")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(MAX);

  if (error || !data) return [];
  return data.map((r) => ({
    countrySlug: r.country_slug,
    recipeSlug: r.recipe_slug ?? undefined,
    at: r.viewed_at,
  }));
}

export function mergeHistory(
  local: HistoryEntry[],
  remote: HistoryEntry[]
): HistoryEntry[] {
  const map = new Map<string, HistoryEntry>();
  for (const e of [...remote, ...local]) map.set(keyOf(e), e);
  return [...map.values()]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX);
}

export async function pushHistory(
  sb: DB,
  userId: string,
  entries: HistoryEntry[]
): Promise<void> {
  if (entries.length === 0) return;

  const { data: existing } = await sb
    .from("history_entries")
    .select("country_slug, recipe_slug, viewed_at")
    .eq("user_id", userId);

  const have = new Set(
    (existing ?? []).map(
      (r) => `${r.country_slug}::${r.recipe_slug ?? ""}::${r.viewed_at}`
    )
  );

  const toInsert = entries
    .filter((e) => !have.has(keyOf(e)))
    .map((e) => ({
      user_id: userId,
      country_slug: e.countrySlug,
      recipe_slug: e.recipeSlug ?? null,
      viewed_at: e.at,
    }));

  if (toInsert.length > 0) {
    await sb.from("history_entries").insert(toInsert);
  }
}

"use client";

import { useCallback } from "react";
import { useSyncedStore, type RemoteSync } from "./useSyncedStore";
import { pullHistory, mergeHistory, pushHistory } from "@/lib/sync/history";

const KEY = "mapandfork.history";
// NE JAMAIS retirer : migration silencieuse Global Food → Map and Fork.
const LEGACY_KEY = "global-food.history";
const MAX = 30;

export type HistoryEntry = {
  countrySlug: string;
  recipeSlug?: string;
  at: string;
};

// Constante de MODULE → identité stable (requis par useSyncedStore).
const REMOTE: RemoteSync<HistoryEntry[]> = {
  pull: pullHistory,
  merge: mergeHistory,
  push: pushHistory,
};

/**
 * API publique inchangée (`history`, `log`, `hydrated`). Mode anonyme =
 * comportement strictement identique à l'ancienne version localStorage.
 * Une fois connecté, l'historique fusionne avec Supabase (30 dernières
 * entrées, dé-dupliquées par useSyncedStore + mappers).
 */
export function useHistory() {
  const [history, setHistory, hydrated] = useSyncedStore<HistoryEntry[]>(
    KEY,
    [],
    LEGACY_KEY,
    REMOTE
  );

  const log = useCallback(
    (entry: Omit<HistoryEntry, "at">) => {
      setHistory((prev) =>
        [{ ...entry, at: new Date().toISOString() }, ...prev].slice(0, MAX)
      );
    },
    [setHistory]
  );

  return { history, log, hydrated };
}

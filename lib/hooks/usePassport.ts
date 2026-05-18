"use client";

import { useCallback } from "react";
import { useSyncedStore, type RemoteSync } from "./useSyncedStore";
import { pullPassport, mergePassport, pushPassport } from "@/lib/sync/passport";

export type PassportState = Record<string, string>;

const KEY = "mapandfork.passport";
// NE JAMAIS retirer : migration silencieuse Global Food → Map and Fork.
const LEGACY_KEY = "global-food.passport";

// Constante de MODULE → identité stable (requis par useSyncedStore).
const REMOTE: RemoteSync<PassportState> = {
  pull: pullPassport,
  merge: mergePassport,
  push: pushPassport,
};

/**
 * API publique inchangée. Comportement identique à l'ancienne version tant
 * que l'utilisateur est anonyme ; synchronisé sur Supabase une fois connecté
 * (cf. useSyncedStore). `reset()` reste une remise à zéro LOCALE : un tampon
 * distant n'est jamais supprimé (philosophie « un tampon ne se perd jamais »).
 */
export function usePassport() {
  const [stamps, setStamps, hydrated] = useSyncedStore<PassportState>(
    KEY,
    {},
    LEGACY_KEY,
    REMOTE
  );

  const stamp = useCallback(
    (countrySlug: string) => {
      setStamps((prev) =>
        prev[countrySlug]
          ? prev
          : { ...prev, [countrySlug]: new Date().toISOString() }
      );
    },
    [setStamps]
  );

  const reset = useCallback(() => setStamps({}), [setStamps]);

  const has = useCallback((slug: string) => Boolean(stamps[slug]), [stamps]);

  return {
    stamps,
    stamp,
    reset,
    has,
    count: Object.keys(stamps).length,
    hydrated,
  };
}

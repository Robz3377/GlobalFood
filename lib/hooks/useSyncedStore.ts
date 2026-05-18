"use client";

import { useCallback, useEffect, useRef } from "react";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useLocalStorage } from "./useLocalStorage";
import { useSupabaseUser } from "./useSupabaseUser";

/**
 * Adaptateur de stockage : localStorage ⇄ Supabase, offline-first.
 *
 * Contrat de non-régression : tant qu'aucune session Supabase n'est active
 * (utilisateur anonyme, Supabase non configuré, hors-ligne), ce hook se
 * comporte EXACTEMENT comme `useLocalStorage` (mêmes clés, même migration
 * legacy). La synchronisation est purement additive.
 *
 * Cycle de vie quand l'utilisateur est connecté :
 *   1. Réconciliation unique (par utilisateur) : pull distant → merge avec
 *      le local → écriture locale (write-through) → push distant.
 *      Idempotente (les mappers gèrent la dé-duplication).
 *   2. Ensuite, chaque mutation locale est répercutée en best-effort vers
 *      Supabase. Une erreur réseau n'interrompt jamais l'UI.
 *
 * IMPORTANT : passer un objet `remote` STABLE (constante de module), sinon
 * l'effet de réconciliation se relance à chaque rendu.
 */
export type RemoteSync<T> = {
  pull: (sb: TypedSupabaseClient, userId: string) => Promise<T>;
  merge: (local: T, remote: T) => T;
  push: (sb: TypedSupabaseClient, userId: string, value: T) => Promise<void>;
};

export function useSyncedStore<T>(
  key: string,
  initial: T,
  legacyKey: string | string[] | undefined,
  remote: RemoteSync<T>
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue, hydrated] = useLocalStorage<T>(
    key,
    initial,
    legacyKey
  );
  const { user } = useSupabaseUser();

  // `null` = pas encore réconcilié ; sinon = id utilisateur réconcilié.
  const reconciledFor = useRef<string | null>(null);
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  useEffect(() => {
    if (!hydrated || !user) return;
    if (reconciledFor.current === user.id) return;

    const sb = getSupabaseBrowserClient();
    if (!sb) return;

    reconciledFor.current = user.id;
    let cancelled = false;

    (async () => {
      try {
        const remoteState = await remote.pull(sb, user.id);
        if (cancelled) return;
        const merged = remote.merge(valueRef.current, remoteState);
        setValue(merged); // write-through localStorage
        await remote.push(sb, user.id, merged);
      } catch {
        // Échec réseau : on autorise une nouvelle tentative au prochain
        // montage (le merge/push restent idempotents).
        reconciledFor.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, remote, setValue]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: T) => T)(prev)
            : next;

        const sb = getSupabaseBrowserClient();
        if (sb && user && reconciledFor.current === user.id) {
          // Best-effort : on ne bloque pas l'UI et on avale l'erreur.
          remote.push(sb, user.id, resolved).catch(() => {});
        }
        return resolved;
      });
    },
    [setValue, user, remote]
  );

  return [value, update, hydrated];
}

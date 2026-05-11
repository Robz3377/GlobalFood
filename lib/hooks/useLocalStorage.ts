"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T,
  /**
   * Optional legacy key(s) to migrate FROM on first hydration.
   * Used here for the Global Food → Map and Fork rebrand: if the new `key`
   * has no value yet but a legacy key does, we copy it over and remove the
   * legacy entry, transparently preserving the user's history/passport/units.
   */
  legacyKey?: string | string[]
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      } else if (legacyKey) {
        // Rebrand migration: try legacy keys in order, copy first hit
        const candidates = Array.isArray(legacyKey) ? legacyKey : [legacyKey];
        for (const lk of candidates) {
          const legacyRaw = window.localStorage.getItem(lk);
          if (legacyRaw !== null) {
            window.localStorage.setItem(key, legacyRaw);
            window.localStorage.removeItem(lk);
            setValue(JSON.parse(legacyRaw) as T);
            break;
          }
        }
      }
    } catch {
      // ignore parse / access errors
    } finally {
      setHydrated(true);
    }
  }, [key, legacyKey]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore quota / access errors
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated];
}

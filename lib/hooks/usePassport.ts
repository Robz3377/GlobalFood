"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type PassportState = Record<string, string>;

const KEY = "mapandfork.passport";
const LEGACY_KEY = "global-food.passport";

export function usePassport() {
  const [stamps, setStamps, hydrated] = useLocalStorage<PassportState>(
    KEY,
    {},
    LEGACY_KEY
  );

  const stamp = useCallback(
    (countrySlug: string) => {
      setStamps((prev) =>
        prev[countrySlug] ? prev : { ...prev, [countrySlug]: new Date().toISOString() }
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

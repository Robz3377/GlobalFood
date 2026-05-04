"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "global-food.history";
const MAX = 30;

export type HistoryEntry = {
  countrySlug: string;
  recipeSlug?: string;
  at: string;
};

export function useHistory() {
  const [history, setHistory, hydrated] = useLocalStorage<HistoryEntry[]>(KEY, []);

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

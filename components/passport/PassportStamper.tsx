"use client";

import { useEffect } from "react";
import { usePassport } from "@/lib/hooks/usePassport";
import { useHistory } from "@/lib/hooks/useHistory";

export function PassportStamper({
  countrySlug,
  recipeSlug,
}: {
  countrySlug: string;
  recipeSlug?: string;
}) {
  const { stamp, hydrated } = usePassport();
  const { log, hydrated: historyReady } = useHistory();

  useEffect(() => {
    if (!hydrated) return;
    stamp(countrySlug);
  }, [hydrated, stamp, countrySlug]);

  useEffect(() => {
    if (!historyReady) return;
    log({ countrySlug, recipeSlug });
  }, [historyReady, log, countrySlug, recipeSlug]);

  return null;
}

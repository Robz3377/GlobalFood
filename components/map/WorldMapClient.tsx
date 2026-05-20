"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CountryIndex } from "@/lib/types-index";

// Placeholder dimensions IDENTIQUES à la formule utilisée par WorldGlobe
// (clamp(width * 0.7, 360px, 560px) — cf. composant). Hauteur LOCKÉE par
// `aspect-[10/7] min-h-[360px] max-h-[560px]` → quand le canvas WebGL
// prend le relais, ZÉRO saut de mise en page.
const WorldGlobe = dynamic(
  () => import("./WorldGlobe").then((m) => m.WorldGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-[10/7] min-h-[360px] max-h-[560px] w-full rounded-soft-lg bg-bone-deep overflow-hidden shadow-soft animate-pulse flex items-center justify-center">
        <div className="h-48 w-48 rounded-full border-2 border-dashed border-sage/40 animate-[spin_8s_linear_infinite]" />
      </div>
    ),
  }
);

/**
 * WorldMapClient — wrapper Client qui charge dynamiquement WorldGlobe (ssr:
 * false car le globe utilise three.js/WebGL).
 */
export function WorldMapClient({ countries }: { countries: CountryIndex[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const focusSlug = params.get("focus");
  const [navTo, setNavTo] = useState<string | null>(null);

  useEffect(() => {
    if (!navTo) return;
    router.push(`/pays/${navTo}`);
  }, [navTo, router]);

  return (
    <WorldGlobe
      countries={countries}
      focusSlug={focusSlug}
      onFocusComplete={(slug) => setNavTo(slug)}
    />
  );
}

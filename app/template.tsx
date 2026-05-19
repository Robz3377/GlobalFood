"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/components/transitions/PageTransition";

/**
 * Template racine — point d'ancrage des transitions de page.
 *
 * `template.tsx` se remonte à chaque navigation : c'est l'endroit idéal pour
 * `AnimatePresence`. La logique (détection de direction + variants parallaxe
 * iOS) vit dans `PageTransition`.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

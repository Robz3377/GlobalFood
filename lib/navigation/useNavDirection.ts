"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

export type NavDirection = "forward" | "back" | "fade";

/** Profondeur d'une route = nombre de segments non vides. */
function depth(path: string): number {
  return path.split("/").filter(Boolean).length;
}

/**
 * Détecte la direction de navigation pour la transition de page.
 *
 * Toutes les navigations in-app sont des `push`/`<Link>` (le « Retour » de
 * la page recette est un `<Link>` vers le pays, PAS `router.back()`), donc
 * la direction ne peut pas être déduite de push vs pop seul :
 *
 *  1. `popstate` (back OS / bouton navigateur / swipe iOS) → "back".
 *  2. Sinon, comparaison de profondeur :
 *       plus profond  → "forward"  (accueil→pays→recette, recherche→recette)
 *       moins profond → "back"     (recette→pays « Retour », pays→accueil)
 *       même niveau   → "fade"     (onglets, recette↔recette)
 *
 * `prefers-reduced-motion` force "fade".
 *
 * La direction est calculée en rendu (via refs) pour être disponible AVANT
 * que le nouveau `motion.div` ne monte ; les refs ne sont commitées qu'en
 * effet (pas d'effet de bord pendant le rendu).
 */
export function useNavDirection(): NavDirection {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  const prevPathRef = useRef<string | null>(null);
  const popstateRef = useRef(false);

  useEffect(() => {
    function onPopState() {
      popstateRef.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const direction = useMemo<NavDirection>(() => {
    if (prefersReduced) return "fade";
    const prev = prevPathRef.current;
    if (prev === null || prev === pathname) return "fade";
    if (popstateRef.current) return "back";
    const d = depth(pathname) - depth(prev);
    if (d > 0) return "forward";
    if (d < 0) return "back";
    return "fade";
  }, [pathname, prefersReduced]);

  // Commit du nouvel état APRÈS le rendu (jamais pendant).
  useEffect(() => {
    prevPathRef.current = pathname;
    popstateRef.current = false;
  }, [pathname]);

  return direction;
}

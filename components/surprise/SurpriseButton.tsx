"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dices } from "lucide-react";
import { clsx } from "clsx";

/**
 * Bouton « Surprends-moi » — variant lazy.
 *
 * Avant : recevait `recipes` (50 items, ~454 KB) en prop depuis le root
 * layout, qui se sérialisait dans le RSC payload de TOUTES les routes.
 *
 * Après : autonome — au clic, fetch `/api/random-recipe` qui renvoie
 * `{ countrySlug, recipeSlug }` depuis l'index serveur, puis navigue.
 * Zéro donnée embarquée au chargement initial.
 *
 * Fix v2.x (workstream 2.3) : le composant est dans le root layout (donc
 * persistant entre les routes). Quand `router.push` provoque le changement
 * de `pathname`, on reset `rolling` → le dé arrête de tourner et l'on peut
 * re-cliquer immédiatement. Le `setTimeout` est référencé via `useRef` pour
 * un cleanup propre (démontage / nouvelle navigation).
 */
export function SurpriseButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [rolling, setRolling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pendingNav = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  // À chaque changement de route : on stoppe le spinner et on annule un
  // éventuel setTimeout en attente (cas où l'utilisateur navigue ailleurs
  // pendant l'animation).
  useEffect(() => {
    if (pendingNav.current !== null) {
      window.clearTimeout(pendingNav.current);
      pendingNav.current = null;
    }
    setRolling(false);
  }, [pathname]);

  // Cleanup au démontage (toujours).
  useEffect(() => {
    return () => {
      if (pendingNav.current !== null) {
        window.clearTimeout(pendingNav.current);
        pendingNav.current = null;
      }
    };
  }, []);

  async function pick() {
    if (rolling) return;
    setRolling(true);
    try {
      const res = await fetch("/api/random-recipe", { cache: "no-store" });
      if (!res.ok) {
        setRolling(false);
        return;
      }
      const { countrySlug, recipeSlug } = (await res.json()) as {
        countrySlug: string;
        recipeSlug: string;
      };
      // Petit délai cosmétique : laisse l'animation tourner avant le push.
      pendingNav.current = window.setTimeout(() => {
        pendingNav.current = null;
        router.push(`/pays/${countrySlug}/${recipeSlug}`);
        // Le `rolling` sera reset par l'effet sur `pathname` à l'arrivée.
      }, 450);
    } catch {
      setRolling(false);
    }
  }

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={pick}
      aria-label="Surprends-moi : recette aléatoire"
      className={clsx(
        "fixed z-30 right-4 bottom-20 md:bottom-6 inline-flex items-center gap-2 h-14 px-5 rounded-full bg-terracotta text-bone shadow-soft-lg hover:bg-terracotta-deep active:scale-95 transition-all duration-150 ease-[var(--ease-soft)]",
        rolling && "animate-pulse"
      )}
    >
      <Dices
        className={clsx("h-5 w-5", rolling && "animate-spin")}
        strokeWidth={2}
      />
      <span className="font-medium text-sm hidden sm:inline">Surprends-moi</span>
    </button>
  );
}

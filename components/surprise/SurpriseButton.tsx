"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { clsx } from "clsx";

/**
 * Bouton "Surprends-moi" — variant lazy.
 *
 * Avant : recevait `recipes` (50 items, ~454 KB) en prop depuis le root
 * layout, qui se sérialisait dans le RSC payload de TOUTES les routes.
 *
 * Après : autonome — au clic, fetch `/api/random-recipe` qui renvoie
 * `{ countrySlug, recipeSlug }` depuis l'index serveur, puis navigue.
 * Zéro données embarquées au chargement initial.
 */
export function SurpriseButton() {
  const router = useRouter();
  const [rolling, setRolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      // Petit délai pour laisser l'animation tourner avant le push.
      window.setTimeout(() => {
        router.push(`/pays/${countrySlug}/${recipeSlug}`);
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
        "fixed z-30 right-4 bottom-20 md:bottom-6 inline-flex items-center gap-2 h-14 px-5 rounded-full bg-terracotta text-bone shadow-soft-lg hover:bg-terracotta-deep active:scale-95 transition-all",
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

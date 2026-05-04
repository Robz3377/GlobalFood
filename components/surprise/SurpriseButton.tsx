"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { clsx } from "clsx";
import type { Country, Recipe } from "@/lib/types";

type Item = { country: Country; recipe: Recipe };

export function SurpriseButton({ recipes }: { recipes: Item[] }) {
  const router = useRouter();
  const [rolling, setRolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function pick() {
    if (!recipes.length || rolling) return;
    setRolling(true);
    const r = recipes[Math.floor(Math.random() * recipes.length)];
    window.setTimeout(() => {
      router.push(`/pays/${r.country.slug}/${r.recipe.slug}`);
    }, 650);
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

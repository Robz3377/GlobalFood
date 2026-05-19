"use client";

import { clsx } from "clsx";
import { Leaf, Carrot, Wheat, Milk } from "lucide-react";
import type { Diet } from "@/lib/types";

export const DIET_OPTIONS: { id: Diet; label: string; icon: React.ElementType }[] = [
  { id: "vegan", label: "Vegan", icon: Leaf },
  { id: "vegetarian", label: "Végétarien", icon: Carrot },
  { id: "gluten-free", label: "Sans gluten", icon: Wheat },
  { id: "dairy-free", label: "Sans lactose", icon: Milk },
];

export function DietFilter({
  value,
  onChange,
}: {
  value: Diet[];
  onChange: (next: Diet[]) => void;
}) {
  function toggle(id: Diet) {
    onChange(value.includes(id) ? value.filter((d) => d !== id) : [...value, id]);
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-ink-soft mr-1">
        Régime :
      </span>
      {DIET_OPTIONS.map((opt) => {
        const active = value.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            aria-pressed={active}
            className={clsx(
              // Plus compact : padding réduit + text-[11px] au lieu de text-xs (12px)
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all duration-200 ease-[var(--ease-soft)] active:scale-95",
              active
                ? "bg-sage text-bone border-sage shadow-soft"
                : "bg-white text-ink border-bone-deep hover:border-sage hover:bg-sage-soft/40"
            )}
          >
            <opt.icon className="h-3 w-3" strokeWidth={1.75} />
            {opt.label}
          </button>
        );
      })}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="ml-1 text-[11px] text-ink-soft hover:text-terracotta-deep transition-colors duration-200 ease-[var(--ease-soft)]"
        >
          Effacer
        </button>
      )}
    </div>
  );
}

export function recipeMatchesDiets<R extends { diets: Diet[] }>(
  recipe: R,
  diets: Diet[]
): boolean {
  if (diets.length === 0) return true;
  return diets.every((d) => recipe.diets.includes(d));
}

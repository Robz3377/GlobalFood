"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { convert, type System } from "@/lib/units";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { ServingsSelector } from "./ServingsSelector";
import type { Ingredient } from "@/lib/types";

const KEY = "mapandfork.unit-system";
const LEGACY_KEY = "global-food.unit-system";

export function RecipeIngredients({
  ingredients,
  servings: baseline,
}: {
  ingredients: Ingredient[];
  servings: number;
}) {
  const [stored, setStored, hydrated] = useLocalStorage<System>(
    KEY,
    "metric",
    LEGACY_KEY
  );
  const [system, setSystem] = useState<System>(stored);
  const [servings, setServings] = useState<number>(baseline);

  function pickSystem(next: System) {
    setSystem(next);
    setStored(next);
  }

  const active: System = hydrated ? stored : system;
  const ratio = servings / baseline;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold">Ingrédients</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <ServingsSelector
            value={servings}
            baseline={baseline}
            setValue={setServings}
          />
          <div
            role="group"
            aria-label="Unités de mesure"
            className="inline-flex rounded-full border border-bone-deep bg-white p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => pickSystem("metric")}
              className={clsx(
                "rounded-full px-3 h-9 font-medium transition-colors",
                active === "metric"
                  ? "bg-sage text-bone shadow-soft"
                  : "text-ink-soft hover:text-ink"
              )}
              aria-pressed={active === "metric"}
            >
              Métrique
            </button>
            <button
              type="button"
              onClick={() => pickSystem("imperial")}
              className={clsx(
                "rounded-full px-3 h-9 font-medium transition-colors",
                active === "imperial"
                  ? "bg-sage text-bone shadow-soft"
                  : "text-ink-soft hover:text-ink"
              )}
              aria-pressed={active === "imperial"}
            >
              Impérial
            </button>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-bone-deep rounded-soft bg-white shadow-soft">
        {ingredients.map((ing, i) => {
          const scaled = ing.qty * ratio;
          const out = convert(scaled, ing.unit, active);
          return (
            <li
              key={`${ing.name}-${i}`}
              className="flex items-baseline justify-between gap-4 px-5 py-3"
            >
              <span className="text-ink">{ing.name}</span>
              <span className="font-serif text-sm font-medium text-terracotta-deep tabular-nums">
                {out.display}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

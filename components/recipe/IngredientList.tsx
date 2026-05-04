import type { Ingredient } from "@/lib/types";

function formatQty(qty: number) {
  if (Number.isInteger(qty)) return String(qty);
  return qty.toFixed(2).replace(/\.?0+$/, "");
}

export function IngredientList({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  return (
    <ul className="divide-y divide-bone-deep rounded-soft bg-white shadow-soft">
      {ingredients.map((ing, i) => (
        <li
          key={`${ing.name}-${i}`}
          className="flex items-baseline justify-between gap-4 px-5 py-3"
        >
          <span className="text-ink">{ing.name}</span>
          <span className="font-serif text-sm font-medium text-terracotta-deep tabular-nums">
            {formatQty(ing.qty)} {ing.unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CookingPot,
  Utensils,
  Soup,
  ChefHat,
  Coffee,
  type LucideIcon,
} from "lucide-react";

/**
 * BackgroundDecor — toile de fond permanente de l'application.
 *
 * Disperse 6 à 8 très grands ustensiles de cuisine (lucide-react) en contour
 * uniquement, alternant ocre et sauge, à 20 % d'opacité.
 *
 * Stratégie anti-hydratation :
 * - Au SSR et au premier render client, le composant rend un wrapper vide.
 * - Les positions/rotations/tailles sont générées dans un useEffect (donc
 *   APRÈS hydratation), ce qui garantit que server-HTML = client-HTML au
 *   moment du diffing React et évite toute erreur d'hydratation Next.js.
 * - Les ustensiles apparaissent ensuite en douceur via une animation CSS
 *   d'opacité (de 0 à 0.2 sur 600 ms).
 *
 * Stacking : `fixed inset-0` + `z-index: -10` + `pointer-events: none` →
 * la décoration ne capture jamais le pointeur et reste sous tout le contenu
 * applicatif tout en restant au-dessus du fond topographique du body.
 */

const ICONS: LucideIcon[] = [CookingPot, Utensils, Soup, ChefHat, Coffee];

/** Palette stricte ocre + sauge (cf. charte design) */
const COLORS = ["#C08552", "#A3B18A"] as const;

type DecorItem = {
  Icon: LucideIcon;
  size: number;
  top: number; // 0-90 (en %)
  left: number; // 0-90 (en %)
  rotation: number; // -35 à +35 deg
  color: string;
};

/** Génère 6-8 ustensiles avec placement totalement désordonné. */
function generateDecor(): DecorItem[] {
  const count = 6 + Math.floor(Math.random() * 3); // 6, 7 ou 8
  const items: DecorItem[] = [];
  for (let i = 0; i < count; i++) {
    const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    items.push({
      Icon,
      size: Math.round(120 + Math.random() * 60), // 120 → 180 px
      top: Math.random() * 90,
      left: Math.random() * 90,
      rotation: Math.round(Math.random() * 70 - 35), // -35 → +35 deg
      color: COLORS[i % COLORS.length], // alterne ocre / sauge
    });
  }
  return items;
}

export function BackgroundDecor() {
  const [decors, setDecors] = useState<DecorItem[]>([]);

  useEffect(() => {
    setDecors(generateDecor());
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 100 }}
    >
      {decors.map((d, i) => {
        const Icon = d.Icon;
        return (
          <Icon
            key={i}
            size={d.size}
            strokeWidth={2}
            fill="none"
            color={d.color}
            absoluteStrokeWidth={false}
            style={{
              position: "absolute",
              top: `${d.top}%`,
              left: `${d.left}%`,
              transform: `rotate(${d.rotation}deg)`,
              opacity: 1,
              transition: "opacity 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />
        );
      })}
    </div>
  );
}

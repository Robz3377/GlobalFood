"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CookingPot,
  Utensils,
  Soup,
  ChefHat,
  Coffee,
  type LucideIcon,
} from "lucide-react";

/**
 * BackgroundDecor — texture de fond fixe et épurée.
 *
 * Disperse 10 à 12 ustensiles (lucide-react) en contour très fin (1.2 px)
 * sur tout le viewport. Reste immobile pendant le scroll grâce à
 * `position: fixed`.
 *
 * Stacking :
 * - z-index: 0 + DOM order : placé AVANT le contenu dans <body>
 * - Les sections avec bg opaque (.bg-paper-card, .bg-warm-gradient) couvrent
 *   les icônes dans leur rectangle, mais les icônes restent visibles dans
 *   les marges/espaces entre les blocs (effet "papier sur table de travail")
 * - Le body bg (#FAF7F2 + pattern-topo SVG) reste DERRIÈRE ces icônes
 *
 * Anti-hydratation Next.js :
 * - SSR + 1er render client : wrapper vide
 * - Génération aléatoire dans useEffect (dépend de pathname → nouveau
 *   placement à chaque navigation Home/Frigo/Recette)
 * - Transition opacity 500ms pour un fondu fluide entre placements
 */

const ICONS: LucideIcon[] = [CookingPot, Utensils, Soup, ChefHat, Coffee];

/** Palette stricte ocre + sauge (charte design) */
const COLORS = ["#C08552", "#A3B18A"] as const;

type DecorItem = {
  Icon: LucideIcon;
  size: number;
  top: number;
  left: number;
  color: string;
};

function generateDecor(): DecorItem[] {
  // 10, 11 ou 12 icônes pour bien couvrir le viewport
  const count = 10 + Math.floor(Math.random() * 3);
  const items: DecorItem[] = [];
  for (let i = 0; i < count; i++) {
    const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
    items.push({
      Icon,
      size: Math.round(80 + Math.random() * 30), // 80 → 110 px
      top: Math.random() * 92,
      left: Math.random() * 92,
      color: COLORS[i % COLORS.length], // alternance ocre / sauge
    });
  }
  return items;
}

export function BackgroundDecor() {
  const pathname = usePathname();
  const [decors, setDecors] = useState<DecorItem[]>([]);

  useEffect(() => {
    // Re-randomisation à chaque changement de route
    setDecors(generateDecor());
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {decors.map((d, i) => {
        const Icon = d.Icon;
        return (
          <Icon
            key={`${pathname}-${i}`}
            size={d.size}
            strokeWidth={1.2}
            fill="none"
            color={d.color}
            absoluteStrokeWidth={false}
            style={{
              position: "absolute",
              top: `${d.top}%`,
              left: `${d.left}%`,
              opacity: 0.15,
              transition: "opacity 500ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />
        );
      })}
    </div>
  );
}

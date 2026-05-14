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
 * BackgroundDecor — texture de fond structurée en quinconce.
 *
 * Remplace la dispersion aléatoire par une grille décalée (honeycomb-like) :
 * - Lignes parfaitement horizontales
 * - Espacement X et Y égaux à l'intérieur de chaque ligne
 * - Décalage horizontal de hSpacing/2 pour les lignes paires (quinconce)
 * - 12 à 15 icônes au total selon le ratio du viewport
 * - Recalcul dynamique au resize de la fenêtre
 *
 * Le point de départ de l'alternance ocre/sauge dépend de pathname.length,
 * donc chaque changement de page produit un motif visuellement différent
 * tout en gardant la structure quinconce.
 */

const ICONS: LucideIcon[] = [CookingPot, Utensils, Soup, ChefHat, Coffee];

/** Palette stricte ocre + sauge */
const COLORS = ["#C08552", "#A3B18A"] as const;

type DecorItem = {
  Icon: LucideIcon;
  size: number;
  x: number; // px depuis le bord gauche du viewport
  y: number; // px depuis le bord haut du viewport
  color: string;
};

/**
 * Génère une grille en quinconce de 12-15 ustensiles couvrant le viewport.
 *
 * Algorithme :
 * 1. Choisit cols × rows pour matcher l'aspect ratio et viser ~13 cellules
 * 2. Calcule hSpacing = width/cols, vSpacing = height/rows
 * 3. Pour chaque ligne r :
 *    - Lignes paires (r % 2 === 0) : xStart = hSpacing/2 (centre des cellules)
 *    - Lignes impaires : xStart = hSpacing (décalage = hSpacing/2)
 * 4. Skip toute icône dont le centre dépasse les bords (overflow esthétique)
 */
function generateGrid(
  width: number,
  height: number,
  pathOffset: number
): DecorItem[] {
  if (width === 0 || height === 0) return [];

  const targetCount = 13;
  const aspectRatio = Math.max(0.3, width / height);

  // rows × cols ≈ targetCount avec cols/rows ≈ aspectRatio
  const rows = Math.max(3, Math.round(Math.sqrt(targetCount / aspectRatio)));
  const cols = Math.max(3, Math.round(targetCount / rows));

  const hSpacing = width / cols;
  const vSpacing = height / rows;

  const items: DecorItem[] = [];
  let idx = 0;

  for (let r = 0; r < rows; r++) {
    const isEvenRow = r % 2 === 0;
    const xStart = isEvenRow ? hSpacing / 2 : hSpacing;

    for (let c = 0; c < cols; c++) {
      const xPos = xStart + c * hSpacing;
      // Skip si le centre est trop près du bord droit (overflow visuel)
      if (xPos > width - 30) continue;

      const yPos = vSpacing / 2 + r * vSpacing;
      const seed = idx + pathOffset;

      items.push({
        Icon: ICONS[seed % ICONS.length],
        size: 90 + (seed % 3) * 10, // 90, 100 ou 110 px
        x: xPos,
        y: yPos,
        color: COLORS[(r + c + pathOffset) % COLORS.length],
      });
      idx++;
    }
  }

  return items;
}

export function BackgroundDecor() {
  const pathname = usePathname();
  const [decors, setDecors] = useState<DecorItem[]>([]);

  useEffect(() => {
    function update() {
      setDecors(
        generateGrid(window.innerWidth, window.innerHeight, pathname.length)
      );
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
              top: `${d.y}px`,
              left: `${d.x}px`,
              transform: "translate(-50%, -50%)",
              opacity: 0.15,
            }}
          />
        );
      })}
    </div>
  );
}

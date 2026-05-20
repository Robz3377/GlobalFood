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
 * BackgroundDecor — motif "papier peint" micro-texturé.
 *
 * Grille quinconce dense de petites icônes (40-50 px) couvrant tout le
 * viewport. Densité calibrée pour 50-60 icônes sur mobile portrait (375×800),
 * et scale naturellement sur viewports plus larges (cellule fixe de 70 px).
 *
 * Lignes paires alignées | Lignes impaires décalées de hSpacing/2 → effet
 * honeycomb avec aucune superposition. Spacing serré (cellule 70 px ⊃ icône
 * 40-50 px = 20-30 px de gap visuel).
 *
 * Couleurs alternent ocre/sauge, point de départ = pathname.length, donc
 * chaque page produit un damier visiblement différent.
 */

const ICONS: LucideIcon[] = [CookingPot, Utensils, Soup, ChefHat, Coffee];

/**
 * Palette refonte v2 — cannelle douce (#D7CCC8) uniquement, monochrome.
 * Le motif "papier peint" devient encore plus subtil pour ne pas concurrencer
 * la nouvelle palette appétissante (oranges/jaunes saturés au premier plan).
 */
const COLORS = ["#D7CCC8"] as const;

/**
 * Taille de cellule de référence — sur mobile 375 px de large : 5 colonnes
 * (375/70=5.36 → 5), 11 rangées (800/70=11.4 → 11), pattern quinconce
 * 5+4+5+4+5+4+5+4+5+4+5 = 50 icônes.
 */
const CELL_SIZE = 70;

type DecorItem = {
  Icon: LucideIcon;
  size: number;
  x: number;
  y: number;
  color: string;
};

function generateGrid(
  width: number,
  height: number,
  pathOffset: number
): DecorItem[] {
  if (width === 0 || height === 0) return [];

  // Nombre de cellules en X et Y basé sur la cellule de référence
  const cols = Math.max(3, Math.round(width / CELL_SIZE));
  const rows = Math.max(3, Math.round(height / CELL_SIZE));

  const hSpacing = width / cols;
  const vSpacing = height / rows;

  const items: DecorItem[] = [];
  let idx = 0;

  for (let r = 0; r < rows; r++) {
    const isEvenRow = r % 2 === 0;
    const xStart = isEvenRow ? hSpacing / 2 : hSpacing;

    for (let c = 0; c < cols; c++) {
      const xPos = xStart + c * hSpacing;
      // Skip si le centre est trop près du bord droit (clip esthétique)
      if (xPos > width - 25) continue;

      const yPos = vSpacing / 2 + r * vSpacing;
      const seed = idx + pathOffset;

      items.push({
        Icon: ICONS[seed % ICONS.length],
        size: 40 + (seed % 3) * 5, // 40, 45 ou 50 px
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
  const [decors, setDecors] = useState<DecorItem[]>([]);

  // La grille de décor est INDÉPENDANTE du pathname (workstream 1.5) :
  // un fond ambiant n'a aucune raison de se régénérer à chaque navigation.
  // On reste à l'écoute de `resize` uniquement. Seed = 0 (stable).
  useEffect(() => {
    function update() {
      setDecors(generateGrid(window.innerWidth, window.innerHeight, 0));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
            key={i}
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
              // Opacity réduite de 0.20 → 0.12 pour laisser respirer la
              // nouvelle palette appétissante au premier plan.
              opacity: 0.12,
            }}
          />
        );
      })}
    </div>
  );
}

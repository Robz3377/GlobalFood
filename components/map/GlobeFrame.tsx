"use client";

import type { ReactNode } from "react";
import { usePassport } from "@/lib/hooks/usePassport";

/**
 * GlobeFrame — wrapper "carnet de voyage" autour du globe 3D.
 *
 * Habille le vide autour du globe pour préserver l'univers Map and Fork :
 *   • Grille de coordonnées géographiques fines (méridiens + parallèles)
 *   • Fragments de tampons de douane circulaires à 10% d'opacité
 *   • Rose des vents stylisée marron chocolat dans un angle
 *   • Mini compteur de pays explorés (typographie serif, hook usePassport)
 *
 * Tout est en SVG inline (zéro requête HTTP, ultra rapide sur mobile).
 * Les décorations sont en position absolute, ne bloquent jamais les
 * pointer-events du globe (pointer-events-none partout).
 */
export function GlobeFrame({
  children,
  totalCountries,
}: {
  children: ReactNode;
  totalCountries: number;
}) {
  const { count, hydrated } = usePassport();
  return (
    <div className="relative rounded-soft-xl bg-paper-card overflow-hidden shadow-paper">
      {/* === DÉCOR DE FOND (z=0, sous le globe) ===
          Tout en SVG inline. pointer-events-none pour ne jamais intercepter. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* (1) Grille de coordonnées géographiques très fines (méridiens
            + parallèles), chocolat 6% opacity, type carte ancienne. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <g
            fill="none"
            stroke="#3E2723"
            strokeOpacity="0.06"
            strokeWidth="0.5"
          >
            {/* Méridiens verticaux */}
            {Array.from({ length: 13 }, (_, i) => 50 + i * 42).map((x) => (
              <line key={`m${x}`} x1={x} y1="0" x2={x} y2="400" />
            ))}
            {/* Parallèles horizontaux */}
            {Array.from({ length: 9 }, (_, i) => 50 + i * 38).map((y) => (
              <line key={`p${y}`} x1="0" y1={y} x2="600" y2={y} />
            ))}
          </g>
          {/* Légendes degré (très petites, à 4 coins) */}
          <g
            fill="#3E2723"
            fillOpacity="0.18"
            fontFamily="var(--font-fraunces), serif"
            fontStyle="italic"
            fontSize="7"
          >
            <text x="6" y="14">90° N</text>
            <text x="6" y="395">90° S</text>
            <text x="555" y="14">180° E</text>
            <text x="5" y="395" textAnchor="start" dx="540">
              180° W
            </text>
          </g>
        </svg>

        {/* (2) Fragments de tampons de douane circulaires (cannelle, 10%) ;
            quatre dans des angles aléatoires. Style "passeport tamponné". */}
        <CustomsStamp
          className="absolute -top-6 -left-6"
          size={140}
          rotation={-12}
          text="MAP·AND·FORK·CUSTOMS"
          inner="VOYAGE"
        />
        <CustomsStamp
          className="absolute -bottom-8 -right-10"
          size={180}
          rotation={18}
          text="GASTRONOMIE·DU·MONDE"
          inner="VISA"
        />
        <CustomsStamp
          className="absolute top-1/3 -right-12 hidden md:block"
          size={120}
          rotation={32}
          text="DESTINATION·VALIDÉE"
          inner="✦"
        />

        {/* (3) Rose des vents stylisée marron chocolat dans le coin
            inférieur-gauche. Symbole carnet d'aventurier. */}
        <CompassRose className="absolute bottom-3 left-3 md:bottom-5 md:left-5" />
      </div>

      {/* === GLOBE (z=10, au-dessus du décor) === */}
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>

      {/* === COMPTEUR DE STATISTIQUES (coin supérieur droit) ===
          Typographie serif, "tampon de bord". Lit le passeport localStorage
          via usePassport. Avant hydratation : valeur masquée pour éviter
          l'effet de "saut" SSR → client. */}
      <div
        className="absolute top-3 right-3 md:top-4 md:right-4 z-20 pointer-events-none select-none rounded-soft border border-chocolate/15 bg-bone/85 backdrop-blur px-3 py-2 shadow-warm"
        aria-label="Statistiques d'exploration"
      >
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-soft font-medium">
          Carnet
        </div>
        <div className="font-serif text-xl md:text-2xl font-semibold leading-none text-ink mt-0.5 tabular-nums">
          {hydrated ? count : "—"}{" "}
          <span className="text-ink-soft text-sm font-normal">
            / {totalCountries}
          </span>
        </div>
        <div className="font-serif italic text-[10px] text-ink-soft mt-0.5">
          pays explorés
        </div>
      </div>
    </div>
  );
}

/**
 * Tampon de douane circulaire — texte courbé autour, motif central.
 * Couleur cannelle à 10% d'opacité pour un effet "papier marqué".
 */
function CustomsStamp({
  className,
  size,
  rotation,
  text,
  inner,
}: {
  className?: string;
  size: number;
  rotation: number;
  text: string;
  inner: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity: 0.1,
      }}
    >
      <defs>
        <path
          id={`circle-${size}-${rotation}`}
          d="M 100 100 m -78 0 a 78 78 0 1 1 156 0 a 78 78 0 1 1 -156 0"
        />
      </defs>
      <g fill="none" stroke="#3E2723" strokeWidth="2">
        <circle cx="100" cy="100" r="90" />
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="58" strokeDasharray="3 4" />
      </g>
      <text
        fill="#3E2723"
        fontSize="11"
        letterSpacing="2"
        fontWeight="600"
      >
        <textPath
          xlinkHref={`#circle-${size}-${rotation}`}
          startOffset="0"
        >
          {text}·{text}
        </textPath>
      </text>
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fill="#3E2723"
        fontFamily="var(--font-fraunces), serif"
        fontWeight="700"
        fontSize="24"
        letterSpacing="2"
      >
        {inner}
      </text>
    </svg>
  );
}

/**
 * Rose des vents — symbole carnet d'aventurier. N/S/E/O, marron chocolat,
 * stroke fin sans remplissage pour un look "trait à la plume".
 */
function CompassRose({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={64}
      height={64}
      viewBox="0 0 100 100"
      style={{ opacity: 0.55 }}
      aria-hidden
    >
      <g fill="none" stroke="#3E2723" strokeWidth="1.3" strokeLinejoin="round">
        {/* Étoile principale : pétales N/S/E/O */}
        <polygon points="50,8 56,46 50,50 44,46" fill="#3E2723" />
        <polygon points="50,92 56,54 50,50 44,54" fill="#6D4C41" />
        <polygon points="8,50 46,44 50,50 46,56" />
        <polygon points="92,50 54,44 50,50 54,56" />
        {/* Petits pétales NE/SE/NW/SW */}
        <polygon
          points="78,22 56,40 50,50 60,44"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <polygon
          points="22,22 44,40 50,50 40,44"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <polygon
          points="22,78 44,60 50,50 40,56"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <polygon
          points="78,78 56,60 50,50 60,56"
          strokeWidth="0.8"
          opacity="0.7"
        />
        {/* Cercle externe */}
        <circle cx="50" cy="50" r="44" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="38" strokeWidth="0.4" opacity="0.5" />
      </g>
      {/* Cardinaux N/S/E/O en serif italic */}
      <g
        fill="#3E2723"
        fontFamily="var(--font-fraunces), serif"
        fontStyle="italic"
        fontSize="8"
        fontWeight="600"
        textAnchor="middle"
      >
        <text x="50" y="6">N</text>
        <text x="50" y="98">S</text>
        <text x="98" y="53" textAnchor="end">E</text>
        <text x="4" y="53" textAnchor="start">O</text>
      </g>
    </svg>
  );
}

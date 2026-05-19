"use client";

import { useContext, useRef, type ReactNode } from "react";
// ⚠️ Import INTERNE Next.js. Indispensable au pattern « FrozenRouter » :
// sans lui, l'App Router démonte/vide l'arbre de la page sortante dès le
// changement de route → l'animation de SORTIE (AnimatePresence) ne montre
// rien. On gèle la valeur du LayoutRouterContext au 1er rendu de l'instance
// de route et on la re-fournit pendant toute la durée de l'exit.
//
// Risque : chemin interne non garanti entre versions de Next. Isolé ICI
// volontairement ; Next est épinglé (16.2.4). Si un upgrade casse l'import,
// ce fichier est le seul point à corriger.
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // useRef(...).current fige la valeur capturée au montage de cette instance
  // (clé = pathname côté AnimatePresence) ; elle ne change plus ensuite.
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

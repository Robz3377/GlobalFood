"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useNavDirection, type NavDirection } from "@/lib/navigation/useNavDirection";
import { FrozenRouter } from "./FrozenRouter";

/**
 * Transitions de page directionnelles (ressenti UINavigationController iOS /
 * Marmiton) :
 *  - forward : la nouvelle page entre depuis la DROITE, l'ancienne recule
 *              (~25 %) — pure parallaxe par translation.
 *  - back    : symétrique, depuis la GAUCHE.
 *  - fade    : crossfade (navigations latérales / même profondeur,
 *              prefers-reduced-motion).
 *
 * === FIX BAVUR-VISUEL (mobile) ===
 *  1. Fond OPAQUE `bg-bone` sur CHAQUE motion.div → la page entrante masque
 *     totalement la sortante pendant le slide (plus de texte qui transparaît
 *     à travers les bavures de transparence).
 *  2. z-index STRICT via variants : entrante = Z_ACTIVE (au-dessus),
 *     sortante = Z_LEAVING (en dessous). Bascule INSTANTANÉE
 *     (`transition.zIndex.duration = 0`) — jamais d'intermédiaire animé.
 *  3. L'opacité de la page sortante reste à 1 (pas de fade 0.6) : la
 *     superposition z-index suffit à masquer, on évite le double-rendu
 *     translucide qui causait le bavement.
 *  4. `isolation: isolate` crée un stacking context propre, à l'abri des
 *     z-index ambiants (Header sticky z-30, BottomNav z-40).
 *  5. `mode="popLayout"` : la page sortante quitte le flux → la page
 *     entrante donne seule la hauteur, aucun saut.
 *
 * === Perf ===
 *  - `will-change: transform, opacity` + `translateZ(0)` → promotion GPU.
 *  - `contain: layout paint` sur le conteneur → reflows isolés.
 *  - Effet de scroll-reset dépendant SEULEMENT de `pathname` (direction
 *    lue via ref).
 */

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

// Ordre d'empilement STRICT pendant la transition.
const Z_ACTIVE = 2; // page entrante / centrée → DEVANT
const Z_LEAVING = 1; // page sortante → DERRIÈRE (masquée par l'entrante opaque)

const variants: Variants = {
  enter: (dir: NavDirection) =>
    dir === "fade"
      ? { opacity: 0, x: 0, zIndex: Z_ACTIVE }
      : {
          x: dir === "forward" ? "100%" : "-100%",
          opacity: 1,
          zIndex: Z_ACTIVE,
        },
  center: { x: 0, opacity: 1, zIndex: Z_ACTIVE },
  exit: (dir: NavDirection) =>
    dir === "fade"
      ? { opacity: 0, x: 0, zIndex: Z_LEAVING }
      : {
          // Parallaxe : la page sortante recule de 25 % SANS perdre en
          // opacité. C'est l'entrante (opaque, par-dessus) qui la masque.
          x: dir === "forward" ? "-25%" : "25%",
          opacity: 1,
          zIndex: Z_LEAVING,
        },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const direction = useNavDirection();

  const directionRef = useRef(direction);
  directionRef.current = direction;
  useEffect(() => {
    if (directionRef.current === "forward") window.scrollTo(0, 0);
  }, [pathname]);

  const duration = direction === "fade" ? 0.22 : 0.34;

  return (
    <div
      className="relative w-full overflow-x-clip bg-bone"
      style={{ contain: "layout paint", isolation: "isolate" }}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration,
            ease: EASE,
            // z-index bascule instantanément (jamais interpolé) — empêche
            // tout chevauchement visible entre les couches.
            zIndex: { duration: 0 },
          }}
          // bg-bone OPAQUE : aucun bavement de texte de la page sortante
          // à travers l'entrante. min-h-screen évite un fond clair sur les
          // pages courtes pendant l'animation initiale.
          className="w-full bg-bone min-h-screen"
          style={{
            willChange: "transform, opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

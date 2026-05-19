"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useNavDirection, type NavDirection } from "@/lib/navigation/useNavDirection";
import { FrozenRouter } from "./FrozenRouter";

/**
 * Transitions de page directionnelles (ressenti UINavigationController iOS /
 * Marmiton) :
 *  - forward : la nouvelle page entre depuis la DROITE, l'ancienne recule
 *              (~25 %) avec un voile (parallaxe).
 *  - back    : symétrique, depuis la GAUCHE.
 *  - fade    : crossfade (navigations latérales / même profondeur,
 *              prefers-reduced-motion).
 *
 * `mode="popLayout"` : framer-motion sort la page sortante du flux (position
 * absolue) → la page entrante donne seule la hauteur, aucun saut de layout.
 */

// Courbe = --ease-soft (cubic-bezier(0.2, 0.8, 0.2, 1)).
const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const variants: Variants = {
  enter: (dir: NavDirection) =>
    dir === "fade"
      ? { opacity: 0, x: 0 }
      : { x: dir === "forward" ? "100%" : "-100%", opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: (dir: NavDirection) =>
    dir === "fade"
      ? { opacity: 0, x: 0 }
      : { x: dir === "forward" ? "-25%" : "25%", opacity: 0.6 },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const direction = useNavDirection();

  // Sécurité : en navigation « avant », la nouvelle page démarre en haut.
  // (Next gère déjà le scroll, mais l'overlap popLayout peut le perturber.)
  useEffect(() => {
    if (direction === "forward") window.scrollTo(0, 0);
  }, [pathname, direction]);

  const duration = direction === "fade" ? 0.22 : 0.34;

  return (
    <div className="relative w-full overflow-x-clip">
      <AnimatePresence
        mode="popLayout"
        initial={false}
        custom={direction}
      >
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease: EASE }}
          className="w-full"
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

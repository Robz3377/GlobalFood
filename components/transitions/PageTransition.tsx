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
 *              (~25 %) avec un voile (parallaxe).
 *  - back    : symétrique, depuis la GAUCHE.
 *  - fade    : crossfade (navigations latérales / même profondeur,
 *              prefers-reduced-motion).
 *
 * `mode="popLayout"` : framer-motion sort la page sortante du flux (position
 * absolue) → la page entrante donne seule la hauteur, aucun saut de layout.
 *
 * Optims perf (workstream 1.1) :
 *  - `will-change: transform, opacity` + `transform: translateZ(0)` →
 *    promotion compositeur GPU forcée, supprime le stutter iOS Safari/Chrome.
 *  - `contain: layout paint` sur le conteneur → isolement des reflows
 *    pendant le slide.
 *  - Effet de scroll-reset déclenché par `pathname` SEUL ; on lit `direction`
 *    via une ref pour éviter qu'une recalcul du hook ne le tire en double.
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

  // Direction lue via une ref dans l'effet → un re-render du hook qui ne
  // change pas le pathname ne re-déclenche pas le scroll.
  const directionRef = useRef(direction);
  directionRef.current = direction;
  useEffect(() => {
    if (directionRef.current === "forward") window.scrollTo(0, 0);
  }, [pathname]);

  const duration = direction === "fade" ? 0.22 : 0.34;

  return (
    <div
      className="relative w-full overflow-x-clip"
      style={{ contain: "layout paint" }}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease: EASE }}
          className="w-full"
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

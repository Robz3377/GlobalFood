"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SplashScreen — écran d'introduction d'EXACTEMENT 1 seconde au premier
 * paint de l'app.
 *
 * Cycle (1000 ms total) :
 *   • t=0      : opacity 0 (mount instantané)
 *   • t→300ms  : fade-in vers opacity 1
 *   • t=700ms  : début du fade-out
 *   • t=1000ms : fade-out terminé → unmount + retire les pointer-events
 *
 * Visibilité : à CHAQUE visite (pas seulement la première). Choix UX :
 *   • L'animation dure 1s donc reste discrète
 *   • Donne un effet "produit fini" cohérent
 *   • Pas de blocage UX : `pointer-events-none` dès la fin du fade-out,
 *     l'utilisateur peut interagir avec la page dessous pendant les 300ms
 *     de fade-out final.
 *
 * SSR-safe : Client Component, ne rend rien tant que `mounted=false`.
 * Pas de FOUC car le composant est dans le root layout (rendu serveur
 * → opacity:0 initial → hydration côté client active le timer).
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "fadein" | "visible" | "fadeout" | "done">("hidden");

  useEffect(() => {
    // Cycle d'1 seconde : fade-in (300ms) → tenu (400ms) → fade-out (300ms).
    const t1 = window.setTimeout(() => setPhase("fadein"), 0);
    const t2 = window.setTimeout(() => setPhase("visible"), 300);
    const t3 = window.setTimeout(() => setPhase("fadeout"), 700);
    const t4 = window.setTimeout(() => setPhase("done"), 1000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  if (phase === "done") return null;

  const opacity = phase === "fadein" || phase === "visible" ? 1 : 0;
  // À ce stade phase !== "done" (early return ci-dessus). On considère que
  // la couche est interactive (pointer-events: auto) sauf pendant le
  // fade-out où on les coupe pour ne pas bloquer les clics dessous.
  const interactive = phase !== "fadeout";

  return (
    <div
      aria-hidden="true"
      style={{
        opacity,
        transition: "opacity 300ms ease-out",
        pointerEvents: interactive ? "auto" : "none",
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bone"
    >
      <div className="flex flex-col items-center gap-5">
        <span className="relative inline-flex h-24 w-24 overflow-hidden rounded-full ring-1 ring-bone-deep bg-bone-deep shadow-warm">
          <Image
            src="/images/logo-mapandfork.png"
            alt=""
            fill
            priority
            sizes="96px"
            className="object-cover"
            style={{ objectPosition: "center 25%" }}
          />
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-ink">
          Map and Fork
        </h1>
        <p className="font-serif italic text-sm text-ink-soft">
          Cuisine du monde
        </p>
      </div>
    </div>
  );
}

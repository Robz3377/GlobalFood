"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SplashScreen — voile d'introduction COURT (450 ms) au PREMIER PAINT
 * de la session uniquement.
 *
 * Cycle : fade-in 150 ms → tenu 150 ms → fade-out 150 ms → unmount.
 * Phases déclenchées via `requestAnimationFrame` pour rester alignées sur
 * les frames de peinture.
 *
 * Gates :
 *  - `pointer-events: none` dès le mount (purement visuel — n'intercepte
 *    jamais les clics).
 *  - `sessionStorage["mapandfork.splash-seen"]` : skip pour toutes les
 *    navigations suivantes dans la même session → plus de « rideau » à
 *    chaque clic SPA.
 *  - `prefers-reduced-motion: reduce` → bypass complet (jamais affiché).
 */
const SESSION_KEY = "mapandfork.splash-seen";
const FADE_MS = 150;
const HOLD_MS = 150;

type Phase = "hidden" | "fadein" | "visible" | "fadeout" | "done";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    // Skip si déjà vu dans la session OU si l'utilisateur préfère moins
    // d'animations.
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setPhase("done");
        return;
      }
    } catch {
      /* sessionStorage indisponible — on tente quand même le splash */
    }
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("done");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    // rAF imbriqués + setTimeout pour les phases — alignés sur frames.
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      setPhase("fadein");
      timers.push(
        window.setTimeout(() => !cancelled && setPhase("visible"), FADE_MS)
      );
      timers.push(
        window.setTimeout(
          () => !cancelled && setPhase("fadeout"),
          FADE_MS + HOLD_MS
        )
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setPhase("done");
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* noop */
          }
        }, FADE_MS + HOLD_MS + FADE_MS)
      );
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      for (const t of timers) window.clearTimeout(t);
    };
  }, []);

  if (phase === "done" || phase === "hidden") return null;

  const opacity = phase === "fadein" || phase === "visible" ? 1 : 0;

  return (
    <div
      aria-hidden="true"
      style={{
        opacity,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: "none",
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

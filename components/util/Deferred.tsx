"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Monte ses enfants de façon différée pour ne pas charger des composants
 * lourds pendant une animation/navigation.
 *
 * - Par défaut : `requestIdleCallback` (fallback `setTimeout(350)`).
 * - `untilVisible` : monte uniquement quand le placeholder est dans le
 *   viewport (IntersectionObserver). Idéal pour les blocs « bas de page »
 *   comme `RecipeFeedback` (qui lance 2 fetchs au mount).
 * - `prefers-reduced-motion` : monte immédiatement (l'utilisateur attend
 *   un comportement direct).
 */
export function Deferred({
  children,
  untilVisible = false,
  /** Marge déclenchant le mount avant l'entrée réelle dans le viewport. */
  rootMargin = "200px",
  /** Hauteur minimale du placeholder pour ne pas casser la mise en page. */
  placeholderClassName = "min-h-[160px]",
}: {
  children: ReactNode;
  untilVisible?: boolean;
  rootMargin?: string;
  placeholderClassName?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState<boolean>(false);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setMounted(true);
      return;
    }

    if (untilVisible) {
      const el = placeholderRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setMounted(true);
            io.disconnect();
          }
        },
        { rootMargin }
      );
      io.observe(el);
      return () => io.disconnect();
    }

    // Idle / fallback
    const win = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(() => setMounted(true), { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(() => setMounted(true), 350);
    }

    return () => {
      if (idleId !== null && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [reducedMotion, untilVisible, rootMargin]);

  if (mounted) return <>{children}</>;
  return <div ref={placeholderRef} className={placeholderClassName} aria-hidden />;
}

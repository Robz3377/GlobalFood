"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Visual aspect ratio class for the wrapper (e.g. "aspect-[4/3]"). */
  aspect?: string;
  /** Above-the-fold image: load eagerly with high fetch priority. */
  priority?: boolean;
  /**
   * Responsive sizes hint for the browser. Override per-caller pour un
   * srcset précis. Défaut visant les grilles 3-up sur desktop.
   */
  sizes?: string;
  /**
   * Qualité Next/Image (1-100). Élevée par défaut (88) pour valoriser le
   * visuel — c'est l'élément principal d'une fiche recette. La taille
   * AVIF/WebP reste raisonnable même à 88.
   */
  quality?: number;
};

const DEFAULT_SIZES =
  "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export function RecipeImage({
  src,
  alt,
  className,
  aspect,
  priority = false,
  sizes = DEFAULT_SIZES,
  quality = 88,
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={clsx(
        // Fond bone-deep plus neutre que sage (évite un flash vert pendant
        // le chargement d'une photo plat qui sera majoritairement chaude).
        "relative overflow-hidden bg-bone-deep",
        aspect,
        className
      )}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      )}
    </div>
  );
}

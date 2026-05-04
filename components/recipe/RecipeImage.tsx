"use client";

import { useState } from "react";
import { clsx } from "clsx";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Visual aspect ratio class for the wrapper (e.g. "aspect-[4/3]"). */
  aspect?: string;
  /** When true, the image isn't lazy-loaded (use for hero / above-the-fold). */
  priority?: boolean;
};

/**
 * Local image renderer.
 *
 * - Plain <img> with native lazy-loading so it never competes with the
 *   WebGL globe for main-thread time.
 * - If the file is missing in /public/images/, we hide the broken <img>
 *   and let the sage-green wrapper bg show through.
 */
export function RecipeImage({
  src,
  alt,
  className,
  aspect,
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-sage",
        aspect,
        className
      )}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

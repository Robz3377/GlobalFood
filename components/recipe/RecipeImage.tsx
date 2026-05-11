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
   * Responsive sizes hint for the browser. Override per-caller for accurate
   * srcset selection. Default targets 3-up grids on desktop.
   */
  sizes?: string;
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
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      )}
    </div>
  );
}

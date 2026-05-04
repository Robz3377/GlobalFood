import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "sage" | "ochre" | "terracotta" | "neutral";

const tones: Record<Tone, string> = {
  sage: "bg-sage-soft text-ink",
  ochre: "bg-ochre-soft text-ink",
  terracotta: "bg-terracotta/15 text-terracotta-deep",
  neutral: "bg-bone-deep text-ink-soft",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

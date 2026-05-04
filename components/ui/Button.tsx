import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-terracotta text-bone hover:bg-terracotta-deep active:scale-[0.98] shadow-soft",
  ghost:
    "bg-transparent text-ink border border-ink/15 hover:bg-bone-deep hover:border-ink/25",
  soft: "bg-sage-soft text-ink hover:bg-sage hover:text-bone shadow-soft",
};

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-2 rounded-soft px-5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

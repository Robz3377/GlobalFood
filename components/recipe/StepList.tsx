/**
 * StepList — étapes de recette dans un style "magazine de cuisine de luxe".
 *
 * Chaque étape utilise un grand chiffre serif italique en terracotta (drop-cap
 * style) sur la gauche, le texte serif-light à droite pour une lecture posée.
 * Une fine ligne sage sépare les étapes (signature visuelle du design system).
 */
export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li
            key={i}
            className="relative grid grid-cols-[3.5rem_1fr] md:grid-cols-[5rem_1fr] gap-4 md:gap-6 pb-7 md:pb-10"
          >
            {/* Chiffre drop-cap */}
            <span
              aria-hidden
              className="font-serif italic text-5xl md:text-6xl font-semibold text-terracotta leading-none tabular-nums text-right pr-0.5 -mt-1"
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>

            {/* Trait vertical sage entre les étapes (sauf après la dernière) */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[1.65rem] md:left-[2.4rem] top-12 md:top-14 bottom-0 w-px bg-sage-soft"
              />
            )}

            {/* Texte de l'étape */}
            <p className="text-ink text-base md:text-lg leading-relaxed pt-3 md:pt-3.5">
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

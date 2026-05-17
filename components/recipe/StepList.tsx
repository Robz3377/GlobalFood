/**
 * StepList — étapes de recette dans un style "magazine de cuisine de luxe".
 *
 * Chaque étape utilise un grand chiffre serif italique en terracotta (drop-cap
 * style) sur la gauche, le texte serif-light à droite pour une lecture posée.
 * Une fine ligne sage sépare les étapes (signature visuelle du design system).
 *
 * Refonte UX v2.3 : police instructions réduite (text-[15px] mobile, text-base
 * desktop au lieu de text-base/text-lg), gouttières resserrées et chiffre
 * drop-cap recalibré pour gagner ~15% de surface texte → moins de lignes par
 * étape → meilleure scannabilité.
 */
export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li
            key={i}
            // Gouttière gauche réduite : 2.75rem mobile (vs 3.5) / 4rem desktop
            // (vs 5rem). Donne ~12-16px de plus à la colonne texte.
            className="relative grid grid-cols-[2.75rem_1fr] md:grid-cols-[4rem_1fr] gap-3 md:gap-5 pb-5 md:pb-7"
          >
            {/* Chiffre drop-cap — taille légèrement réduite pour matcher
                la nouvelle compacité du texte. */}
            <span
              aria-hidden
              className="font-serif italic text-4xl md:text-5xl font-semibold text-terracotta leading-none tabular-nums text-right pr-0.5 -mt-0.5"
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>

            {/* Trait vertical sage entre les étapes (sauf après la dernière) */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[1.3rem] md:left-[1.95rem] top-10 md:top-12 bottom-0 w-px bg-sage-soft"
              />
            )}

            {/* Texte de l'étape — text-[15px] mobile / text-base desktop,
                leading-relaxed conservé pour le confort de lecture. */}
            <p className="text-ink text-[15px] md:text-base leading-relaxed pt-2 md:pt-2.5">
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * FloatingDecor — éléments décoratifs flottants autour du globe 3D.
 *
 * 8 emojis (épices, ustensiles, ingrédients-clés) en position: absolute autour
 * du conteneur du globe. Chacun a son propre délai et sa propre rotation pour
 * éviter l'effet "tous synchronisés". Animation `float` douce 6s définie dans
 * `app/globals.css`.
 *
 * Le composant est purement décoratif (aria-hidden, pointer-events: none) — il
 * ne capture jamais le pointeur et reste totalement invisible aux lecteurs
 * d'écran.
 */
type DecorItem = {
  emoji: string;
  /** Position absolue dans le conteneur parent (% ou px) */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  /** Délai d'animation pour déphaser le float */
  delay: string;
  /** Rotation statique appliquée (cumulée avec le translateY de float) */
  rotation: string;
  /** Taille relative — text-xl à text-4xl */
  sizeClass: string;
};

const DECORS: DecorItem[] = [
  { emoji: "🌶️", top: "6%",  left: "4%",   delay: "0s",   rotation: "-12deg", sizeClass: "text-3xl md:text-4xl" },
  { emoji: "🍋", top: "18%", right: "6%",  delay: "1.2s", rotation: "8deg",   sizeClass: "text-2xl md:text-3xl" },
  { emoji: "🌿", top: "44%", left: "2%",   delay: "2.4s", rotation: "-18deg", sizeClass: "text-2xl md:text-3xl" },
  { emoji: "🥄", top: "38%", right: "3%",  delay: "0.6s", rotation: "22deg",  sizeClass: "text-2xl md:text-3xl" },
  { emoji: "🍅", bottom: "20%", left: "5%",  delay: "3s",   rotation: "10deg",  sizeClass: "text-3xl md:text-4xl" },
  { emoji: "🌾", bottom: "12%", right: "8%", delay: "1.8s", rotation: "-6deg",  sizeClass: "text-2xl md:text-3xl" },
  { emoji: "🥖", bottom: "4%",  left: "44%", delay: "4.2s", rotation: "5deg",   sizeClass: "text-2xl md:text-3xl" },
  { emoji: "🧄", top: "2%",     left: "52%", delay: "2.8s", rotation: "-8deg",  sizeClass: "text-2xl md:text-3xl" },
];

export function FloatingDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 select-none"
    >
      {DECORS.map((d, i) => (
        <span
          key={i}
          className={`absolute animate-float drop-shadow-[0_2px_6px_rgba(46,42,38,0.18)] ${d.sizeClass}`}
          style={{
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            animationDelay: d.delay,
            // CSS var consommée par @keyframes float (cf. globals.css)
            ["--rot" as string]: d.rotation,
            transform: `rotate(${d.rotation})`,
            opacity: 0.85,
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}

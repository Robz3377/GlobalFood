import Image from "next/image";

/**
 * Écran de chargement de route (app/loading.tsx).
 *
 * Logo statique — aucune animation (cohérent avec SplashScreen). Le but est
 * que l'utilisateur voie immédiatement l'identité de marque pendant la
 * navigation, sans gadget. La transition de page (cf. app/template.tsx) se
 * charge de la fluidité.
 */
export function CookingLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bone/80 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <span className="relative inline-flex h-20 w-20 overflow-hidden rounded-full ring-1 ring-bone-deep bg-bone-deep shadow-warm">
          <Image
            src="/images/logo-mapandfork.png"
            alt=""
            fill
            priority
            sizes="80px"
            className="object-cover"
            style={{ objectPosition: "center 25%" }}
          />
        </span>
        {message && (
          <p className="font-serif text-sm text-ink-soft">{message}</p>
        )}
      </div>
    </div>
  );
}

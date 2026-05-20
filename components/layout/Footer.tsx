import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-bone-deep">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-sm text-ink-soft">
        <div>
          <p className="font-serif text-base text-ink">Map and Fork</p>
          <p className="mt-1">Cuisiner le monde, une recette à la fois.</p>
        </div>
        <nav
          aria-label="Liens légaux"
          className="flex items-center gap-5"
        >
          <Link
            href="/mentions-legales"
            className="hover:text-ink active:scale-95 transition-all duration-150 ease-[var(--ease-soft)]"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-ink active:scale-95 transition-all duration-150 ease-[var(--ease-soft)]"
          >
            Confidentialité
          </Link>
          <Link
            href="/connexion"
            className="hover:text-ink active:scale-95 transition-all duration-150 ease-[var(--ease-soft)]"
          >
            Connexion
          </Link>
        </nav>
      </div>
    </footer>
  );
}

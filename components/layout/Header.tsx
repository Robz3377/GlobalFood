import Link from "next/link";
import Image from "next/image";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { getAllCountries } from "@/lib/data";

export function Header() {
  const countries = getAllCountries();
  return (
    <header className="sticky top-0 z-30 bg-bone/85 backdrop-blur border-b border-bone-deep pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Map and Fork, accueil"
        >
          {/*
            Logo : le PNG source (1071×1008) contient l'icône globe+fourchette dans
            la moitié supérieure et un wordmark "Map and Fork" en bas. On l'utilise
            comme une icône carrée 40×40 en croppant via object-cover + object-position,
            ce qui évite les hacks de scale et garantit un centrage pixel-perfect.
            Le wordmark texte est rendu en HTML serif à côté pour un rendu plus net.
          */}
          <span
            aria-hidden="true"
            className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-bone-deep bg-bone-deep transition-transform group-hover:scale-105"
          >
            <Image
              src="/images/logo-mapandfork.png"
              alt=""
              fill
              priority
              sizes="40px"
              className="object-cover"
              style={{ objectPosition: "center 25%" }}
            />
          </span>
          <span className="hidden sm:inline font-serif text-xl font-semibold tracking-tight">
            Map and Fork
          </span>
        </Link>
        <div className="flex justify-center">
          <SearchBar countries={countries} className="w-full max-w-md" />
        </div>
        <NavMenu />
      </div>
    </header>
  );
}

import Link from "next/link";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { getAllCountries } from "@/lib/data";

export function Header() {
  const countries = getAllCountries();
  return (
    <header className="sticky top-0 z-30 bg-bone/85 backdrop-blur border-b border-bone-deep">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Global Food, accueil"
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-soft bg-terracotta text-bone shadow-soft transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <span className="font-serif text-lg font-semibold leading-none">G</span>
          </span>
          <span className="hidden sm:inline font-serif text-xl font-semibold tracking-tight">
            Global Food
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

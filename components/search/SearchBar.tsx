"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { clsx } from "clsx";
import { normalize } from "@/lib/text";
import type { CountryIndex } from "@/lib/types-index";

type Props = {
  countries: CountryIndex[];
  className?: string;
};

export function SearchBar({ countries, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return countries
      .filter((c) => normalize(c.name).includes(q))
      .sort((a, b) => {
        const aPrefix = normalize(a.name).startsWith(q) ? 0 : 1;
        const bPrefix = normalize(b.name).startsWith(q) ? 0 : 1;
        return aPrefix - bPrefix;
      })
      .slice(0, 6);
  }, [countries, query]);

  // Reset on path change
  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Reset active row when matches change
  useEffect(() => {
    setActive(0);
  }, [matches.length]);

  function pick(country: CountryIndex) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    const params = new URLSearchParams({ focus: country.slug });
    if (pathname === "/") {
      router.replace(`/?${params.toString()}`);
    } else {
      router.push(`/?${params.toString()}`);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(matches.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      if (matches[active]) {
        e.preventDefault();
        pick(matches[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showDropdown = open && query.length > 0;

  return (
    <div
      ref={wrapperRef}
      className={clsx("relative", className)}
      role="combobox"
      aria-expanded={showDropdown && matches.length > 0}
      aria-haspopup="listbox"
      aria-owns={listboxId}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKey}
          placeholder="Rechercher un pays…"
          aria-label="Rechercher un pays"
          aria-controls={listboxId}
          aria-activedescendant={
            showDropdown && matches[active]
              ? `${listboxId}-${matches[active].slug}`
              : undefined
          }
          className="h-11 w-full rounded-full bg-white pl-11 pr-10 text-sm border border-bone-deep shadow-[0_2px_8px_-2px_rgba(46,42,38,0.06)] outline-none focus:border-sage focus:shadow-[0_4px_16px_-4px_rgba(163,177,138,0.35)] transition-all placeholder:text-ink-soft/70"
        />
        {query && (
          <button
            type="button"
            aria-label="Effacer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-full text-ink-soft hover:bg-bone-deep transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          {matches.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="rounded-2xl bg-white shadow-[0_12px_40px_-10px_rgba(46,42,38,0.18)] border border-bone-deep py-1.5 max-h-72 overflow-auto"
            >
              {matches.map((c, i) => (
                <li
                  key={c.slug}
                  id={`${listboxId}-${c.slug}`}
                  role="option"
                  aria-selected={i === active}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(c)}
                    onMouseEnter={() => setActive(i)}
                    className={clsx(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      i === active ? "bg-sage-soft/50" : "hover:bg-bone-deep/40"
                    )}
                  >
                    <span aria-hidden className="text-xl flex-none">
                      {c.flag}
                    </span>
                    <span className="flex-1 font-medium text-ink truncate">
                      {c.name}
                    </span>
                    <span className="text-xs text-ink-soft flex-none">
                      {c.recipeSlugs.length} recettes
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl bg-white shadow-[0_12px_40px_-10px_rgba(46,42,38,0.18)] border border-bone-deep px-4 py-3 text-sm text-ink-soft">
              Aucun pays disponible pour « {query} ».
            </div>
          )}
        </div>
      )}
    </div>
  );
}

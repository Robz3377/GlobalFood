"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Globe2,
  BookOpen,
  Refrigerator,
  Stamp,
  MoreHorizontal,
  Sparkles,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

type Item = { href: string; label: string; icon: LucideIcon };

const PRIMARY: Item[] = [
  { href: "/", label: "Carte", icon: Globe2 },
  { href: "/parcourir", label: "Parcourir", icon: BookOpen },
  { href: "/mon-frigo", label: "Frigo", icon: Refrigerator },
  { href: "/passeport", label: "Passeport", icon: Stamp },
];

const SECONDARY: Item[] = [
  { href: "/recommandations", label: "Recommandations", icon: Sparkles },
  { href: "/gazette", label: "La Gazette", icon: Newspaper },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const moreActive = SECONDARY.some((s) => isActive(pathname, s.href));

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bone/95 backdrop-blur border-t border-bone-deep pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="flex items-stretch">
          {PRIMARY.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-1 h-16 transition-colors",
                    active ? "text-terracotta" : "text-ink-soft hover:text-ink"
                  )}
                >
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="Plus d'options"
              className={clsx(
                "flex flex-col items-center justify-center gap-1 h-16 w-full transition-colors",
                moreActive
                  ? "text-terracotta"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              <MoreHorizontal
                className="h-5 w-5"
                strokeWidth={moreActive ? 2.25 : 1.75}
              />
              <span className="text-[11px] font-medium">Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!moreOpen}
        className={clsx(
          "md:hidden fixed inset-x-0 bottom-0 z-50 bg-bone rounded-t-3xl shadow-soft-lg pb-[env(safe-area-inset-bottom)] transition-transform duration-300",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-bone-deep">
          <h2 className="font-serif text-xl font-semibold">Sections</h2>
          <button
            type="button"
            onClick={() => setMoreOpen(false)}
            aria-label="Fermer"
            className="h-11 w-11 inline-flex items-center justify-center rounded-full hover:bg-bone-deep transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="px-3 py-3">
          {SECONDARY.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-soft text-base font-medium transition-colors",
                    active
                      ? "bg-sage-soft text-ink"
                      : "text-ink-soft hover:bg-bone-deep hover:text-ink"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}

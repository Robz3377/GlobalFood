"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { navItems } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation"
      className="hidden md:flex items-center gap-0.5"
    >
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            className={clsx(
              "inline-flex items-center justify-center h-10 w-10 rounded-full transition-all",
              active
                ? "bg-sage-soft text-ink"
                : "text-ink-soft hover:bg-bone-deep hover:text-ink"
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        );
      })}
    </nav>
  );
}

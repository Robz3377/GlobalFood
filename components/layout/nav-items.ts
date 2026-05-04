import {
  Globe2,
  BookOpen,
  Sparkles,
  Refrigerator,
  Stamp,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Carte du monde", short: "Carte", icon: Globe2 },
  { href: "/parcourir", label: "Parcourir", short: "Parcourir", icon: BookOpen },
  { href: "/recommandations", label: "Recommandations", short: "Reco", icon: Sparkles },
  { href: "/mon-frigo", label: "Mon Frigo", short: "Frigo", icon: Refrigerator },
  { href: "/passeport", label: "Passeport", short: "Passeport", icon: Stamp },
  { href: "/gazette", label: "La Gazette", short: "Gazette", icon: Newspaper },
];

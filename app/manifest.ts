import type { MetadataRoute } from "next";

/**
 * Web App Manifest pour Map and Fork (PWA — "Add to Home Screen").
 *
 * Servi automatiquement par Next.js à `/manifest.webmanifest` et lié dans le
 * <head> via un <link rel="manifest"> injecté.
 *
 * Couleurs alignées sur le design system Tailwind v4 (cf. app/globals.css) :
 * - background_color: --color-bone (#FFFDF5) — ivoire chaud pour splash iOS/Android
 * - theme_color: --color-terracotta (#E65100) — orange brûlé vif pour la barre URL
 *   Safari/Chrome (psychologie de l'appétit : oranges saturés stimulent la
 *   salivation).
 *
 * En attendant la génération d'icônes 192/512 dédiées (recommandé par les guides
 * PWA), on utilise le PNG du logo source qui sert aussi de favicon principal.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Map and Fork — Cuisine du monde",
    short_name: "Map and Fork",
    description:
      "Voyagez à travers la cuisine du monde via un globe 3D interactif et 84 recettes authentiques, accompagnées du secret du chef pour chaque plat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FFFDF5",
    theme_color: "#E65100",
    lang: "fr",
    categories: ["food", "lifestyle", "travel"],
    icons: [
      {
        src: "/images/logo-mapandfork.png",
        sizes: "1071x1008",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo-mapandfork.png",
        sizes: "1071x1008",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

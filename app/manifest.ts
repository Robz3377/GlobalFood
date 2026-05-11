import type { MetadataRoute } from "next";

/**
 * Web App Manifest pour Map and Fork (PWA — "Add to Home Screen").
 *
 * Servi automatiquement par Next.js à `/manifest.webmanifest` et lié dans le
 * <head> via un <link rel="manifest"> injecté.
 *
 * Couleurs alignées sur le design system Tailwind v4 (cf. app/globals.css) :
 * - background_color: --color-bone (#FAF7F2) pour le splash screen iOS/Android
 * - theme_color: --color-terracotta (#C65D3A) pour la barre d'URL Safari/Chrome
 *
 * En attendant la génération d'icônes 192/512 dédiées (recommandé par les guides
 * PWA), on utilise le PNG du logo source qui sert aussi de favicon principal.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Map and Fork — Cuisine du monde",
    short_name: "Map and Fork",
    description:
      "Voyagez à travers la cuisine du monde via un globe 3D interactif et 50 recettes authentiques, accompagnées du secret du chef pour chaque plat.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAF7F2",
    theme_color: "#C65D3A",
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

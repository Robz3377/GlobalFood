import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { BackgroundDecor } from "@/components/layout/BackgroundDecor";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { SurpriseButton } from "@/components/surprise/SurpriseButton";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://global-food.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Map and Fork — Cuisine du monde",
    template: "%s — Map and Fork",
  },
  description:
    "Voyagez à travers la cuisine du monde via un globe 3D interactif. Découvrez 84 recettes authentiques, leurs traditions et le secret du chef pour chaque plat — un atlas culinaire à explorer du bout des doigts.",
  applicationName: "Map and Fork",
  appleWebApp: {
    capable: true,
    title: "Map and Fork",
    statusBarStyle: "default",
  },
  // Next 16 émet le standard moderne <meta name="mobile-web-app-capable">
  // mais certaines anciennes versions d'iOS Safari ne respectent que la balise
  // legacy "apple-mobile-web-app-capable". On la force ici pour garantir le
  // lancement en mode standalone (sans barre Safari) après "Add to Home Screen".
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    // Favicon principal multi-résolutions (sera servi par app/favicon.ico),
    // en complément Next.js injecte automatiquement le manifest PWA.
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo-mapandfork.png", type: "image/png" },
    ],
    apple: "/images/logo-mapandfork.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Map and Fork — Cuisine du monde",
    description:
      "Globe 3D interactif et 84 recettes certifiées du monde, chacune avec son secret du chef.",
    siteName: "Map and Fork",
    images: [
      { url: "/images/logo-mapandfork.png", width: 1071, height: 1008, alt: "Map and Fork" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Map and Fork — Cuisine du monde",
    description:
      "Globe 3D interactif et 84 recettes certifiées du monde, chacune avec son secret du chef.",
    images: ["/images/logo-mapandfork.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    // Refonte v2 — palette appétissante. Light = ivoire chaud, dark = orange
    // brûlé vif (psychologie de l'appétit : oranges saturés salivants).
    { media: "(prefers-color-scheme: light)", color: "#FFFDF5" },
    { media: "(prefers-color-scheme: dark)", color: "#E65100" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-ink pb-16 md:pb-0">
        {/* Splash 1 seconde au mount du root layout — disparait en fade-out
            propre, n'interfère pas avec l'interaction après 300ms. */}
        <SplashScreen />
        <BackgroundDecor />
        <Header />
        {children}
        <Footer />
        {/* SurpriseButton est autonome — fetch /api/random-recipe au clic.
            Aucune donnée embarquée au chargement initial (économie ~454 KB
            sur le RSC payload de chaque route). */}
        <SurpriseButton />
        <BottomNav />
      </body>
    </html>
  );
}

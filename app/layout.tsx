import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { SurpriseButton } from "@/components/surprise/SurpriseButton";
import { getAllRecipes } from "@/lib/data";

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

export const metadata: Metadata = {
  title: "Global Food — Voyage culinaire autour du monde",
  description:
    "Explorez la cuisine du monde via une carte interactive. Recettes, traditions et inspirations saisonnières.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const recipes = getAllRecipes();
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-ink pb-16 md:pb-0">
        <Header />
        {children}
        <Footer />
        <SurpriseButton recipes={recipes} />
        <BottomNav />
      </body>
    </html>
  );
}

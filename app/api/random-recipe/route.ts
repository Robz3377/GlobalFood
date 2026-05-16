/**
 * Route Handler — /api/random-recipe
 *
 * Retourne le slug d'une recette aléatoire. Utilisé par le composant
 * SurpriseButton (Client) pour éviter de devoir embarquer les 454 KB de
 * recettes complètes dans le RSC payload du root layout.
 *
 * Pas de cache HTTP (Cache-Control: no-store) — c'est volontaire : on veut
 * un random différent à chaque clic. L'index étant chargé statiquement, le
 * coût serveur est négligeable.
 */
import { NextResponse } from "next/server";
import { getAllRecipesIndex } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // pas besoin d'edge ici

export function GET() {
  const recipes = getAllRecipesIndex();
  if (recipes.length === 0) {
    return NextResponse.json(
      { error: "Aucune recette disponible" },
      { status: 404 }
    );
  }
  const pick = recipes[Math.floor(Math.random() * recipes.length)];
  return NextResponse.json(
    { countrySlug: pick.countrySlug, recipeSlug: pick.slug },
    { headers: { "Cache-Control": "no-store" } }
  );
}

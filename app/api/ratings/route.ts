import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseRecipeRef } from "@/lib/api/recipeRef";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/ratings?country=&recipe=
 * Renvoie l'agrégat public (vue recipe_rating_stats) + la note de
 * l'utilisateur courant s'il est connecté.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = parseRecipeRef(
    searchParams.get("country"),
    searchParams.get("recipe")
  );
  if (!ref) {
    return NextResponse.json({ error: "Recette inconnue" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Backend indisponible" }, { status: 503 });
  }

  const { data: stat } = await supabase
    .from("recipe_rating_stats")
    .select("avg_score, ratings_count")
    .eq("country_slug", ref.countrySlug)
    .eq("recipe_slug", ref.recipeSlug)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let mine: number | null = null;
  if (user) {
    const { data: own } = await supabase
      .from("recipe_ratings")
      .select("score")
      .eq("user_id", user.id)
      .eq("country_slug", ref.countrySlug)
      .eq("recipe_slug", ref.recipeSlug)
      .maybeSingle();
    mine = own?.score ?? null;
  }

  return NextResponse.json(
    {
      average: stat?.avg_score ?? null,
      count: stat?.ratings_count ?? 0,
      mine,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * PUT /api/ratings  body: { country, recipe, score }
 * Upsert de la note de l'utilisateur (1→5). RLS impose user_id=auth.uid().
 */
export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Backend indisponible" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let payload: { country?: string; recipe?: string; score?: number };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const ref = parseRecipeRef(payload.country ?? null, payload.recipe ?? null);
  if (!ref) {
    return NextResponse.json({ error: "Recette inconnue" }, { status: 400 });
  }

  const score = Number(payload.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json(
      { error: "La note doit être un entier entre 1 et 5" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("recipe_ratings").upsert(
    {
      user_id: user.id,
      country_slug: ref.countrySlug,
      recipe_slug: ref.recipeSlug,
      score,
    },
    { onConflict: "user_id,country_slug,recipe_slug" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, score });
}

/**
 * DELETE /api/ratings?country=&recipe=
 * Retire la note de l'utilisateur courant.
 */
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Backend indisponible" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ref = parseRecipeRef(
    searchParams.get("country"),
    searchParams.get("recipe")
  );
  if (!ref) {
    return NextResponse.json({ error: "Recette inconnue" }, { status: 400 });
  }

  const { error } = await supabase
    .from("recipe_ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("country_slug", ref.countrySlug)
    .eq("recipe_slug", ref.recipeSlug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseRecipeRef } from "@/lib/api/recipeRef";
import {
  commentCreateMinute,
  commentCreateDay,
  publicRead,
} from "@/lib/rate-limit/upstash";
import { enforce, userIdentifier, ipIdentifier } from "@/lib/rate-limit/guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

/**
 * GET /api/comments?country=&recipe=&limit=&before=
 * Liste publique des commentaires visibles d'une recette (+ pseudo auteur).
 *
 * Pas d'embed PostgREST `profiles(...)` : `recipe_comments.user_id` pointe
 * vers `auth.users`, pas `profiles` (aucune FK directe). On résout les
 * pseudos en une 2ᵉ requête puis on mappe → évite une migration de FK.
 */
export async function GET(request: Request) {
  const rl = await enforce(publicRead, ipIdentifier(request));
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const ref = parseRecipeRef(
    searchParams.get("country"),
    searchParams.get("recipe")
  );
  if (!ref) {
    return NextResponse.json({ error: "Recette inconnue" }, { status: 400 });
  }

  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const before = searchParams.get("before");

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Backend indisponible" },
      { status: 503 }
    );
  }

  let query = supabase
    .from("recipe_comments")
    .select("id, user_id, body, created_at")
    .eq("country_slug", ref.countrySlug)
    .eq("recipe_slug", ref.recipeSlug)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data: rows, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
  const names = new Map<string, string | null>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    for (const p of profiles ?? []) names.set(p.id, p.display_name);
  }

  const comments = (rows ?? []).map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    author: names.get(r.user_id) ?? "Gourmet anonyme",
  }));

  return NextResponse.json(
    { comments },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * POST /api/comments  body: { country, recipe, body }
 * Crée un commentaire (auth requise). RLS impose user_id = auth.uid().
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Backend indisponible" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const id = userIdentifier(user.id);
  const rlMinute = await enforce(commentCreateMinute, id);
  if (rlMinute) return rlMinute;
  const rlDay = await enforce(commentCreateDay, id);
  if (rlDay) return rlDay;

  let payload: { country?: string; recipe?: string; body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const ref = parseRecipeRef(payload.country ?? null, payload.recipe ?? null);
  if (!ref) {
    return NextResponse.json({ error: "Recette inconnue" }, { status: 400 });
  }

  const body = (payload.body ?? "").trim();
  if (body.length < 1 || body.length > 2000) {
    return NextResponse.json(
      { error: "Le commentaire doit faire entre 1 et 2000 caractères" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("recipe_comments")
    .insert({
      user_id: user.id,
      country_slug: ref.countrySlug,
      recipe_slug: ref.recipeSlug,
      body,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      comment: {
        id: data.id,
        body: data.body,
        createdAt: data.created_at,
      },
    },
    { status: 201 }
  );
}

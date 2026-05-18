import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Next 16 : le `params` d'un Route Handler est asynchrone.
 * RLS garantit qu'on ne touche QUE ses propres commentaires (la clause
 * `eq("user_id", user.id)` est une défense en profondeur supplémentaire).
 */
type Ctx = { params: Promise<{ id: string }> };

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Backend indisponible", status: 503 } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié", status: 401 } as const;
  return { supabase, user } as const;
}

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let payload: { body?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const body = (payload.body ?? "").trim();
  if (body.length < 1 || body.length > 2000) {
    return NextResponse.json(
      { error: "Le commentaire doit faire entre 1 et 2000 caractères" },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("recipe_comments")
    .update({ body })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select("id, body, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    comment: { id: data.id, body: data.body, createdAt: data.created_at },
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  if (id === null) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const auth = await requireUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from("recipe_comments")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

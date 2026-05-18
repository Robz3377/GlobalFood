import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Callback du lien magique (flux PKCE @supabase/ssr).
 *
 * L'e-mail renvoie ici avec `?code=…`. On échange ce code contre une
 * session : `exchangeCodeForSession` écrit les cookies de session via le
 * client serveur (cf. lib/supabase/server.ts). Le `code_verifier` PKCE a
 * été déposé en cookie côté navigateur lors du `signInWithOtp`.
 *
 * `next` permet de revenir là où l'utilisateur voulait aller (ex. /passeport).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Garde-fou open-redirect : on n'accepte qu'un chemin interne.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeNext, origin));
      }
    }
  }

  return NextResponse.redirect(
    new URL("/connexion?error=auth", origin)
  );
}

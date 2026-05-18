import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

/**
 * Rafraîchit la session Supabase à chaque requête (rotation du token).
 *
 * Pattern officiel @supabase/ssr pour le App Router : on relaie les cookies
 * entre la requête entrante et la réponse sortante, puis on force un
 * `auth.getUser()` qui déclenche le refresh si le token a expiré.
 *
 * No-op si Supabase n'est pas configuré → la réponse passe inchangée.
 */
export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient<Database>(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // IMPORTANT : ne rien insérer entre createServerClient et getUser()
  // (recommandation Supabase — évite des déconnexions aléatoires).
  await supabase.auth.getUser();

  return response;
}

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

/**
 * Client Supabase serveur (Server Components, Route Handlers, Server Actions).
 *
 * Next 16 : `cookies()` est asynchrone → `await`. La fonction renvoie `null`
 * si Supabase n'est pas configuré (même contrat que le client navigateur).
 *
 * `setAll` est encapsulé dans un try/catch : depuis un Server Component, la
 * mutation de cookies lève — c'est attendu, le rafraîchissement de session
 * est assuré par le middleware (cf. lib/supabase/middleware.ts).
 */
export async function createSupabaseServerClient(): Promise<TypedSupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component : ignoré (le middleware
            // rafraîchit la session sur la requête suivante).
          }
        },
      },
    }
  );
}

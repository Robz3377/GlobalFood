"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { TypedSupabaseClient } from "./types";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

/**
 * Client Supabase navigateur (singleton).
 *
 * Renvoie `null` si Supabase n'est pas configuré : TOUS les appelants
 * doivent gérer ce cas en retombant sur le localStorage. C'est le contrat
 * qui garantit que l'app fonctionne sans backend.
 */
let browserClient: TypedSupabaseClient | null = null;

export function getSupabaseBrowserClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string
  );
  return browserClient;
}

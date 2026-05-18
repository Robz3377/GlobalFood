import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Type canonique du client Supabase typé pour ce projet.
 *
 * @supabase/ssr ≥ 0.10 renvoie `SupabaseClient<Database, SchemaName>` avec
 * `SchemaName` qui se résout en `"public"`. `SupabaseClient<Database>`
 * (défauts) est donc strictement équivalent au retour des fabriques
 * `createBrowserClient` / `createServerClient`. Une seule source de vérité,
 * réutilisée par le client, le serveur, l'adaptateur et les mappers.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

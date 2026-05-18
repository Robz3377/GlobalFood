/**
 * Détection de la configuration Supabase.
 *
 * Principe directeur (Phase 2) : le backend est OPT-IN. Si les variables
 * d'environnement sont absentes (dev local sans projet, fork, build SSG sans
 * secrets), toute la couche Supabase devient un no-op et l'application
 * retombe sur le mode 100 % localStorage — aucune régression.
 *
 * `process.env.NEXT_PUBLIC_*` est inliné au build par Next : ce module est
 * utilisable côté serveur ET côté navigateur (pas de "use client").
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof SUPABASE_URL === "string" &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === "string" &&
  SUPABASE_ANON_KEY.length > 0;

/**
 * Types de la base Supabase — écrits à la main au FORMAT GÉNÉRÉ par
 * `supabase gen types typescript` (supabase-js v2.106 / postgrest-js 1.19+).
 *
 * Le format canonique (clés `__InternalSupabase`, `Relationships`,
 * `Functions`/`Enums`/`CompositeTypes`) est REQUIS : sans lui, le schéma ne
 * satisfait pas la contrainte `GenericSchema` et toutes les requêtes
 * typées s'effondrent en `never`.
 *
 * À remplacer dès que le CLI est branché :
 *   supabase gen types typescript --linked > lib/supabase/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UnitSystem = "metric" | "imperial";
export type CommentStatus = "visible" | "hidden" | "flagged";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          unit_system: UnitSystem;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          unit_system?: UnitSystem;
        };
        Update: {
          display_name?: string | null;
          unit_system?: UnitSystem;
        };
        Relationships: [];
      };
      passport_stamps: {
        Row: { user_id: string; country_slug: string; stamped_at: string };
        Insert: { user_id: string; country_slug: string; stamped_at?: string };
        Update: { stamped_at?: string };
        Relationships: [];
      };
      history_entries: {
        Row: {
          id: number;
          user_id: string;
          country_slug: string;
          recipe_slug: string | null;
          viewed_at: string;
        };
        Insert: {
          user_id: string;
          country_slug: string;
          recipe_slug?: string | null;
          viewed_at?: string;
        };
        Update: { recipe_slug?: string | null; viewed_at?: string };
        Relationships: [];
      };
      recipe_ratings: {
        Row: {
          user_id: string;
          country_slug: string;
          recipe_slug: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          country_slug: string;
          recipe_slug: string;
          score: number;
        };
        Update: { score?: number };
        Relationships: [];
      };
      recipe_comments: {
        Row: {
          id: number;
          user_id: string;
          country_slug: string;
          recipe_slug: string;
          body: string;
          status: CommentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          country_slug: string;
          recipe_slug: string;
          body: string;
          status?: CommentStatus;
        };
        Update: { body?: string; status?: CommentStatus };
        Relationships: [];
      };
    };
    Views: {
      recipe_rating_stats: {
        Row: {
          country_slug: string;
          recipe_slug: string;
          avg_score: number;
          ratings_count: number;
        };
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

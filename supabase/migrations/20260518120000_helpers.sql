-- =============================================================================
-- 20260518120000_helpers.sql
-- Map and Fork — fonctions utilitaires partagées (Phase 2).
--
-- Aucune table ici : uniquement les briques réutilisées par les migrations
-- suivantes (maintenance de `updated_at`). Idempotent (CREATE OR REPLACE).
-- =============================================================================

-- Met automatiquement `updated_at` à NOW() sur chaque UPDATE.
-- `search_path = ''` + schémas qualifiés : règle de durcissement Supabase
-- (évite le hijack de search_path sur les fonctions SECURITY DEFINER/triggers).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger BEFORE UPDATE : rafraîchit la colonne updated_at.';

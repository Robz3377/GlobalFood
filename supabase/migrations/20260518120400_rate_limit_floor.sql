-- =============================================================================
-- 20260518120400_rate_limit_floor.sql   (Phase 4 — OPTIONNEL)
-- Map and Fork — plancher anti-abus en base (défense en profondeur).
--
-- La vraie limitation de débit est applicative (Upstash, lib/rate-limit/*).
-- Ce trigger est un FILET DE SÉCURITÉ grossier : il tient même si l'API est
-- contournée (clé service_role compromise mise à part). Seuil volontairement
-- HAUT (100 commentaires / heure / utilisateur) pour ne jamais gêner un
-- usage légitime — il n'attrape qu'un emballement catastrophique.
--
-- À appliquer APRÈS 20260518120300_ratings_comments.sql.
-- =============================================================================

create or replace function public.enforce_comment_floor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.recipe_comments
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';

  if recent_count >= 100 then
    raise exception
      'Plancher anti-abus atteint : trop de commentaires sur la dernière heure'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.enforce_comment_floor() is
  'Plancher DB anti-abus : <100 commentaires/h/utilisateur (défense en profondeur).';

drop trigger if exists recipe_comments_rate_floor on public.recipe_comments;
create trigger recipe_comments_rate_floor
  before insert on public.recipe_comments
  for each row execute function public.enforce_comment_floor();

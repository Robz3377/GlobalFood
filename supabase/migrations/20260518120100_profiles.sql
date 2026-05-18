-- =============================================================================
-- 20260518120100_profiles.sql
-- Map and Fork — profil applicatif 1-1 avec auth.users (Phase 2).
--
-- On NE recrée PAS la table des utilisateurs : Supabase Auth gère `auth.users`.
-- `public.profiles` porte uniquement les données métier (pseudo, préférence
-- d'unités) et est alimentée automatiquement à l'inscription par un trigger.
-- =============================================================================

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text
               check (display_name is null
                      or char_length(display_name) between 2 and 40),
  unit_system  text not null default 'metric'
               check (unit_system in ('metric', 'imperial')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Profil public minimal lié à auth.users (pseudo + préférence d''unités).';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --- Création automatique du profil à l'inscription ------------------------
-- SECURITY DEFINER : la fonction s'exécute avec les droits du propriétaire
-- (postgres) pour pouvoir écrire dans public.profiles depuis un trigger sur
-- le schéma auth. search_path vidé + schémas qualifiés (durcissement).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- pseudo provisoire dérivé de l'email, l'utilisateur pourra le changer
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Trigger AFTER INSERT sur auth.users : crée la ligne profiles associée.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- RLS --------------------------------------------------------------------
-- Lecture publique (pseudo affiché à côté des commentaires/notes — donnée non
-- sensible). Écriture strictement réservée au propriétaire. Pas de DELETE :
-- la suppression se fait en cascade depuis auth.users.
alter table public.profiles enable row level security;

create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

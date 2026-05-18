-- =============================================================================
-- 20260518120200_passport_history.sql
-- Map and Fork — migration du passeport + historique localStorage (Phase 2).
--
-- Le schéma reflète EXACTEMENT les types TS existants pour une migration
-- silencieuse 1-1 (cf. lib/hooks/usePassport.ts, useHistory.ts) :
--   PassportState = Record<countrySlug, isoDate>  → passport_stamps
--   HistoryEntry  = { countrySlug, recipeSlug?, at } → history_entries
--
-- Les recettes/pays vivent dans data/countries/*.json (pas de table) : la
-- paire (country_slug, recipe_slug) est la clé métier stable. On ajoute des
-- garde-fous de format ; la validation d'existence reste côté serveur.
-- =============================================================================

-- --- Passeport : 1 ligne par (utilisateur, pays) ---------------------------
create table public.passport_stamps (
  user_id      uuid not null references auth.users (id) on delete cascade,
  country_slug text not null check (country_slug ~ '^[a-z-]{2,40}$'),
  stamped_at   timestamptz not null default now(),
  primary key (user_id, country_slug)
);

comment on table public.passport_stamps is
  'Tampons de passeport : équivalent serveur de mapandfork.passport.';

-- La PK (user_id, country_slug) couvre déjà les lectures « par utilisateur ».

alter table public.passport_stamps enable row level security;

create policy "passport_select_own"
  on public.passport_stamps for select
  to authenticated
  using (auth.uid() = user_id);

create policy "passport_insert_own"
  on public.passport_stamps for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "passport_update_own"
  on public.passport_stamps for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "passport_delete_own"
  on public.passport_stamps for delete
  to authenticated
  using (auth.uid() = user_id);

-- --- Historique : borné à 30 entrées côté application ----------------------
-- (cf. useHistory MAX=30). On garde la limite applicative pour rester aligné
-- sur le plan validé ; l'index couvre le tri « 30 dernières ».
create table public.history_entries (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  country_slug text not null check (country_slug ~ '^[a-z-]{2,40}$'),
  recipe_slug  text check (recipe_slug is null
                           or recipe_slug ~ '^[a-z0-9-]{2,60}$'),
  viewed_at    timestamptz not null default now()
);

comment on table public.history_entries is
  'Historique de consultation : équivalent serveur de mapandfork.history.';

create index history_entries_user_recent_idx
  on public.history_entries (user_id, viewed_at desc);

alter table public.history_entries enable row level security;

create policy "history_select_own"
  on public.history_entries for select
  to authenticated
  using (auth.uid() = user_id);

create policy "history_insert_own"
  on public.history_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "history_delete_own"
  on public.history_entries for delete
  to authenticated
  using (auth.uid() = user_id);
-- Pas d'UPDATE : une entrée d'historique est immuable (on insère/supprime).

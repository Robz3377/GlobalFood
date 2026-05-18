-- =============================================================================
-- 20260518120300_ratings_comments.sql
-- Map and Fork — système de notes et commentaires (Phase 3).
--
-- Modèle « avis publics » : lecture ouverte (nécessaire pour calculer les
-- moyennes), écriture réservée au propriétaire. La modération passe par la
-- clé service_role (qui contourne la RLS) — aucune policy à exposer pour ça.
-- =============================================================================

-- --- Notes : 1 note par (utilisateur, recette) -----------------------------
create table public.recipe_ratings (
  user_id      uuid not null references auth.users (id) on delete cascade,
  country_slug text not null check (country_slug ~ '^[a-z-]{2,40}$'),
  recipe_slug  text not null check (recipe_slug ~ '^[a-z0-9-]{2,60}$'),
  score        int  not null check (score between 1 and 5),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, country_slug, recipe_slug)
);

comment on table public.recipe_ratings is
  'Note 1→5 par utilisateur et par recette (upsert sur la PK).';

create index recipe_ratings_recipe_idx
  on public.recipe_ratings (country_slug, recipe_slug);

create trigger recipe_ratings_set_updated_at
  before update on public.recipe_ratings
  for each row execute function public.set_updated_at();

alter table public.recipe_ratings enable row level security;

-- Lecture publique : indispensable pour que la vue d'agrégat voie TOUTES les
-- lignes (sinon les moyennes seraient calculées sur la seule note du lecteur).
create policy "ratings_select_public"
  on public.recipe_ratings for select
  to anon, authenticated
  using (true);

create policy "ratings_insert_own"
  on public.recipe_ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "ratings_update_own"
  on public.recipe_ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ratings_delete_own"
  on public.recipe_ratings for delete
  to authenticated
  using (auth.uid() = user_id);

-- --- Commentaires ----------------------------------------------------------
create table public.recipe_comments (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  country_slug text not null check (country_slug ~ '^[a-z-]{2,40}$'),
  recipe_slug  text not null check (recipe_slug ~ '^[a-z0-9-]{2,60}$'),
  body         text not null check (char_length(body) between 1 and 2000),
  status       text not null default 'visible'
               check (status in ('visible', 'hidden', 'flagged')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.recipe_comments is
  'Commentaires de recette. status géré par la modération (service_role).';

create index recipe_comments_recipe_idx
  on public.recipe_comments (country_slug, recipe_slug, created_at desc);

create index recipe_comments_user_idx
  on public.recipe_comments (user_id);

create trigger recipe_comments_set_updated_at
  before update on public.recipe_comments
  for each row execute function public.set_updated_at();

alter table public.recipe_comments enable row level security;

-- Visible par tous ; l'auteur voit aussi ses propres commentaires masqués.
create policy "comments_select_visible_or_own"
  on public.recipe_comments for select
  to anon, authenticated
  using (status = 'visible' or auth.uid() = user_id);

-- À l'insertion l'auteur ne peut pas auto-publier en 'hidden'/'flagged'.
create policy "comments_insert_own"
  on public.recipe_comments for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'visible');

create policy "comments_update_own"
  on public.recipe_comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.recipe_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- --- Vue d'agrégat (moyenne + nombre de notes par recette) -----------------
-- security_invoker = on : la RLS du lecteur s'applique à recipe_ratings.
-- Comme la lecture des notes est publique, l'agrégat est correct et global.
create view public.recipe_rating_stats
  with (security_invoker = on) as
select
  country_slug,
  recipe_slug,
  round(avg(score)::numeric, 2) as avg_score,
  count(*)                       as ratings_count
from public.recipe_ratings
group by country_slug, recipe_slug;

comment on view public.recipe_rating_stats is
  'Moyenne et volume de notes par recette (pour cartes/listes).';

grant select on public.recipe_rating_stats to anon, authenticated;

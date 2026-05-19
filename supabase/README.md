# Supabase — schéma Map and Fork

Migrations SQL versionnées pour le backend optionnel (comptes + sync passeport,
notes & commentaires). Le mode 100 % local reste le défaut : ce backend est
**opt-in** et ne doit jamais casser le build SSG si les variables d'env sont
absentes.

## Ordre d'application

Les fichiers sont préfixés d'un timestamp et s'appliquent **dans l'ordre
lexicographique** :

| Ordre | Fichier | Contenu | Phase |
| ----- | ------- | ------- | ----- |
| 1 | `20260518120000_helpers.sql` | `set_updated_at()` | 2 |
| 2 | `20260518120100_profiles.sql` | `profiles` + trigger `on_auth_user_created` + RLS | 2 |
| 3 | `20260518120200_passport_history.sql` | `passport_stamps`, `history_entries`, index, RLS | 2 |
| 4 | `20260518120300_ratings_comments.sql` | `recipe_ratings`, `recipe_comments`, vue `recipe_rating_stats`, RLS | 3 |
| 5 | `20260518120400_rate_limit_floor.sql` | Trigger plancher anti-abus commentaires (**optionnel**) | 4 |

> ⚠️ Respecter l'ordre : `profiles` dépend de `set_updated_at()` ;
> `passport/history/ratings/comments` référencent `auth.users` ;
> le plancher anti-abus dépend de `recipe_comments` (migration 4).
>
> La migration 5 est **optionnelle** : la limitation de débit réelle est
> applicative (Upstash). Ce trigger est un filet de sécurité grossier
> (<100 commentaires/h/utilisateur) qui tient même si l'API est contournée.

## Appliquer

**Option A — Supabase CLI (recommandé)**

```bash
supabase link --project-ref <ref-du-projet>
supabase db push          # applique toutes les migrations dans l'ordre
```

**Option B — Éditeur SQL du dashboard**

Copier-coller chaque fichier dans l'ordre du tableau et exécuter.

## Décisions de sécurité (RLS)

- **RLS activée sur toutes les tables**, aucune policy par défaut → tout est
  refusé tant qu'une policy explicite ne l'autorise pas.
- `profiles`, `recipe_ratings`, `recipe_comments` : **SELECT public**
  (pseudo affiché à côté des avis ; agrégats de notes corrects). Écriture
  toujours restreinte à `auth.uid() = user_id`.
- `passport_stamps`, `history_entries` : **strictement privées** (lecture +
  écriture limitées au propriétaire).
- Modération des commentaires (`status`) : via la **clé `service_role`** côté
  serveur uniquement (contourne la RLS) — pas de policy exposée aux clients.
- Garde-fous de format (`~ '^[a-z0-9-]+$'`) sur les slugs ; la validation
  d'existence recette/pays se fait côté serveur (les recettes vivent dans
  `data/countries/*.json`, pas en base).

## À ne PAS oublier (hors SQL, prochaines étapes)

- Variables d'env Vercel : `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé `service_role` **jamais** en
  `NEXT_PUBLIC_`).
- Région du projet Supabase : **UE** (cohérent avec `/confidentialite` §7).
- Mettre à jour `AGENTS.md` (la ligne « pas de variable d'environnement
  requise » devient fausse) et activer la section 7 de la politique de
  confidentialité **avant** toute première écriture serveur.
- Limitation de débit (Phase 4) : couche applicative livrée
  (`lib/rate-limit/*`, `@upstash/ratelimit`). Variables d'env Vercel
  requises pour l'activer : `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN` (sinon no-op : aucune limite appliquée).
  Plancher Postgres optionnel : migration 5 ci-dessus.

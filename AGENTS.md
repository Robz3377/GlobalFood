<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Map and Fork — conventions projet

App Next.js 16.2.4 (App Router + Turbopack) qui présente la cuisine du monde via
un globe 3D interactif et 50 recettes certifiées (2 sources réelles par recette).

## Stack et versions

- **Next.js 16.2.4** + Turbopack (`next dev`, `next build`). Pas de webpack config explicite.
- **React 19.2.4** + ReactDOM 19.2.4.
- **TypeScript 5** strict (`tsconfig.json: strict: true`). Toujours typer les props.
- **Tailwind CSS v4** — **PAS** de `tailwind.config.js/ts`. Tout le design system
  est inline dans `app/globals.css` via `@theme { ... }`.
- **`legacy-peer-deps=true`** dans `.npmrc` à cause de `react-simple-maps@3` qui
  déclare des peers React 16/17/18 uniquement. Vercel respecte ce fichier.
  Ne JAMAIS retirer cette ligne sans corriger en amont (overrides ou downgrade).
- Packages clés : `react-globe.gl` (carte 3D, lazy-loadé), `three`, `topojson-client`,
  `clsx`, `lucide-react`, `next/font` (Fraunces + Inter).

## Architecture et conventions

- **Server Components par défaut**. Un fichier devient Client UNIQUEMENT s'il
  utilise un hook, un event handler, ou une API browser → préfixe `"use client"`.
- Composants visibles `components/{ui,layout,recipe,map,passport,search,...}/`.
- Pages dans `app/` (App Router). `[slug]` et `[recipe]` sont dynamiques mais
  pré-rendus via `generateStaticParams()` à `next build` (SSG).
- **Carte 3D** : `WorldMapClient.tsx` est un wrapper Client qui charge
  `WorldGlobe.tsx` via `next/dynamic({ ssr: false })`. Ne JAMAIS importer
  `react-globe.gl` ou `three` depuis un Server Component (crash SSR).

## Design system (Tailwind v4 `@theme`)

Palette dans `app/globals.css` :

| Couleur          | Hex       | Usage                                              |
| ---------------- | --------- | -------------------------------------------------- |
| `bone`           | `#FAF7F2` | Fond principal, "papier de magazine"               |
| `bone-deep`      | `#F2EDE4` | Séparateurs, hover surfaces, anneaux               |
| `sage`           | `#A3B18A` | CTA secondaire, badges "vegan/gluten-free"         |
| `sage-soft`      | `#C8D2B5` | Lignes décoratives, états désactivés                |
| `ochre`          | `#C08552` | Accent "histoire culturelle"                        |
| `ochre-soft`     | `#E0B084` | Background bloc story                               |
| `terracotta`     | `#C65D3A` | CTA primaire, accents critiques, "secret du Chef"   |
| `terracotta-deep`| `#A94A2C` | Hover terracotta, valeurs numériques (tabular-nums)|
| `ink`            | `#2E2A26` | Texte principal                                    |
| `ink-soft`       | `#6B635A` | Texte secondaire, métadonnées                      |

Typographie :
- `font-serif` = Fraunces (titres, chiffres décoratifs, accents italic). Tracking
  serré `-0.01em` sur h1-h4.
- `font-sans` = Inter (corps de texte, UI).
- `font-feature-settings: "ss01","cv02"` activé globalement.
- Headers de section : `font-serif text-3xl md:text-4xl font-semibold` (style magazine).

Rayons : `rounded-soft` (1rem), `rounded-soft-lg` (1.5rem).
Ombres : `shadow-soft` discrète, `shadow-soft-lg` pour cartes émergées.

## localStorage et migration silencieuse (CRITIQUE)

Le rebrand "Global Food" → "Map and Fork" a changé les clés localStorage. Les
utilisateurs existants conservent leur historique, leur passeport et leur frigo
grâce à une migration silencieuse dans `lib/hooks/useLocalStorage.ts` :

```ts
useLocalStorage<T>(key, initial, legacyKey?)
```

Si `key` n'existe pas mais `legacyKey` existe (ex : `"global-food.history"`), la
valeur est lue depuis `legacyKey`, ré-écrite sous `key`, et `legacyKey` est
supprimé.

**Conventions** :
- Nouvelles clés : préfixe `mapandfork.` (ex : `mapandfork.history`,
  `mapandfork.passport`, `mapandfork.fridge`, `mapandfork.unit-system`).
- Anciennes clés legacy : `global-food.*` — à PRÉSERVER comme paramètre
  `legacyKey` pendant au moins 6 mois.
- **Ne JAMAIS retirer** les constantes `LEGACY_KEY` dans `useHistory.ts`,
  `usePassport.ts`, `useLocalStorage.ts`, `RecipeIngredients.tsx`. C'est la
  raison technique pour laquelle 4 fichiers contiennent encore "Global Food".

## Structure des 50 recettes (`data/data.json`)

50 recettes dans 10 pays, 5 par pays. Schéma `Recipe` complet dans
`lib/types.ts` :

```ts
type Recipe = {
  slug: string;          // ex: "carbonara", unique par country
  title: string;         // ex: "Spaghetti alla Carbonara"
  image: string;         // "/images/{slug}-{country}.jpg" (URL-encoded accents)
  prepTime: number;      // minutes
  cookTime: number;      // minutes (peut inclure repos long)
  servings: number;      // par défaut, modifiable via ServingsSelector
  diets: Diet[];         // ["vegan", "vegetarian", "gluten-free", "dairy-free"]
  seasons?: Season[];    // utilisé par useRecommendations
  events?: CulturalEvent[]; // ex: "diwali", "chinese-new-year"
  ingredients: Ingredient[]; // { name, qty: number, unit: string }
  steps: string[];       // tableau d'instructions complètes
  story?: string;        // 1-2 phrases d'histoire culturelle
  chefSecret?: string;   // technique pro qui distingue le plat (ajouté Phase 1)
};
```

**Toutes les unités** sont métriques (`g`, `ml`, `u`, `cuillère`, etc.).
La conversion impérial/métrique est calculée à la volée dans
`RecipeIngredients.tsx` via `lib/units.ts` — ne stocker que des valeurs métriques
dans le JSON.

**Audit recettes** : chaque recette a été validée via triangulation 2 sources
réelles fetchées (Royal Mansour, Larousse, Choumicha, Cucina Italiana, Hot Thai
Kitchen, Marciatack, etc.). Les sources sont documentées dans l'historique git
(commits Phase 1-7).

## PWA et metadata

- `app/manifest.ts` (Next 16 file convention) → servi à `/manifest.webmanifest`.
- `app/layout.tsx` exporte un `Metadata` ET un `Viewport` séparé (séparation
  obligatoire en Next 16 — `viewport` ne doit JAMAIS être dans `metadata`).
- `theme_color` = terracotta `#C65D3A` (PWA + barre URL).
- `background_color` = bone `#FAF7F2` (splash screen iOS/Android).
- `apple-mobile-web-app-capable: yes` est forcé via `metadata.other` parce que
  Next 16 émet le moderne `mobile-web-app-capable` uniquement.
- `viewport-fit: cover` + `pt-[env(safe-area-inset-top)]` sur Header → support
  iPhone à encoche.

## Conventions UI/UX (mobile-first, magazine luxe)

- **Page recette** : hero immersif 16/9 mobile bord-à-bord + titre débordant
  carte magazine + sticky info bar (prép/cuisson/portions) + steps avec
  drop-cap serif italic. Ingrédients en accordéon sur mobile, déplié sur md+.
- **Tap targets** : minimum 44×44px (Apple HIG). BottomNav h-16 (64px), boutons
  ronds h-11 w-11.
- **Safe areas** : Header sticky avec `pt-[env(safe-area-inset-top)]`,
  BottomNav avec `pb-[env(safe-area-inset-bottom)]`.
- **Images** : toujours `next/image` avec `sizes` adapté ; `fill` + parent
  `relative aspect-X`. `priority` réservé aux hero above-the-fold.

## Routes principales

- `/` — globe 3D + sélecteur de pays
- `/pays/[slug]` — index recettes d'un pays
- `/pays/[slug]/[recipe]` — page recette magazine (redesign principal)
- `/parcourir` — toutes les recettes en grid filtrable
- `/mon-frigo` — sélection d'ingrédients → suggestions
- `/passeport` — recettes débloquées par l'utilisateur (PassportStamper)
- `/recommandations` — basé sur l'historique + saison + événements culturels
- `/gazette` — articles d'histoire culturelle

## Déploiement Vercel

- Repo : `Robz3377/GlobalFood`
- URL prod : `https://global-food.vercel.app/` (le slug Vercel est resté
  pré-rebrand ; le projet a été rebrandé "Map and Fork" mais l'URL `*.vercel.app`
  initiale ne change pas).
- Auto-deploy sur push vers `main`.
- `.npmrc` avec `legacy-peer-deps=true` est essentiel pour le build Vercel.
- Pas de variable d'environnement requise (l'app est 100% client + SSG).

## Quand tu interviens sur ce projet

1. **Toujours** vérifier `git status` et `git log` avant de modifier.
2. **Toujours** privilégier l'édition d'un fichier existant à la création.
3. **Toujours** lire `app/globals.css` pour la palette avant d'inventer des couleurs.
4. **Toujours** typer strictement les props (TS strict).
5. **Toujours** garder Server Components par défaut, `"use client"` uniquement
   si nécessaire.
6. **JAMAIS** créer `tailwind.config.*` — Tailwind v4 est inline.
7. **JAMAIS** retirer la migration `LEGACY_KEY` localStorage.
8. **JAMAIS** committer sans lire la diff complète d'abord.
9. Avant tout `npm install` : se rappeler que `legacy-peer-deps=true` est volontaire.
10. Pour le déploiement : un simple `git push origin main` déclenche Vercel.

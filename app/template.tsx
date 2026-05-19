/**
 * Template racine — rejoué à CHAQUE navigation.
 *
 * Contrairement à `layout.tsx` (persistant), `template.tsx` se remonte à
 * chaque changement de route. Le wrapper `.route-transition` rejoue donc le
 * keyframe `routeIn` (fondu + léger glissement, cf. app/globals.css) sur
 * toutes les navigations SPA — y compris au clic sur une recette.
 *
 * Server Component : zéro JS ajouté. L'API View Transitions (déclarée en CSS)
 * vient se superposer en amélioration progressive là où elle est supportée.
 */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="route-transition">{children}</div>;
}

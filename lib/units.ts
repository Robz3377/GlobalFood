/**
 * Formatage des quantités d'ingrédients — système métrique uniquement.
 *
 * Refonte v2 : le support du système impérial (oz, lb, fl oz, cup) a été
 * retiré. La cuisine du monde est plus précise en métrique (les fiches
 * authentiques sont toutes en g/ml) et le toggle Métrique/Impérial était
 * une fonctionnalité orpheline. On garde uniquement `format()` qui arrondit
 * proprement les quantités.
 */

function format(n: number): string {
  if (n === 0) return "0";
  if (n < 0.1) return n.toFixed(2).replace(/\.?0+$/, "");
  if (n < 10) return n.toFixed(1).replace(/\.?0+$/, "");
  return Math.round(n).toString();
}

/**
 * Renvoie l'affichage formaté d'une quantité+unité en métrique.
 * Compatibilité avec l'ancien signature : on garde un objet retour qui
 * inclut `qty` et `unit` originaux.
 */
export function formatQty(
  qty: number,
  unit: string
): { qty: number; unit: string; display: string } {
  return { qty, unit, display: `${format(qty)} ${unit}` };
}

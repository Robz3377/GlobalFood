// Strips diacritics (combining marks U+0300–U+036F) for accent-insensitive
// matching. Used by Mon Frigo for ingredient lookup and Parcourir for grouping.
const DIACRITICS = /[̀-ͯ]/g;

export function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

export function ingredientMatches(needle: string, haystack: string): boolean {
  if (!needle) return false;
  return normalize(haystack).includes(normalize(needle));
}

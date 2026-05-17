// Approximate centroids for the available countries. Used by the globe
// to fly-to-country, by the search bar after selecting a result, and by
// the pulsing rings highlight.
export const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  japon: { lat: 36.2, lng: 138.2 },
  maroc: { lat: 31.8, lng: -7.1 },
  mexique: { lat: 23.6, lng: -102.5 },
  italie: { lat: 41.9, lng: 12.6 },
  inde: { lat: 20.6, lng: 78.9 },
  france: { lat: 46.2, lng: 2.2 },
  chine: { lat: 35.9, lng: 104.2 },
  thailande: { lat: 15.9, lng: 100.9 },
  bresil: { lat: -14.2, lng: -51.9 },
  grece: { lat: 39.1, lng: 21.8 },
  // v2.7 — nouveaux pays
  senegal: { lat: 14.5, lng: -14.5 }, // approximation Dakar / centre pays
  vietnam: { lat: 16.0, lng: 108.0 }, // centre du pays (entre Hanoï et Hô Chi Minh)
};

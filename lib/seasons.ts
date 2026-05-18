import type { CulturalEvent, Season } from "./types";

export function getSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1; // 1..12
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

export const SEASON_LABELS: Record<Season, string> = {
  winter: "Hiver",
  spring: "Printemps",
  summer: "Été",
  autumn: "Automne",
};

// Approximate dates for the next ~12 months. Enough to drive a friendly
// "active around the clock" boost. For a real product, link to a proper
// lunar calendar.
type EventDef = {
  id: CulturalEvent;
  label: string;
  date: { month: number; day: number };
};

/**
 * Calendrier culturel élargi v2.2 — couvre tous les pays disponibles.
 * Dates approximatives (les fêtes lunaires varient légèrement chaque
 * année) ; pour un produit réel, brancher sur une vraie API de calendrier
 * liturgique/lunaire.
 *
 * Mapping pays ↔ event :
 *   🇨🇳 Chine    → chinese-new-year (févr)
 *   🇧🇷 Brésil   → carnaval (févr/mars selon Mardi Gras)
 *   🇲🇦 Maroc    → ramadan-end (mars selon hégire)
 *   🇮🇳 Inde     → holi (mars) + diwali (oct/nov)
 *   🇫🇷 France   → easter (avr) + bastille-day (juil)
 *   🇬🇷 Grèce    → orthodox-easter (avr)
 *   🇹🇭 Thaï     → songkran (avr, nouvel an thaï)
 *   🇯🇵 Japon    → hanami (avr, cerisiers en fleurs)
 *   🇲🇽 Mexique  → cinco-de-mayo (mai) + dia-de-los-muertos (nov)
 *   🇮🇹 Italie   → ferragosto (août)
 *   🌍 Universel → christmas (déc), easter (avr)
 */
const EVENTS: EventDef[] = [
  { id: "chinese-new-year", label: "Nouvel An Chinois", date: { month: 2, day: 17 } },
  { id: "carnaval", label: "Carnaval de Rio (Brésil)", date: { month: 2, day: 14 } },
  { id: "holi", label: "Holi — fête des couleurs (Inde)", date: { month: 3, day: 14 } },
  { id: "ramadan-end", label: "Aïd el-Fitr", date: { month: 3, day: 20 } },
  { id: "hanami", label: "Hanami — cerisiers en fleurs (Japon)", date: { month: 4, day: 1 } },
  { id: "easter", label: "Pâques", date: { month: 4, day: 5 } },
  { id: "orthodox-easter", label: "Pâques orthodoxe (Grèce)", date: { month: 4, day: 12 } },
  { id: "songkran", label: "Songkran — Nouvel An thaï (Thaïlande)", date: { month: 4, day: 13 } },
  { id: "cinco-de-mayo", label: "Cinco de Mayo (Mexique)", date: { month: 5, day: 5 } },
  { id: "bastille-day", label: "Fête nationale française", date: { month: 7, day: 14 } },
  { id: "ferragosto", label: "Ferragosto (Italie)", date: { month: 8, day: 15 } },
  { id: "dia-de-los-muertos", label: "Día de los Muertos (Mexique)", date: { month: 11, day: 1 } },
  { id: "diwali", label: "Diwali — fête des lumières (Inde)", date: { month: 11, day: 8 } },
  { id: "christmas", label: "Noël", date: { month: 12, day: 25 } },
];

export function getActiveEvents(
  date: Date = new Date(),
  windowDays = 15
): { id: CulturalEvent; label: string; daysAway: number }[] {
  const ref = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return EVENTS.map(({ id, label, date: d }) => {
    const candidates = [
      new Date(date.getFullYear() - 1, d.month - 1, d.day).getTime(),
      new Date(date.getFullYear(), d.month - 1, d.day).getTime(),
      new Date(date.getFullYear() + 1, d.month - 1, d.day).getTime(),
    ];
    const closest = candidates.reduce((a, b) =>
      Math.abs(b - ref) < Math.abs(a - ref) ? b : a
    );
    const daysAway = Math.round((closest - ref) / 86_400_000);
    return { id, label, daysAway };
  })
    .filter((e) => Math.abs(e.daysAway) <= windowDays)
    .sort((a, b) => Math.abs(a.daysAway) - Math.abs(b.daysAway));
}

export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

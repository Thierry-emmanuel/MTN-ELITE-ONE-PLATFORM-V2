import type { PlayerStat } from '@/types/football.types';

/**
 * Composite performance rating, 5.0–9.9, in the spirit of Sofascore's match-rating
 * system — a single number that lets you compare a striker to a defender at a glance.
 * Weighted per-90 output + disciplinary penalty + passing reliability.
 */
export function computeRating(p: PlayerStat): number {
  const mins = Math.max(p.minutesPlayed, 1);
  const per90 = (v: number) => (v / mins) * 90;

  const attack =
    per90(p.goals) * 1.55 +
    per90(p.assists) * 1.05 +
    per90(p.keyPasses) * 0.12 +
    per90(p.shotsOnTarget) * 0.09;

  const reliability = ((p.passAccuracy ?? 76) - 76) / 55;
  const discipline = (p.yellowCards * 0.11 + p.redCards * 0.55) / Math.max(p.appearances, 1);

  const raw = 6.35 + attack + reliability - discipline;
  return Math.min(9.8, Math.max(5.0, Math.round(raw * 10) / 10));
}

export function ratingTone(rating: number): { text: string; bg: string; ring: string } {
  if (rating >= 8.3) return { text: 'text-[#0B2B18]', bg: 'bg-[#22C55E]', ring: 'ring-[#22C55E]/40' };
  if (rating >= 7.2) return { text: 'text-[#0B2B18]', bg: 'bg-[#84CC16]', ring: 'ring-[#84CC16]/35' };
  if (rating >= 6.2) return { text: 'text-black',      bg: 'bg-[#FCD116]', ring: 'ring-[#FCD116]/35' };
  return { text: 'text-white', bg: 'bg-[#EF4444]', ring: 'ring-[#EF4444]/35' };
}

/** Percentile of a value within a list (0-100), used for radar / percentile bars. */
export function percentileOf(value: number, all: number[]): number {
  if (all.length === 0) return 50;
  const sorted = [...all].sort((a, b) => a - b);
  const below = sorted.filter(v => v <= value).length;
  return Math.round((below / sorted.length) * 100);
}

export function per90(value: number, minutes: number): number {
  return minutes > 0 ? (value / minutes) * 90 : 0;
}

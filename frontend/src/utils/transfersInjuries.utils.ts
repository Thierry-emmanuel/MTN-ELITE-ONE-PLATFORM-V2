// ─── Dates ──────────────────────────────────────────────────────────────────

const MS_DAY = 86_400_000;

const FR_MONTHS_SHORT = [
  'jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc',
];

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${FR_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString('fr-FR', { weekday: 'long' });
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} ${d.getDate()} ${FR_MONTHS_SHORT[d.getMonth()]}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_DAY);
}

export function daysFromToday(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / MS_DAY);
}

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / MS_DAY));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff} j`;
  const weeks = Math.round(diff / 7);
  return `Il y a ${weeks} sem.`;
}

/** 0–100 recovery completion, clamped. Undefined expectedReturn ⇒ null (unknown timeline). */
export function recoveryProgress(injuredAt: string, expectedReturn?: string): number | null {
  if (!expectedReturn) return null;
  const total = daysBetween(injuredAt, expectedReturn);
  if (total <= 0) return 100;
  const elapsed = daysBetween(injuredAt, new Date().toISOString());
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

// ─── Money ──────────────────────────────────────────────────────────────────

export function formatFee(fee?: number): string {
  if (fee === undefined || fee === null) return 'Indemnité non communiquée';
  if (fee === 0) return 'Libre';
  if (fee >= 1_000_000) {
    const millions = fee / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} M FCFA`;
  }
  return `${(fee / 1000).toFixed(0)} K FCFA`;
}

export function formatFeeCompact(fee?: number): string {
  if (!fee) return '—';
  if (fee >= 1_000_000) return `${(fee / 1_000_000).toFixed(1)}M`;
  return `${(fee / 1000).toFixed(0)}K`;
}

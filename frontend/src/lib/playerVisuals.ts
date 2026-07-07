const FLAG_EMOJI: Record<string, string> = {
  CMR: '🇨🇲', FRA: '🇫🇷', NGA: '🇳🇬', SEN: '🇸🇳', CIV: '🇨🇮', GHA: '🇬🇭',
  MLI: '🇲🇱', RSA: '🇿🇦', EGY: '🇪🇬', MAR: '🇲🇦', ALG: '🇩🇿', TUN: '🇹🇳',
  GAB: '🇬🇦', COD: '🇨🇩', BEL: '🇧🇪', ESP: '🇪🇸', POR: '🇵🇹',
};

export function flagFor(nationality?: string): string {
  return FLAG_EMOJI[nationality ?? 'CMR'] ?? '🌍';
}

/** Darken/lighten a hex color by a percentage (-1..1). Used for diagonal club-colour card gradients. */
export function shade(hex: string, percent: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + Math.round(255 * percent)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(255 * percent)));
  const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(255 * percent)));
  return `rgb(${r}, ${g}, ${b})`;
}

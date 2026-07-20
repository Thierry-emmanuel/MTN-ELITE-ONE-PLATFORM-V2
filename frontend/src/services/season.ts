import { apiClient } from './api';

/**
 * Season resolution (Sprint 2 — de-mock).
 * Replaces the hardcoded DEV_SEASON_ID ('1') that shipped with the mock
 * layer. Resolution order:
 *   1. VITE_SEASON_ID env override (ops pin a season during transitions)
 *   2. GET /seasons/current   (the season flagged ongoing by Season Builder)
 *   3. GET /seasons           (latest season as a last resort)
 * The resolved id is cached for the tab's lifetime; league staff switching
 * the current season is a deploy-level event, not a mid-session one.
 */

const ENV_SEASON = import.meta.env.VITE_SEASON_ID as string | undefined;

/** Stable token for react-query keys (the real id is resolved inside queryFns). */
export const SEASON_KEY = ENV_SEASON ?? 'current';

let cached: string | null = ENV_SEASON ?? null;
let inflight: Promise<string> | null = null;

export async function resolveSeasonId(): Promise<string> {
  if (cached) return cached;
  inflight ??= (async () => {
    try {
      const { data } = await apiClient.get<{ id: number | string }>('/seasons/current');
      cached = String(data.id);
    } catch {
      // No season flagged current — fall back to the most recent one.
      const { data } = await apiClient.get<any>('/seasons');
      const list = Array.isArray(data) ? data : data?.data ?? [];
      if (!list.length) throw new Error('Aucune saison disponible');
      cached = String(list[0].id);
    }
    return cached;
  })().finally(() => { inflight = null; });
  return inflight;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LeagueRef { id: string; label: string; country: string }
export interface SeasonRef { id: string; label: string }

interface ContextState {
  leagues: LeagueRef[];
  seasons: SeasonRef[];
  activeLeagueId: string;
  activeSeasonId: string;
  setLeague: (id: string) => void;
  setSeason: (id: string) => void;
}

/**
 * Global data scope (Vercel pattern). One league today — the control ships
 * now so multi-league later is a data change, not a UX change.
 */
export const useOSContext = create<ContextState>()(
  persist(
    (set) => ({
      leagues: [{ id: 'mtn-elite-one', label: 'MTN Elite One', country: 'CM' }],
      seasons: [
        { id: '2025-26', label: 'Saison 2025/26' },
        { id: '2024-25', label: 'Saison 2024/25' },
      ],
      activeLeagueId: 'mtn-elite-one',
      activeSeasonId: '2025-26',
      setLeague: (activeLeagueId) => set({ activeLeagueId }),
      setSeason: (activeSeasonId) => set({ activeSeasonId }),
    }),
    { name: 'fos.context' },
  ),
);

export const useActiveLeague = () =>
  useOSContext((s) => s.leagues.find((l) => l.id === s.activeLeagueId) ?? s.leagues[0]);
export const useActiveSeason = () =>
  useOSContext((s) => s.seasons.find((x) => x.id === s.activeSeasonId) ?? s.seasons[0]);

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { footballApi, QK, ApiError } from '../services/api';
import {
  MOCK_FIXTURES, MOCK_RESULTS, MOCK_STANDINGS, MOCK_PLAYER_STATS, MOCK_CLUB_STATS, DEV_SEASON_ID,
} from '../services/mockData';
import type {
  FixturesFilter, ResultsFilter, StandingsFilter, MatchDay,
  PlayerStatsFilter, ClubStatsFilter,
} from '../types/football.types';

const SEASON_ID =
  (import.meta.env.VITE_SEASON_ID as string | undefined) ?? DEV_SEASON_ID;

// ─── Stale times ──────────────────────────────────────────────────────────────
const STALE = {
  live:      15_000,   // 15 s  — live matches
  fixtures:  60_000,   // 1 min
  results:   300_000,  // 5 min — finished matches rarely change
  standings: 120_000,  // 2 min
} as const;

// ─── useFixtures ──────────────────────────────────────────────────────────────

export function useFixtures(filters?: Partial<FixturesFilter>) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK.fixtures(SEASON_ID, filters),
    queryFn: async () => {
      try {
        return await footballApi.getFixtures(SEASON_ID, {
          limit:   100,
          round:   filters?.round   ?? undefined,
          clubId:  filters?.clubId  ?? undefined,
          status:  filters?.status  ?? undefined,
        });
      } catch (err) {
        // Fallback to mock in dev / when API is unreachable
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
          return MOCK_FIXTURES;
        }
        throw err;
      }
    },
    staleTime: STALE.fixtures,
    // Refetch every 15 s when there are live matches
    refetchInterval: (query) => {
      const data = query.state.data as MatchDay[] | undefined;
      const hasLive = data?.some(d =>
        d.matches.some(m => m.status === 'LIVE' || m.status === 'HT'),
      );
      return hasLive ? STALE.live : false;
    },
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 2;
    },
  });

  // Prefetch next round when current data loads
  const prefetchNextRound = (currentRound: number) => {
    qc.prefetchQuery({
      queryKey: QK.fixtures(SEASON_ID, { ...filters, round: currentRound + 1 }),
      queryFn: () => footballApi.getFixtures(SEASON_ID, { round: currentRound + 1 }),
      staleTime: STALE.fixtures,
    });
  };

  return { ...query, prefetchNextRound };
}

// ─── useResults ───────────────────────────────────────────────────────────────

export function useResults(filters?: Partial<ResultsFilter>) {
  return useQuery({
    queryKey: QK.results(SEASON_ID, filters),
    queryFn: async () => {
      try {
        const res = await footballApi.getResults(SEASON_ID, {
          round:  filters?.round  ?? undefined,
          clubId: filters?.clubId ?? undefined,
        });
        const days = res.grouped ?? [];
        return days.length > 0 ? days : MOCK_RESULTS;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
          return MOCK_RESULTS;
        }
        throw err;
      }
    },
    staleTime: STALE.results,
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 2;
    },
  });
}

// ─── useStandings ─────────────────────────────────────────────────────────────

export function useStandings(filters?: Partial<StandingsFilter>) {
  return useQuery({
    queryKey: QK.standings(SEASON_ID, filters?.view),
    queryFn: async () => {
      try {
        const data = await footballApi.getStandings(SEASON_ID, {
          type: filters?.view ?? 'overall',
        });
        return data.length > 0 ? data : MOCK_STANDINGS;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
          return MOCK_STANDINGS;
        }
        throw err;
      }
    },
    staleTime: STALE.standings,
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 2;
    },
  });
}

// ─── useMatch — single match for expandable detail ────────────────────────────

export function useMatch(matchId: string | null) {
  return useQuery({
    queryKey: QK.match(matchId ?? ''),
    queryFn:  () => footballApi.getMatch(matchId!),
    enabled:  !!matchId,
    staleTime: STALE.live,
  });
}

// ─── useClubs ─────────────────────────────────────────────────────────────────
export function useClubs() {
  return useQuery({
    queryKey: QK.clubs(),
    queryFn: () => footballApi.getClubs(),
    staleTime: 300_000,
  });
}

// ─── useClub ──────────────────────────────────────────────────────────────────
export function useClub(id: string) {
  return useQuery({
    queryKey: QK.club(id),
    queryFn: () => footballApi.getClub(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

// ─── useClubSquad ─────────────────────────────────────────────────────────────
export function useClubSquad(id: string) {
  return useQuery({
    queryKey: QK.clubSquad(id),
    queryFn: () => footballApi.getClubSquad(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

// ─── useClubMatches ───────────────────────────────────────────────────────────
export function useClubMatches(id: string) {
  return useQuery({
    queryKey: QK.clubMatches(id),
    queryFn: () => footballApi.getClubMatches(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

// ─── useClubCoaches ───────────────────────────────────────────────────────────
export function useClubCoaches(id: string) {
  return useQuery({
    queryKey: QK.clubCoaches(id),
    queryFn: () => footballApi.getClubCoaches(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}

// ─── usePlayers ───────────────────────────────────────────────────────────────
export function usePlayers(filters?: { position?: string; clubId?: string }) {
  return useQuery({
    queryKey: QK.players(filters ?? {}),
    queryFn: () => footballApi.getPlayers(filters),
    staleTime: 120_000,
  });
}

// ─── usePlayer ────────────────────────────────────────────────────────────────
export function usePlayer(id: string) {
  return useQuery({
    queryKey: QK.player(id),
    queryFn: () => footballApi.getPlayer(id),
    enabled: !!id,
    staleTime: 120_000,
  });
}

// ─── useLegends ───────────────────────────────────────────────────────────────
export function useLegends() {
  return useQuery({
    queryKey: QK.legends(),
    queryFn: () => footballApi.getLegends(),
    staleTime: 300_000,
  });
}

// ─── useInjuries ──────────────────────────────────────────────────────────────
export function useInjuries(filters?: { status?: string; clubId?: string }) {
  return useQuery({
    queryKey: QK.injuries(filters ?? {}),
    queryFn: () => footballApi.getInjuries(filters),
    staleTime: 120_000,
  });
}

// ─── useTransfers ─────────────────────────────────────────────────────────────
export function useTransfers(filters?: { windowLabel?: string; clubId?: string }) {
  return useQuery({
    queryKey: QK.transfers(filters ?? {}),
    queryFn: () => footballApi.getTransfers(filters),
    staleTime: 60_000,
  });
}

// ─── usePlayerStats ───────────────────────────────────────────────────────────
export function usePlayerStats(seasonId: string, filters?: Omit<PlayerStatsFilter, 'seasonId'>) {
  return useQuery({
    queryKey: QK.playerStats(seasonId, filters),
    queryFn: async () => {
      try {
        const res = await footballApi.getPlayerStats(seasonId, filters);
        return res.data && res.data.length > 0 ? res.data : MOCK_PLAYER_STATS;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
          return MOCK_PLAYER_STATS;
        }
        throw err;
      }
    },
    staleTime: 120_000,
  });
}

// ─── useClubStats ─────────────────────────────────────────────────────────────
export function useClubStats(seasonId: string, filters?: Omit<ClubStatsFilter, 'seasonId'>) {
  return useQuery({
    queryKey: QK.clubStats(seasonId, filters),
    queryFn: async () => {
      try {
        const res = await footballApi.getClubStats(seasonId, filters);
        return res.data && res.data.length > 0 ? res.data : MOCK_CLUB_STATS;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
          return MOCK_CLUB_STATS;
        }
        throw err;
      }
    },
    staleTime: 120_000,
  });
}
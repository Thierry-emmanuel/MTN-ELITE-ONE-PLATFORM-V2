import { useQuery, useQueryClient } from '@tanstack/react-query';
import { footballApi, QK, ApiError } from '../services/api';
import { SEASON_KEY, resolveSeasonId } from '../services/season';
import type {
  FixturesFilter, ResultsFilter, StandingsFilter, MatchDay, Match,
  PlayerStatsFilter, ClubStatsFilter,
} from '../types/football.types';

// Sprint 2 (de-mock): the season id is resolved from GET /seasons/current
// inside each queryFn; SEASON_KEY keeps react-query keys stable.
const SEASON_ID = SEASON_KEY;

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
      const sid = await resolveSeasonId();
      return footballApi.getFixtures(sid, {
        limit:   100,
        round:   filters?.round   ?? undefined,
        clubId:  filters?.clubId  ?? undefined,
        status:  filters?.status  ?? undefined,
      });
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
      queryFn: async () =>
        footballApi.getFixtures(await resolveSeasonId(), { round: currentRound + 1 }),
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
      const sid = await resolveSeasonId();
      const res = await footballApi.getResults(sid, {
        round:  filters?.round  ?? undefined,
        clubId: filters?.clubId ?? undefined,
      });
      return res.grouped ?? [];
    },
    staleTime: STALE.results,
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 2;
    },
  });
}

// ─── useMatch ─────────────────────────────────────────────────────────────────

export function useMatch(matchId: string | null) {
  return useQuery({
    queryKey: QK.match(matchId ?? ''),
    queryFn: () => footballApi.getMatch(matchId!),
    staleTime: STALE.live, // Short stale time for live updates
    enabled: !!matchId,
    refetchInterval: (query) => {
      const match = query.state.data;
      return (match?.status === 'LIVE' || match?.status === 'HT') ? STALE.live : false;
    },
  });
}

// ─── useMatchStats ────────────────────────────────────────────────────────────
// Team-level stats (possession, shots, cards…). Sprint 2: no fabricated
// fallback — when the backend has no stats for a match the query errors and
// the Match Center shows its empty state instead of invented numbers.

export function useMatchStats(match: Match | undefined | null) {
  const matchId = match?.id ? String(match.id) : '';
  return useQuery({
    queryKey: QK.matchStats(matchId),
    queryFn: () => footballApi.getMatchStats(matchId),
    staleTime: STALE.live,
    enabled: !!match,
    refetchInterval: () => (match?.status === 'LIVE' || match?.status === 'HT') ? STALE.live : false,
  });
}

// ─── useMatchLineups ──────────────────────────────────────────────────────────

export function useMatchLineups(match: Match | undefined | null) {
  const matchId = match?.id ? String(match.id) : '';
  return useQuery({
    queryKey: QK.matchLineups(matchId),
    queryFn: () => footballApi.getMatchLineups(matchId),
    staleTime: STALE.fixtures,
    enabled: !!match,
  });
}

// ─── useHeadToHead ────────────────────────────────────────────────────────────

export function useHeadToHead(match: Match | undefined | null) {
  const matchId = match?.id ? String(match.id) : '';
  return useQuery({
    queryKey: QK.headToHead(matchId),
    queryFn: () => footballApi.getHeadToHead(matchId),
    staleTime: STALE.results,
    enabled: !!match,
  });
}

// ─── useStandings ─────────────────────────────────────────────────────────────

export function useStandings(filters?: Partial<StandingsFilter>) {
  return useQuery({
    queryKey: QK.standings(SEASON_ID, filters?.view),
    queryFn: async () => {
      const sid = await resolveSeasonId();
      return footballApi.getStandings(sid, { type: filters?.view ?? 'overall' });
    },
    staleTime: STALE.standings,
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 2;
    },
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
      const sid = seasonId === 'current' ? await resolveSeasonId() : seasonId;
      const res = await footballApi.getPlayerStats(sid, filters);
      return res.data ?? [];
    },
    staleTime: 120_000,
  });
}

// ─── useTopPerformers ─────────────────────────────────────────────────────────
/** Top N performers for a stat category (e.g. season top scorer for nav spotlight). */
export function useTopPerformers(category: Parameters<typeof footballApi.getTopPerformers>[1] = 'goals', limit = 1) {
  return useQuery({
    queryKey: QK.topPerformers(SEASON_ID, category),
    queryFn: async () => footballApi.getTopPerformers(await resolveSeasonId(), category, limit),
    staleTime: 120_000,
    retry: (count, err) => {
      if (err instanceof ApiError && err.status < 500) return false;
      return count < 1;
    },
  });
}

// ─── useClubStats ─────────────────────────────────────────────────────────────
export function useClubStats(seasonId: string, filters?: Omit<ClubStatsFilter, 'seasonId'>) {
  return useQuery({
    queryKey: QK.clubStats(seasonId, filters),
    queryFn: async () => {
      const sid = seasonId === 'current' ? await resolveSeasonId() : seasonId;
      const res = await footballApi.getClubStats(sid, filters);
      return res.data ?? [];
    },
    staleTime: 120_000,
  });
}
/**
 * Football Intelligence — data access. READ-ONLY composition of EXISTING
 * backend services; this layer owns no football data and duplicates no
 * backend calculation. Sources:
 *   /seasons /competitions        → context + configuration (Phase 5)
 *   /standings/season/:id         → table, form guides, home/away splits
 *   /stats/*                      → scorers, assisters, player/club aggregates
 *   /matches?seasonId             → results, formations, referees
 *   /transfers /injuries /talents → movement, availability, prospects
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { SeasonConfig } from '@/features/admin/configs/seasons.config';
import type { CompetitionConfig } from '@/features/admin/configs/competitions.config';

const list = <T,>(body: T[] | { data: T[] }): T[] => (Array.isArray(body) ? body : body.data);

export interface SeasonRow { id: number; name: string; status?: string; competitionId?: number | null; config?: SeasonConfig }
export interface StandingRow {
  clubId: number; position: number; points: number; played: number;
  won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
  formGuide?: string[];
  homePlayed: number; homeWon: number; homeDrawn: number; homeLost: number;
  awayPlayed: number; awayWon: number; awayDrawn: number; awayLost: number;
  club?: { id: number; name: string; logoUrl?: string };
}
export interface ScorerRow { playerId?: number; id?: number; playerName?: string; firstName?: string; lastName?: string; clubName?: string; club?: { name?: string }; goals?: number; assists?: number; matches?: number; played?: number }
export interface PlayerStatRow {
  playerId: number; playerName?: string; firstName?: string; lastName?: string;
  position?: string; clubId?: number; clubName?: string; nationality?: string; birthDate?: string;
  minutes?: number; minutesPlayed?: number; goals?: number; assists?: number;
  yellowCards?: number; redCards?: number; cleanSheets?: number; matches?: number;
}
export interface MatchRow {
  id: number; round: number; status: string; scheduledAt: string;
  homeClubId: number; awayClubId: number; homeScore: number | null; awayScore: number | null;
  referee?: string | null; homeFormation?: string | null; awayFormation?: string | null;
  homeClub?: { name?: string }; awayClub?: { name?: string };
}

export const useSeasons = () => useQuery({
  queryKey: ['intel', 'seasons'],
  queryFn: async () => list<SeasonRow>((await apiClient.get('/seasons')).data),
  staleTime: 60_000,
});

export const useSeasonMeta = (seasonId?: number) => useQuery({
  queryKey: ['intel', 'season', seasonId],
  queryFn: async () => (await apiClient.get<SeasonRow>(`/seasons/${seasonId}`)).data,
  enabled: !!seasonId, staleTime: 60_000,
});

export const useCompetitionMeta = (competitionId?: number | null) => useQuery({
  queryKey: ['intel', 'competition', competitionId],
  queryFn: async () => (await apiClient.get<{ id: number; name: string; config?: CompetitionConfig }>(`/competitions/${competitionId}`)).data,
  enabled: !!competitionId, staleTime: 60_000,
});

export const useStandings = (seasonId?: number) => useQuery({
  queryKey: ['intel', 'standings', seasonId],
  queryFn: async () => list<StandingRow>((await apiClient.get(`/standings/season/${seasonId}`)).data),
  enabled: !!seasonId, staleTime: 30_000,
});

export const useTopScorers = (seasonId?: number, limit = 10) => useQuery({
  queryKey: ['intel', 'topscorers', seasonId, limit],
  queryFn: async () => list<ScorerRow>((await apiClient.get('/stats/top-scorers', { params: { seasonId, limit } })).data),
  enabled: !!seasonId, staleTime: 30_000,
});

export const useTopAssisters = (seasonId?: number, limit = 10) => useQuery({
  queryKey: ['intel', 'topassisters', seasonId, limit],
  queryFn: async () => list<ScorerRow>((await apiClient.get('/stats/top-assisters', { params: { seasonId, limit } })).data),
  enabled: !!seasonId, staleTime: 30_000,
});

/** Per-player aggregates — one page of up to 300 rows covers a 18-club league. */
export const usePlayerStats = (seasonId?: number, extra?: Record<string, unknown>) => useQuery({
  queryKey: ['intel', 'playerstats', seasonId, extra],
  queryFn: async () => {
    const { data } = await apiClient.get('/stats/players', { params: { season: seasonId, limit: 300, ...extra } });
    return list<PlayerStatRow>(data.items ?? data);
  },
  enabled: !!seasonId, staleTime: 30_000,
});

export const useSeasonMatches = (seasonId?: number) => useQuery({
  queryKey: ['intel', 'matches', seasonId],
  queryFn: async () => {
    const { data } = await apiClient.get('/matches', { params: { seasonId, limit: 400 } });
    return list<MatchRow>(data);
  },
  enabled: !!seasonId, staleTime: 30_000,
});

export const useSeasonSummary = (seasonId?: number) => useQuery({
  queryKey: ['intel', 'summary', seasonId],
  queryFn: async () => (await apiClient.get<Record<string, number>>(`/stats/season/${seasonId}/summary`)).data,
  enabled: !!seasonId, staleTime: 30_000,
});

export const useTransfers = () => useQuery({
  queryKey: ['intel', 'transfers'],
  queryFn: async () => list<{ playerId: number; fromClubId?: number; toClubId?: number; type?: string }>((await apiClient.get('/transfers')).data),
  staleTime: 60_000,
});

export const useActiveInjuries = () => useQuery({
  queryKey: ['intel', 'injuries'],
  queryFn: async () => list<{ playerId: number; clubId?: number; status: string }>((await apiClient.get('/injuries')).data)
    .filter((i) => i.status === 'ACTIVE' || i.status === 'RECOVERING'),
  staleTime: 60_000,
});

export const useTalents = () => useQuery({
  queryKey: ['intel', 'talents'],
  queryFn: async () => list<Record<string, unknown> & { _id?: string; id?: string }>((await apiClient.get('/talents')).data),
  staleTime: 60_000,
});

export const usePlayers = () => useQuery({
  queryKey: ['intel', 'players'],
  queryFn: async () => list<{ id: number; firstName?: string; lastName?: string; birthDate?: string; nationality?: string; clubId?: number; position?: string }>((await apiClient.get('/players', { params: { limit: 600 } })).data),
  staleTime: 60_000,
});

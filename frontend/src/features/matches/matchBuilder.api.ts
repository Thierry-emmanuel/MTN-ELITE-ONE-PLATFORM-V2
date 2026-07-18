/**
 * Match Builder data layer — Phase 3.
 * Typed hooks over the REAL NestJS match endpoints. No business logic here:
 * the backend decides scores, status transitions and standings; these hooks
 * only declare events and re-read the authoritative state.
 *
 *   GET    /matches/:id            full match (events + relations)
 *   GET    /matches/:id/lineups    XI / bench / formations / pitch coords
 *   PATCH  /matches/:id/lineups    SetLineupsDto { home, away }
 *   GET    /matches/:id/stats      backend-aggregated team stats (read-only)
 *   POST   /matches/:id/events     AddEventDto → returns the full match
 *   DELETE /matches/:id/events/:e  undo → returns the full match
 *   GET    /players?clubId=…       squad source
 *   GET    /injuries               availability source (ACTIVE/RECOVERING)
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// ── Wire types (mirror backend entities — never re-derived client-side) ─────
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export type MatchEventType =
  | 'GOAL' | 'OWN_GOAL' | 'PENALTY_GOAL'
  | 'YELLOW_CARD' | 'RED_CARD' | 'SECOND_YELLOW'
  | 'SUBSTITUTION_IN' | 'SUBSTITUTION_OUT'
  | 'INJURY' | 'VAR' | 'KICKOFF' | 'HALF_TIME' | 'FULL_TIME';

export interface MatchEvent {
  id: number;
  type: MatchEventType;
  minute: number;
  extraTime: number;
  playerId: number | null;
  clubId: number | null;
  player?: { id: number; firstName?: string; lastName?: string; name?: string } | null;
}

export interface MatchDetail {
  id: number;
  round: number;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string | null;
  referee?: string | null;
  homeClubId: number;
  awayClubId: number;
  seasonId: number;
  homeFormation?: string | null;
  awayFormation?: string | null;
  homeClub?: { id: number; name: string; logoUrl?: string };
  awayClub?: { id: number; name: string; logoUrl?: string };
  season?: { id: number; name: string };
  events?: MatchEvent[];
}

export interface LineupEntry {
  playerId: number;
  position?: 'GK' | 'DF' | 'MF' | 'FW';
  shirtNumber?: number;
  isStarting?: boolean;
  isCaptain?: boolean;
  posX?: number;
  posY?: number;
}
export interface TeamLineup { formation?: string; entries: LineupEntry[] }
export interface MatchLineups { home: TeamLineup; away: TeamLineup }

export interface SquadPlayer {
  id: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  jerseyNumber?: number;
  photoUrl?: string;
}

export interface MatchStatsResult {
  home: Record<string, number>;
  away: Record<string, number>;
}

export const playerName = (p?: { firstName?: string; lastName?: string; name?: string } | null) =>
  p ? [p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || '—' : '—';

// ── Query keys ──────────────────────────────────────────────────────────────
export const matchKeys = {
  detail: (id: string | number) => ['matches', 'detail', String(id)] as const,
  lineups: (id: string | number) => ['matches', 'lineups', String(id)] as const,
  stats: (id: string | number) => ['matches', 'stats', String(id)] as const,
  clubPlayers: (clubId: number) => ['players', 'club', clubId] as const,
  injuries: ['injuries', 'availability'] as const,
};

// ── Reads ───────────────────────────────────────────────────────────────────
export function useMatchDetail(id: string | null) {
  return useQuery({
    queryKey: matchKeys.detail(id ?? 'new'),
    queryFn: async () => (await apiClient.get<MatchDetail>(`/matches/${id}`)).data,
    enabled: !!id,
    staleTime: 5_000,
  });
}

export function useMatchLineups(id: string | null) {
  return useQuery({
    queryKey: matchKeys.lineups(id ?? 'new'),
    queryFn: async () => {
      const raw = (await apiClient.get<Partial<MatchLineups>>(`/matches/${id}/lineups`)).data;
      return {
        home: { formation: raw.home?.formation, entries: raw.home?.entries ?? [] },
        away: { formation: raw.away?.formation, entries: raw.away?.entries ?? [] },
      } satisfies MatchLineups;
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useMatchStats(id: string | null, enabled = true) {
  return useQuery({
    queryKey: matchKeys.stats(id ?? 'new'),
    queryFn: async () => (await apiClient.get<MatchStatsResult>(`/matches/${id}/stats`)).data,
    enabled: !!id && enabled,
    staleTime: 10_000,
  });
}

export function useClubPlayers(clubId?: number) {
  return useQuery({
    queryKey: matchKeys.clubPlayers(clubId ?? 0),
    queryFn: async () => {
      const res = await apiClient.get<SquadPlayer[] | { data: SquadPlayer[] }>('/players', {
        params: { clubId, limit: 60, isActive: true },
      });
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
    enabled: !!clubId,
    staleTime: 60_000,
  });
}

/** playerId → true for players currently unavailable (ACTIVE/RECOVERING injuries). */
export function useUnavailablePlayers() {
  return useQuery({
    queryKey: matchKeys.injuries,
    queryFn: async () => {
      const res = await apiClient.get<Array<{ playerId?: number; player_id?: number; status: string }> | { data: any[] }>('/injuries');
      const rows = Array.isArray(res.data) ? res.data : res.data.data;
      const out: Record<number, boolean> = {};
      for (const r of rows) {
        if (r.status === 'ACTIVE' || r.status === 'RECOVERING') {
          const pid = Number(r.playerId ?? r.player_id);
          if (pid) out[pid] = true;
        }
      }
      return out;
    },
    staleTime: 60_000,
  });
}

// ── Writes (every call hits the backend immediately) ────────────────────────
export function useMatchMutations(id: string) {
  const qc = useQueryClient();
  const refresh = (fresh?: MatchDetail) => {
    if (fresh) qc.setQueryData(matchKeys.detail(id), fresh);
    qc.invalidateQueries({ queryKey: matchKeys.detail(id) });
    qc.invalidateQueries({ queryKey: matchKeys.stats(id) });
    qc.invalidateQueries({ queryKey: ['matches'], exact: false });
  };

  const addEvent = useMutation({
    mutationFn: async (dto: {
      type: MatchEventType; minute: number; extraTime?: number; playerId?: number; clubId?: number;
    }) => (await apiClient.post<MatchDetail>(`/matches/${id}/events`, dto)).data,
    onSuccess: refresh,
  });

  const removeEvent = useMutation({
    mutationFn: async (eventId: number) =>
      (await apiClient.delete<MatchDetail>(`/matches/${id}/events/${eventId}`)).data,
    onSuccess: refresh,
  });

  const saveLineups = useMutation({
    mutationFn: async (dto: MatchLineups) =>
      (await apiClient.patch(`/matches/${id}/lineups`, dto)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: matchKeys.lineups(id) });
      qc.invalidateQueries({ queryKey: matchKeys.detail(id) });
    },
  });

  return { addEvent, removeEvent, saveLineups };
}

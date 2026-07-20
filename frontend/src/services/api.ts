import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  MatchDay, Standing, GroupedMatchResponse,
  PlayerStat, ClubStat, PaginatedResponse,
  PlayerStatsFilter, ClubStatsFilter, TopPerformer, StatCategory,
  MatchStatsResponse, MatchLineups, HeadToHead,
} from '../types/football.types';
import type { InjuryRecord, TransferRecord } from '../types/transfersInjuries.types';
// Sprint 2 (de-mock): withClubProfile only ENRICHES real clubs with editorial
// branding (colors, hero imagery). It is no longer a data source and no mock
// records survive anywhere in this client.
import { withClubProfile } from './clubProfileData';
import type { Club, CoachStaff } from '../types/football.types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api/v1';
const DEFAULT_TIMEOUT = 10_000;

// ─── Custom error class ───────────────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const createClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('mtn_token');
    if (token) {
      // AxiosHeaders instance in axios ≥1.x — use set() instead of assigning
      // a bare object, which fails under stricter TS 5.x narrowing.
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      if (err.code === 'ECONNABORTED') {
        return Promise.reject(new ApiError(408, 'La requête a expiré. Vérifiez votre connexion.'));
      }
      if (!err.response) {
        return Promise.reject(new ApiError(0, 'Impossible de joindre le serveur.'));
      }
      const status = err.response.status;

      // ── Sprint 1: silent refresh-token rotation on 401 ────────────────
      // The access token is short-lived (15 min); when it expires, one
      // attempt is made to rotate the refresh token, then the original
      // request is replayed. On failure the stale credentials are cleared.
      const original = err.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
      const refreshToken = localStorage.getItem('mtn_refresh');
      const isAuthRoute = original?.url?.includes('/auth/');
      if (status === 401 && refreshToken && original && !original._retried && !isAuthRoute) {
        original._retried = true;
        try {
          const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: DEFAULT_TIMEOUT },
          );
          localStorage.setItem('mtn_token', data.accessToken);
          localStorage.setItem('mtn_refresh', data.refreshToken);
          return client.request(original);
        } catch {
          localStorage.removeItem('mtn_token');
          localStorage.removeItem('mtn_refresh');
          localStorage.removeItem('mtn_user');
        }
      }

      const data   = err.response.data as Record<string, unknown>;
      const message =
        (typeof data?.message === 'string' ? data.message : null) ??
        HTTP_MESSAGES[status] ??
        'Une erreur inattendue est survenue.';
      return Promise.reject(new ApiError(status, message, data?.code as string));
    },
  );

  return client;
};

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Requête invalide.',
  401: 'Authentification requise.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  429: 'Trop de requêtes. Réessayez dans un moment.',
  500: 'Erreur serveur. Nos équipes ont été alertées.',
  503: 'Service temporairement indisponible.',
};

export const apiClient = createClient();

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const footballApi = {
  // ── Matches ────────────────────────────────────────────────────────────────

  getResults: (
    seasonId: string,
    params?: { page?: number; pageSize?: number; round?: number; clubId?: string },
  ) =>
    get<GroupedMatchResponse>(`/matches/results/${seasonId}`, { params }),

  getFixtures: (
    seasonId: string,
    params?: { limit?: number; round?: number; clubId?: string; status?: string },
  ) =>
    get<MatchDay[]>(`/matches/fixtures/${seasonId}`, { params }),

  getMatch: (matchId: string) =>
    get<import('../types/football.types').Match>(`/matches/${matchId}`),

  /** GET /matches/:id/stats — aggregated team stats (shots, possession, cards…) */
  getMatchStats: (matchId: string) =>
    get<MatchStatsResponse>(`/matches/${matchId}/stats`),

  /** GET /matches/:id/lineups — starting XI, substitutes, formations */
  getMatchLineups: (matchId: string) =>
    get<MatchLineups>(`/matches/${matchId}/lineups`),

  /** GET /matches/:id/head-to-head — past meetings between the two clubs */
  getHeadToHead: (matchId: string, limit = 6) =>
    get<HeadToHead>(`/matches/${matchId}/head-to-head`, { params: { limit } }),

  // ── Standings ──────────────────────────────────────────────────────────────

  getStandings: (
    seasonId: string,
    params?: { type?: 'overall' | 'home' | 'away' | 'form' },
  ) =>
    get<Standing[]>(`/standings/${seasonId}`, { params }),

  // ── Player Stats ───────────────────────────────────────────────────────────

  /**
   * GET /stats/players
   * Returns paginated player stats with optional filtering/sorting.
   * Query params: season, teamId, position, minMinutes, sort, order, page, limit
   */
  getPlayerStats: (
    seasonId: string,
    filters?: Omit<PlayerStatsFilter, 'seasonId'>,
  ) =>
    get<PaginatedResponse<PlayerStat>>('/stats/players', {
      params: { season: seasonId, ...filters },
    }),

  /**
   * GET /stats/clubs
   * Returns paginated club stats with optional sorting.
   */
  getClubStats: (
    seasonId: string,
    filters?: Omit<ClubStatsFilter, 'seasonId'>,
  ) =>
    get<PaginatedResponse<ClubStat>>('/stats/clubs', {
      params: { season: seasonId, ...filters },
    }),

  /**
   * GET /stats/top
   * Returns top N performers for a given category.
   * type: 'goals' | 'assists' | 'keyPasses' | 'shots' | 'cards'
   */
  getTopPerformers: (
    seasonId: string,
    category: StatCategory,
    limit = 10,
  ) =>
    get<TopPerformer[]>('/stats/top', {
      params: { season: seasonId, type: category, limit },
    }),

  /**
   * GET /stats/season/:seasonId/summary
   * Returns aggregate season stats (total goals, avg per match, etc.)
   */
  getSeasonSummary: (seasonId: string) =>
    get<{
      totalGoals: number;
      avgGoalsPerMatch: number;
      totalYellowCards: number;
      totalRedCards: number;
      topScorerGoals: number;
      cleanSheets: number;
    }>(`/stats/season/${seasonId}/summary`),

  // ── Clubs ──────────────────────────────────────────────────────────────────
  getClubs: async (): Promise<Club[]> => {
    const res = await get<any>('/clubs');
    // NestJS backend returns paginated or array, handle both
    const list: Club[] = Array.isArray(res) ? res : res.data ?? [];
    return list.map(withClubProfile);
  },

  getClub: async (id: string): Promise<Club> => {
    const club = await get<Club>(`/clubs/${id}`);
    return withClubProfile(club);
  },

  getClubSquad: async (id: string) => {
    try {
      // Backend returns the full Club entity with a nested `players` relation,
      // not a bare array — extract it here.
      const res = await get<any>(`/clubs/${id}/squad`);
      const players = Array.isArray(res) ? res : (res?.players ?? []);
      return players as any[];
    } catch (e) {
      console.warn(`Failed to fetch squad for club ${id}.`, e);
      return [];
    }
  },

  getClubMatches: async (id: string) => {
    try {
      const res = await get<any>(`/clubs/${id}/matches`);
      if (Array.isArray(res)) return res;
      const homeMatches = res?.homeMatches ?? [];
      const awayMatches = res?.awayMatches ?? [];
      return [...homeMatches, ...awayMatches];
    } catch (e) {
      console.warn(`Failed to fetch matches for club ${id}.`, e);
      return [];
    }
  },

  // ── Coaching staff ────────────────────────────────────────────────────────
  getClubCoaches: async (id: string): Promise<CoachStaff[]> => {
    try {
      const res = await get<any>('/coaches', { params: { clubId: id } });
      return Array.isArray(res) ? res : res.data ?? [];
    } catch (e) {
      console.warn(`Failed to fetch coaching staff for club ${id}.`, e);
      return [];
    }
  },

  // ── Players ────────────────────────────────────────────────────────────────
  getPlayers: async (params?: { position?: string; clubId?: string }) => {
    const res = await get<any>('/players', { params });
    return Array.isArray(res) ? res : res.data ?? [];
  },

  getPlayer: async (id: string) => get<any>(`/players/${id}`),

  // ── Hall of Fame / History ─────────────────────────────────────────────────
  getLegends: async () => get<any[]>('/hall-of-fame'),

  // ── Injuries ───────────────────────────────────────────────────────────────
  getInjuries: async (params?: { status?: string; clubId?: string }): Promise<InjuryRecord[]> => {
    try {
      const res = await get<any>('/injuries', { params });
      const rawList = Array.isArray(res) ? res : res.data || [];
      return rawList.filter((i: any) => i.player?.club).map((i: any) => {
        // Coerce position from backend enum (e.g. DEF -> DF)
        const REVERSE_POS: Record<string, 'GK' | 'DF' | 'MF' | 'FW'> = {
          GK: 'GK', DEF: 'DF', MID: 'MF', FWD: 'FW',
        };
        const pos = REVERSE_POS[i.player?.position] || 'MF';

        return {
          id: String(i.id),
          playerId: String(i.playerId),
          playerName: i.player ? [i.player.firstName, i.player.lastName].filter(Boolean).join(' ') : 'Inconnu',
          playerPhotoUrl: i.player?.photoUrl,
          position: pos,
          club: i.player.club,
          bodyPart: i.type || 'Autre',
          diagnosis: i.notes || 'Pas de diagnostic disponible',
          severity: i.severity || 'MINOR',
          status: i.status || 'ACTIVE',
          injuredAt: i.injuredAt,
          expectedReturn: i.expectedReturn || undefined,
          gamesMissed: 0,
          medicalNotes: i.notes || undefined,
          updatedAt: i.createdAt || i.injuredAt,
        } as InjuryRecord;
      });
    } catch (e) {
      console.warn('Failed to fetch injuries from backend.', e);
      return [];
    }
  },

  // ── Transfers ──────────────────────────────────────────────────────────────
  getTransfers: async (params?: { windowLabel?: string; clubId?: string }): Promise<TransferRecord[]> => {
    try {
      const res = await get<any>('/transfers', { params });
      const rawList = Array.isArray(res) ? res : res.data || [];
      return rawList.filter((t: any) => t.toClub).map((t: any) => {
        const REVERSE_POS: Record<string, 'GK' | 'DF' | 'MF' | 'FW'> = {
          GK: 'GK', DEF: 'DF', MID: 'MF', FWD: 'FW',
        };
        const pos = REVERSE_POS[t.player?.position] || 'MF';

        const birthYear = t.player?.birthDate ? new Date(t.player.birthDate).getFullYear() : 2004;

        return {
          id: String(t.id),
          playerId: String(t.playerId),
          playerName: t.player ? [t.player.firstName, t.player.lastName].filter(Boolean).join(' ') : 'Inconnu',
          playerPhotoUrl: t.player?.photoUrl,
          position: pos,
          age: 2026 - birthYear,
          fromClub: t.fromClub || null,
          toClub: t.toClub,
          kind: t.type || 'PERMANENT',
          stage: 'CONFIRMED',
          confidence: 5,
          fee: t.fee ? Number(t.fee) : undefined,
          windowLabel: t.windowLabel || 'Été 2025',
          transferDate: t.transferDate,
          announced: t.announced ?? true,
        } as TransferRecord;
      });
    } catch (e) {
      console.warn('Failed to fetch transfers from backend.', e);
      return [];
    }
  },
};

// ─── Query key factory ────────────────────────────────────────────────────────

export const QK = {
  results:        (seasonId: string, filters?: object) => ['results',    seasonId, filters] as const,
  fixtures:       (seasonId: string, filters?: object) => ['fixtures',   seasonId, filters] as const,
  standings:      (seasonId: string, type?: string)    => ['standings',  seasonId, type]    as const,
  match:          (matchId: string)                    => ['match',      matchId]            as const,
  matchStats:     (matchId: string)                    => ['matchStats', matchId]            as const,
  matchLineups:   (matchId: string)                    => ['matchLineups', matchId]          as const,
  headToHead:     (matchId: string)                    => ['headToHead', matchId]            as const,
  playerStats:    (seasonId: string, filters?: object) => ['playerStats',seasonId, filters] as const,
  clubStats:      (seasonId: string, filters?: object) => ['clubStats',  seasonId, filters] as const,
  topPerformers:  (seasonId: string, category: string) => ['topPerf',   seasonId, category] as const,
  seasonSummary:  (seasonId: string)                   => ['seasonSum',  seasonId]           as const,
  clubs:          ()                                   => ['clubs']                        as const,
  club:           (id: string)                         => ['club', id]                     as const,
  clubSquad:      (id: string)                         => ['clubSquad', id]                as const,
  clubMatches:    (id: string)                         => ['clubMatches', id]              as const,
  clubCoaches:    (id: string)                         => ['clubCoaches', id]              as const,
  players:        (filters?: object)                   => ['players', filters]             as const,
  player:         (id: string)                         => ['player', id]                   as const,
  legends:        ()                                   => ['legends']                      as const,
  injuries:       (filters?: object)                   => ['injuries', filters]            as const,
  transfers:      (filters?: object)                   => ['transfers', filters]           as const,
} as const;
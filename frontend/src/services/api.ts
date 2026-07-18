import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  MatchDay, Standing, GroupedMatchResponse,
  PlayerStat, ClubStat, PaginatedResponse,
  PlayerStatsFilter, ClubStatsFilter, TopPerformer, StatCategory,
  MatchStatsResponse, MatchLineups, HeadToHead,
} from '../types/football.types';
import { clubs as MOCK_CLUBS, legends as MOCK_LEGENDS } from '../components/elite/data';
import { MOCK_PLAYER_STATS, MOCK_FIXTURES } from './mockData';
import { MOCK_INJURIES, MOCK_TRANSFERS } from './transfersInjuriesMockData';
import type { InjuryRecord, TransferRecord } from '../types/transfersInjuries.types';
import { withClubProfile, getClubCoach } from './clubProfileData';
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
    (err: AxiosError) => {
      if (err.code === 'ECONNABORTED') {
        return Promise.reject(new ApiError(408, 'La requête a expiré. Vérifiez votre connexion.'));
      }
      if (!err.response) {
        return Promise.reject(new ApiError(0, 'Impossible de joindre le serveur.'));
      }
      const status = err.response.status;
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
    try {
      const res = await get<any>('/clubs');
      // NestJS backend returns paginated or array, handle both
      const list: Club[] = Array.isArray(res) ? res : res.data || Object.values(MOCK_CLUBS);
      return list.map(withClubProfile);
    } catch (e) {
      console.warn('Failed to fetch clubs from backend, using mock data.', e);
      return Object.values(MOCK_CLUBS).map(withClubProfile);
    }
  },

  getClub: async (id: string): Promise<Club> => {
    try {
      const club = await get<Club>(`/clubs/${id}`);
      return withClubProfile(club);
    } catch (e) {
      console.warn(`Failed to fetch club ${id} from backend, using mock data.`, e);
      const fallback = Object.values(MOCK_CLUBS).find(c => c.id === id) || MOCK_CLUBS.cot;
      return withClubProfile(fallback);
    }
  },

  getClubSquad: async (id: string) => {
    try {
      // Backend returns the full Club entity with a nested `players` relation,
      // not a bare array — extract it here.
      const res = await get<any>(`/clubs/${id}/squad`);
      const players = Array.isArray(res) ? res : (res?.players ?? []);
      return players as any[];
    } catch (e) {
      console.warn(`Failed to fetch squad for club ${id}, using mock players.`, e);
      return MOCK_PLAYER_STATS.filter(p => p.clubId === id);
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
      console.warn(`Failed to fetch matches for club ${id}, using mock fixtures.`, e);
      // Filter fixtures containing this club
      return MOCK_FIXTURES.flatMap(fd => fd.matches).filter(m => m.homeClub.id === id || m.awayClub.id === id);
    }
  },

  // ── Coaching staff ────────────────────────────────────────────────────────
  getClubCoaches: async (id: string): Promise<CoachStaff[]> => {
    try {
      const res = await get<any>('/coaches', { params: { clubId: id } });
      const list: CoachStaff[] = Array.isArray(res) ? res : res.data || [];
      if (list.length > 0) return list;
      const mock = getClubCoach(id);
      return mock ? [mock] : [];
    } catch (e) {
      console.warn(`Failed to fetch coaching staff for club ${id}, using mock data.`, e);
      const mock = getClubCoach(id);
      return mock ? [mock] : [];
    }
  },

  // ── Players ────────────────────────────────────────────────────────────────
  getPlayers: async (params?: { position?: string; clubId?: string }) => {
    try {
      const res = await get<any>('/players', { params });
      return Array.isArray(res) ? res : res.data || MOCK_PLAYER_STATS;
    } catch (e) {
      console.warn('Failed to fetch players, using mock data.', e);
      // Reverse-map backend enum values back to mock data short codes
      const REVERSE_POS: Record<string, string> = { DEF: 'DF', MID: 'MF', FWD: 'FW', GK: 'GK' };
      let filtered = [...MOCK_PLAYER_STATS];
      if (params?.position && params.position !== 'ALL') {
        const mockPos = REVERSE_POS[params.position] ?? params.position;
        filtered = filtered.filter(p => p.position === mockPos || p.position === params.position);
      }
      if (params?.clubId) {
        filtered = filtered.filter(p => p.clubId === params.clubId);
      }
      return filtered;
    }
  },

  getPlayer: async (id: string) => {
    try {
      return await get<any>(`/players/${id}`);
    } catch (e) {
      console.warn(`Failed to fetch player ${id}, using mock.`, e);
      return MOCK_PLAYER_STATS.find(p => p.playerId === id) || MOCK_PLAYER_STATS[0];
    }
  },

  // ── Hall of Fame / History ─────────────────────────────────────────────────
  getLegends: async () => {
    try {
      return await get<any[]>('/hall-of-fame');
    } catch (e) {
      console.warn('Failed to fetch hall-of-fame, using mock legends.', e);
      return MOCK_LEGENDS;
    }
  },

  // ── Injuries ───────────────────────────────────────────────────────────────
  getInjuries: async (params?: { status?: string; clubId?: string }): Promise<InjuryRecord[]> => {
    try {
      const res = await get<any>('/injuries', { params });
      const rawList = Array.isArray(res) ? res : res.data || [];
      if (rawList.length === 0) return MOCK_INJURIES;

      return rawList.map((i: any) => {
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
          club: i.player?.club || MOCK_CLUBS.cot, // fallback to avoid crash
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
      console.warn('Failed to fetch injuries from backend, using mock medical data.', e);
      return MOCK_INJURIES;
    }
  },

  // ── Transfers ──────────────────────────────────────────────────────────────
  getTransfers: async (params?: { windowLabel?: string; clubId?: string }): Promise<TransferRecord[]> => {
    try {
      const res = await get<any>('/transfers', { params });
      const rawList = Array.isArray(res) ? res : res.data || [];
      if (rawList.length === 0) return MOCK_TRANSFERS;

      return rawList.map((t: any) => {
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
          toClub: t.toClub || MOCK_CLUBS.cot,
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
      console.warn('Failed to fetch transfers from backend, using mock mercato data.', e);
      return MOCK_TRANSFERS;
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
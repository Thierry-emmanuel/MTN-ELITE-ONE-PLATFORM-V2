import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  MatchDay, Standing, GroupedMatchResponse,
  PlayerStat, ClubStat, PaginatedResponse,
  PlayerStatsFilter, ClubStatsFilter, TopPerformer, StatCategory,
} from '../types/football.types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
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
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
};

// ─── Query key factory ────────────────────────────────────────────────────────

export const QK = {
  results:        (seasonId: string, filters?: object) => ['results',    seasonId, filters] as const,
  fixtures:       (seasonId: string, filters?: object) => ['fixtures',   seasonId, filters] as const,
  standings:      (seasonId: string, type?: string)    => ['standings',  seasonId, type]    as const,
  match:          (matchId: string)                    => ['match',      matchId]            as const,
  playerStats:    (seasonId: string, filters?: object) => ['playerStats',seasonId, filters] as const,
  clubStats:      (seasonId: string, filters?: object) => ['clubStats',  seasonId, filters] as const,
  topPerformers:  (seasonId: string, category: string) => ['topPerf',   seasonId, category] as const,
  seasonSummary:  (seasonId: string)                   => ['seasonSum',  seasonId]           as const,
} as const;
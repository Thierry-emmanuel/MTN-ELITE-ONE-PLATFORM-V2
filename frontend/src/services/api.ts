import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  MatchDay, Standing, GroupedMatchResponse,
} from '../types/football.types';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
const DEFAULT_TIMEOUT = 10_000; // 10 s

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

  // Request interceptor — attach auth token if present
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('mtn_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Response interceptor — normalize errors
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
  /**
   * Returns finished matches grouped by matchday.
   */
  getResults: (
    seasonId: string,
    params?: { page?: number; pageSize?: number; round?: number; clubId?: string },
  ) =>
    get<GroupedMatchResponse>(`/matches/results/${seasonId}`, { params }),

  /**
   * Returns upcoming + live matches grouped by matchday.
   */
  getFixtures: (
    seasonId: string,
    params?: { limit?: number; round?: number; clubId?: string; status?: string },
  ) =>
    get<MatchDay[]>(`/matches/fixtures/${seasonId}`, { params }),

  /**
   * Returns standings. Optionally filter by type (overall/home/away/form).
   */
  getStandings: (
    seasonId: string,
    params?: { type?: 'overall' | 'home' | 'away' | 'form' },
  ) =>
    get<Standing[]>(`/standings/${seasonId}`, { params }),

  /**
   * Single match detail (for expandable result cards).
   */
  getMatch: (matchId: string) =>
    get<import('../types/football.types').Match>(`/matches/${matchId}`),
};

// ─── Query key factory — centralizes all cache keys ──────────────────────────

export const QK = {
  results:  (seasonId: string, filters?: object) =>
    ['results',  seasonId, filters] as const,
  fixtures: (seasonId: string, filters?: object) =>
    ['fixtures', seasonId, filters] as const,
  standings:(seasonId: string, type?: string)    =>
    ['standings',seasonId, type]   as const,
  match:    (matchId: string)                    =>
    ['match', matchId]             as const,
} as const;
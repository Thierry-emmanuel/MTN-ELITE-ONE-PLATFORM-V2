// ─── Types mapped from backend entities ──────────────────────────────────────

export interface ApiClub {
  id: string;
  name: string;
  city: string;
  stadium: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface ApiMatchEvent {
  id: string;
  minute: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION_IN' | 'SUBSTITUTION_OUT' | 'OWN_GOAL' | 'PENALTY_GOAL' | 'SECOND_YELLOW';
  playerName?: string;
  clubId: string;
}

export interface ApiMatch {
  id: string;
  round: number;
  scheduledAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  city: string | null;
  homeClub: ApiClub;
  awayClub: ApiClub;
  events?: ApiMatchEvent[];
}

export interface MatchDay {
  date: string;
  round: number;
  matches: ApiMatch[];
}

export interface ApiStanding {
  id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  formGuide: string[];
  homePlayed: number;
  homeWon: number;
  homeDrawn: number;
  homeLost: number;
  awayPlayed: number;
  awayWon: number;
  awayDrawn: number;
  awayLost: number;
  club: ApiClub;
}

export interface ApiSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api/v1';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ─── API endpoints ────────────────────────────────────────────────────────────

export const api = {
  /** GET /matches/fixtures/:seasonId */
  getFixtures: (seasonId: string, limit = 50) =>
    get<MatchDay[]>(`/matches/fixtures/${seasonId}?limit=${limit}`),

  /** GET /matches/results/:seasonId */
  getResults: (seasonId: string, page = 1, limit = 50) =>
    get<{ data: MatchDay[]; total: number; grouped: MatchDay[] }>(
      `/matches/results/${seasonId}?page=${page}&limit=${limit}`
    ),

  /** GET /standings/:seasonId */
  getStandings: (seasonId: string) =>
    get<ApiStanding[]>(`/standings/${seasonId}`),

  /** GET /seasons/current */
  getCurrentSeason: () =>
    get<ApiSeason>(`/seasons/current`),

  /** GET /clubs?page=1&limit=20 */
  getClubs: (page = 1, limit = 20) =>
    get<PaginatedResponse<ApiClub>>(`/clubs?page=${page}&limit=${limit}`),
};
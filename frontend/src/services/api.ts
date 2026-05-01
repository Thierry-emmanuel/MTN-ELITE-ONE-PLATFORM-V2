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
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
  playerName: string;
  clubId: string;
}

export interface ApiMatch {
  id: string;
  round: number;
  scheduledAt: string; // ISO timestamp
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  city: string | null;
  homeClub: ApiClub;
  awayClub: ApiClub;
  events?: ApiMatchEvent[];
}

// matches.controller returns MatchDay[] for fixtures/results
export interface MatchDay {
  date: string;    // "2026-05-01"
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
  formGuide: string[]; // ['W','D','L',...]
  club: ApiClub;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── Endpoints matching real NestJS controllers ───────────────────────────────

export const api = {
  /** GET /matches/fixtures/:seasonId */
  getFixtures: (seasonId: string, limit = 50) =>
    get<MatchDay[]>(`/matches/fixtures/${seasonId}?limit=${limit}`),

  /** GET /matches/results/:seasonId */
  getResults: (seasonId: string, page = 1, limit = 30) =>
    get<{ data: MatchDay[]; total: number }>(
      `/matches/results/${seasonId}?page=${page}&limit=${limit}`
    ),

  /** GET /standings/:seasonId */
  getStandings: (seasonId: string) =>
    get<ApiStanding[]>(`/standings/${seasonId}`),
};
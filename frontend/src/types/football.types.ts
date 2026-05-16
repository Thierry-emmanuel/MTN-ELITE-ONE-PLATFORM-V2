// ─── Primitives ───────────────────────────────────────────────────────────────

export type FormResult = 'W' | 'D' | 'L';

export type MatchStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HT'
  | 'FT'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'EXTRA_TIME'
  | 'PENALTIES';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  short: string;
  color: string;
  city: string;
  logoUrl?: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  capacity?: number;
}

export interface Referee {
  id: string;
  name: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW' | 'RED' | 'SUBSTITUTION' | 'PENALTY' | 'OWN_GOAL';
  playerName: string;
  clubId: string;
}

export interface Match {
  id: string;
  homeClub: Club;
  awayClub: Club;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffUtc: string;
  round: number;
  venue?: Venue;
  referee?: Referee;
  attendance?: number;
  liveMinute?: number;
  events?: MatchEvent[];
}

export interface MatchDay {
  round: number;
  date: string;
  matches: Match[];
}

// ─── Standings ────────────────────────────────────────────────────────────────

export interface Standing {
  id: string;
  position: number;
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  formGuide: FormResult[];
  homeWon?: number;
  homeDrawn?: number;
  homeLost?: number;
  awayWon?: number;
  awayDrawn?: number;
  awayLost?: number;
}

export type StandingsView = 'overall' | 'home' | 'away' | 'form';

export type Zone = 'champion' | 'caf' | 'relegation' | 'none';

export interface ApiClub {
  id: string;
  name: string;
  city?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export interface ApiMatch {
  id: string;
  status: MatchStatus;
  scheduledAt: string;
  round: number;
  homeScore: number | null;
  awayScore: number | null;
  venue?: Venue | string;
  city?: string;
  homeClub: ApiClub;
  awayClub: ApiClub;
  events?: MatchEvent[];
}

export interface ApiStanding {
  id: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  formGuide?: string[];
  homeWon?: number;
  homeDrawn?: number;
  awayWon?: number;
  awayDrawn?: number;
  club: ApiClub;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GroupedMatchResponse {
  data: MatchDay[];
  grouped: MatchDay[];
  total: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface FixturesFilter {
  round?: number;
  clubId?: string;
  status?: string;
  limit?: number;
}

export interface ResultsFilter {
  round?: number;
  clubId?: string;
  page?: number;
  pageSize?: number;
}

export interface StandingsFilter {
  view: StandingsView;
}

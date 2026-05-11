// ─── Primitives ───────────────────────────────────────────────────────────────

export type FormResult = 'W' | 'D' | 'L';

export type MatchStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'HT'
  | 'FT'
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

export const getZone = (pos: number, total: number): Zone => {
  if (pos === 1)        return 'champion';
  if (pos <= 3)         return 'caf';
  if (pos >= total - 1) return 'relegation';
  return 'none';
};
export interface ApiMatch {
  id: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  scheduledAt: string;
  round: number;
  homeScore: number | null;
  awayScore: number | null;
  venue?: string;
  city?: string;
  homeClub: { name: string; primaryColor?: string; };
  awayClub: { name: string; primaryColor?: string; };
}

export interface ApiStanding {
  id: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  formGuide?: string[];
  club: { name: string; city?: string; primaryColor?: string; };
}

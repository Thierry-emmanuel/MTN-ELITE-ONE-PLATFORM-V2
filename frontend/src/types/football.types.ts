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

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW' | 'ALL';

export type StatSortField =
  | 'goals' | 'assists' | 'keyPasses' | 'shots' | 'shotsOnTarget'
  | 'yellowCards' | 'redCards' | 'minutesPlayed' | 'appearances'
  | 'xG' | 'penaltiesScored' | 'passAccuracy'
  | 'goalsFor' | 'goalsAgainst' | 'wins' | 'cleanSheets' | 'possession';

export type StatCategory =
  | 'goals' | 'assists' | 'keyPasses' | 'shots' | 'cards' | 'minutes';

export type ClubStatCategory =
  | 'offensive' | 'defensive' | 'discipline' | 'overall';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface ClubAchievements {
  league?: number;
  cup?: number;
  regional?: number;
  african?: number;
}

export interface ClubSocialMedia {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Club {
  id: string;
  name: string;
  short: string;
  color: string;
  city: string;
  logoUrl?: string;
  /** Extended club-hub profile fields (optional — mirrors backend Club entity) */
  nickname?: string;
  region?: string;
  foundedYear?: number;
  websiteUrl?: string;
  bannerUrl?: string;
  videoUrl?: string;
  secondaryColor?: string;
  stadium?: string;
  stadiumCapacity?: number;
  stadiumPhotoUrl?: string;
  description?: string;
  history?: string;
  palmares?: string[];
  presidentName?: string;
  presidentPhotoUrl?: string;
  achievements?: ClubAchievements;
  socialMedia?: ClubSocialMedia;
}

// ─── Coaching Staff ───────────────────────────────────────────────────────────

export interface CoachStaff {
  id: string;
  firstName: string;
  lastName: string;
  nationality: string;
  photoUrl?: string;
  qualification?: string;
  specialization?: string;
  biography?: string;
  formerClubs?: string[];
  trophies?: string[];
  assistantCoachName?: string;
  fitnessCoachName?: string;
  goalkeeperCoachName?: string;
  analystName?: string;
  clubId: string;
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

// ─── Player Stats ─────────────────────────────────────────────────────────────

export interface PlayerStat {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  nationality?: string;
  photoUrl?: string;
  age?: number;
  clubId: string;
  clubName: string;
  clubShort?: string;
  clubLogoUrl?: string;
  /** Total metrics */
  appearances: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  keyPasses: number;
  shots: number;
  shotsOnTarget: number;
  xG?: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  passAccuracy?: number;
  /** Derived per-90 (computed client-side or returned by API) */
  goalsPer90?: number;
  assistsPer90?: number;
  shotsPer90?: number;
}

/** Lightweight shape used in top-list cards */
export interface TopPerformer {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  clubName: string;
  clubShort?: string;
  clubLogoUrl?: string;
  value: number;
  secondaryValue?: number;
  secondaryLabel?: string;
  category: StatCategory;
}

// ─── Club Stats ───────────────────────────────────────────────────────────────

export interface ClubStat {
  clubId: string;
  clubName: string;
  clubShort?: string;
  clubLogoUrl?: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  shots: number;
  shotsOnTarget: number;
  possession?: number;
  yellowCards: number;
  redCards: number;
  penaltiesFor: number;
  penaltiesAgainst: number;
  cleanSheets: number;
  points: number;
}

// ─── Club media (gallery / videos) ────────────────────────────────────────────

export interface ClubGalleryImage {
  id: string;
  url: string;
  caption: string;
}

export interface ClubVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  date: string;
  category: string;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

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
  liveMinute?: number;
  referee?: Referee;
  attendance?: number;
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

export interface PlayerStatsFilter {
  seasonId?: string;
  teamId?: string;
  position?: PlayerPosition;
  minMinutes?: number;
  nationality?: string;
  sort?: StatSortField;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  per90?: boolean;
}

export interface ClubStatsFilter {
  seasonId?: string;
  sort?: StatSortField;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TopPerformersQuery {
  seasonId: string;
  category: StatCategory;
  limit?: number;
}
// ─── Enums ────────────────────────────────────────────────────────────────────

export type AwardCategory =
  | 'PLAYER_OF_MATCH'
  | 'PLAYER_OF_WEEK'
  | 'PLAYER_OF_MONTH'
  | 'PLAYER_OF_SEASON'
  | 'BEST_YOUNG_PLAYER'
  | 'TOP_SCORER'
  | 'TOP_ASSIST'
  | 'BEST_GOALKEEPER'
  | 'BALLON_DOR'
  | 'TEAM_OF_WEEK'
  | 'TEAM_OF_MONTH'
  | 'TEAM_OF_SEASON'
  | 'GOAL_OF_WEEK'
  | 'GOAL_OF_MONTH'
  | 'GOAL_OF_SEASON'
  | 'COACH_OF_MONTH'
  | 'COACH_OF_SEASON';

// ─── Category grouping (drives sidebar / section navigation) ──────────────────

export type AwardGroup = 'BALLON_DOR' | 'PLAYER' | 'TEAM' | 'GOAL' | 'COACH';

export const AWARD_GROUPS: { id: AwardGroup; label: string; categories: AwardCategory[] }[] = [
  { id: 'BALLON_DOR', label: "Ballon d'Or",          categories: ['BALLON_DOR'] },
  { id: 'PLAYER',      label: 'Distinctions Joueur',  categories: ['PLAYER_OF_MATCH', 'PLAYER_OF_WEEK', 'PLAYER_OF_MONTH', 'PLAYER_OF_SEASON', 'BEST_YOUNG_PLAYER', 'TOP_SCORER', 'TOP_ASSIST', 'BEST_GOALKEEPER'] },
  { id: 'TEAM',        label: 'Équipe Type',          categories: ['TEAM_OF_WEEK', 'TEAM_OF_MONTH', 'TEAM_OF_SEASON'] },
  { id: 'GOAL',        label: 'Plus Beau But',        categories: ['GOAL_OF_WEEK', 'GOAL_OF_MONTH', 'GOAL_OF_SEASON'] },
  { id: 'COACH',       label: 'Distinctions Coach',   categories: ['COACH_OF_MONTH', 'COACH_OF_SEASON'] },
];

export type AwardType = 'PLAYER' | 'TEAM' | 'COACH';
export type VotingStatus = 'OPEN' | 'CLOSED' | 'ANNOUNCED' | 'UPCOMING';
export type NomineeType = 'PLAYER' | 'TEAM' | 'COACH';

// ─── Nominees ─────────────────────────────────────────────────────────────────

export interface PlayerNominee {
  id: string;
  type: 'PLAYER';
  name: string;
  photoUrl?: string;
  clubId: string;
  clubName: string;
  clubLogoUrl?: string;
  position: string;
  nationality: string;
  age?: number;
  stats: {
    goals?: number;
    assists?: number;
    minutesPlayed?: number;
    appearances?: number;
    cleanSheets?: number;
    rating?: number;
    keyPasses?: number;
    saves?: number;
  };
  highlightStat: { label: string; value: number | string };
  form?: string[]; // ['W','W','D','W','L']
  /** Present when this nominee appears in a "Goal of the Week/Month/Season" award */
  goalContext?: {
    opponent: string;
    minute: number;
    matchDate?: string;
    description: string;
    videoUrl?: string;
  };
}

export interface TeamNominee {
  id: string;
  type: 'TEAM';
  name: string;
  logoUrl?: string;
  city: string;
  coach: string;
  stats: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
  form?: string[];
  highlightStat: { label: string; value: number | string };
}

export interface CoachNominee {
  id: string;
  type: 'COACH';
  name: string;
  photoUrl?: string;
  clubId: string;
  clubName: string;
  clubLogoUrl?: string;
  nationality: string;
  stats: {
    wins: number;
    winRate: number;
    goalsScored: number;
  };
  highlightStat: { label: string; value: number | string };
}

export type Nominee = PlayerNominee | TeamNominee | CoachNominee;

// ─── Vote ─────────────────────────────────────────────────────────────────────

export interface VoteResult {
  nomineeId: string;
  votes: number;
  percentage: number;
  trending: 'UP' | 'DOWN' | 'STABLE';
  rank: number;
}

export interface VoteResults {
  awardId: string;
  totalVotes: number;
  results: VoteResult[];
  lastUpdated: string;
}

// ─── Award ────────────────────────────────────────────────────────────────────

export interface Award {
  id: string;
  category: AwardCategory;
  type: AwardType;
  title: string;
  subtitle: string;
  description: string;
  period: string;         // e.g. "Avril 2025" or "Saison 2025-26"
  season: string;
  votingStatus: VotingStatus;
  votingDeadline?: string; // ISO string
  nominees: Nominee[];
  winner?: Nominee;
  voteResults?: VoteResults;
  fanVotingEnabled: boolean;
  fanVoteWeight: number;  // percentage of total (e.g. 30 for 30%)
  juryVoteWeight: number;
  imageUrl?: string;
  trophyColor: 'GOLD' | 'SILVER' | 'BRONZE' | 'PLATINUM';
}

// ─── Ballon d'Or ─────────────────────────────────────────────────────────────

export interface BallonDorRanking {
  rank: number;
  nominee: PlayerNominee;
  juryPoints: number;
  fanPoints: number;
  totalPoints: number;
  previousRank?: number;
  rankChange: number; // positive = moved up
  countryVotes: { country: string; votes: number }[];
}

export interface BallonDorEdition {
  year: number;
  winner: PlayerNominee;
  ranking: BallonDorRanking[];
  ceremonyDate: string;
  votingOpen: boolean;
  votingDeadline?: string;
  totalVotes: number;
}

// ─── Team of the Week ─────────────────────────────────────────────────────────

export type FormationString =
  | '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2' | '4-1-4-1';

export interface FormationPlayer {
  id: string;
  nomineeId: string;
  name: string;
  photoUrl?: string;
  clubName: string;
  clubLogoUrl?: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  positionLabel: string; // "Gardien", "Défenseur central"
  x: number; // 0-100 percentage on pitch
  y: number; // 0-100 percentage on pitch
  rating: number;
  highlightStat: { label: string; value: number | string };
}

export interface TeamOfWeek {
  id: string;
  period: string;
  formation: FormationString;
  players: FormationPlayer[];
  bench: FormationPlayer[];
  coach?: CoachNominee;
  votingStatus: VotingStatus;
  totalVotes: number;
}

// ─── Historical ───────────────────────────────────────────────────────────────

export interface HistoricalWinner {
  year: number;
  period: string;
  season: string;
  category: AwardCategory;
  winner: Nominee;
  runnerUp?: Nominee;
  votes?: number;
}

// ─── Real-time ────────────────────────────────────────────────────────────────

export interface LiveVoteEvent {
  awardId: string;
  nomineeId: string;
  nomineeName: string;
  timestamp: string;
  country?: string;
}

export interface RealtimeLeaderboardEntry {
  nomineeId: string;
  nomineeName: string;
  photoUrl?: string;
  votes: number;
  percentage: number;
  delta: number; // votes gained in last 60s
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const AWARD_META: Record<AwardCategory, {
  label: string;
  shortLabel: string;
  icon: string;
  type: AwardType;
  color: string;
  bg: string;
}> = {
  PLAYER_OF_MATCH:  { label: 'Homme du Match',       shortLabel: 'Match',    icon: '⚡', type: 'PLAYER', color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/15 border-[#60A5FA]/30' },
  PLAYER_OF_WEEK:   { label: 'Joueur de la Semaine',  shortLabel: 'Semaine',  icon: '🏅', type: 'PLAYER', color: 'text-[#34D399]', bg: 'bg-[#34D399]/15 border-[#34D399]/30' },
  PLAYER_OF_MONTH:  { label: 'Joueur du Mois',        shortLabel: 'Mois',     icon: '🥇', type: 'PLAYER', color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  PLAYER_OF_SEASON: { label: 'Joueur de la Saison',   shortLabel: 'Saison',   icon: '👑', type: 'PLAYER', color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  BEST_YOUNG_PLAYER:{ label: 'Meilleur Jeune',        shortLabel: 'Jeune',    icon: '🌟', type: 'PLAYER', color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/15 border-[#A78BFA]/30' },
  TOP_SCORER:       { label: 'Meilleur Buteur',       shortLabel: 'Buteur',   icon: '⚽', type: 'PLAYER', color: 'text-[#F87171]', bg: 'bg-[#F87171]/15 border-[#F87171]/30' },
  TOP_ASSIST:       { label: 'Meilleur Passeur',      shortLabel: 'Passeur',  icon: '🎯', type: 'PLAYER', color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/15 border-[#FB923C]/30' },
  BEST_GOALKEEPER:  { label: 'Meilleur Gardien',      shortLabel: 'Gardien',  icon: '🧤', type: 'PLAYER', color: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/15 border-[#22D3EE]/30' },
  BALLON_DOR:       { label: 'Ballon d\'Or Cameroun', shortLabel: 'Ballon d\'Or', icon: '🏆', type: 'PLAYER', color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/20 border-[#FCD116]/40' },
  TEAM_OF_WEEK:     { label: 'Équipe de la Semaine',  shortLabel: 'Éq. Sem.', icon: '🛡️', type: 'TEAM',   color: 'text-[#34D399]', bg: 'bg-[#34D399]/15 border-[#34D399]/30' },
  TEAM_OF_MONTH:    { label: 'Équipe du Mois',        shortLabel: 'Éq. Mois', icon: '🏟️', type: 'TEAM',   color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  TEAM_OF_SEASON:   { label: 'Équipe de la Saison',   shortLabel: 'Éq. Sais.',icon: '🥇', type: 'TEAM',   color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  GOAL_OF_WEEK:     { label: 'But de la Semaine',     shortLabel: 'But Sem.', icon: '🚀', type: 'PLAYER', color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/15 border-[#38BDF8]/30' },
  GOAL_OF_MONTH:    { label: 'But du Mois',           shortLabel: 'But Mois', icon: '🔥', type: 'PLAYER', color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/15 border-[#FB923C]/30' },
  GOAL_OF_SEASON:   { label: 'But de la Saison',      shortLabel: 'But Sais.',icon: '💫', type: 'PLAYER', color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
  COACH_OF_MONTH:   { label: 'Coach du Mois',         shortLabel: 'Coach',    icon: '📋', type: 'COACH',  color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/15 border-[#A78BFA]/30' },
  COACH_OF_SEASON:  { label: 'Coach de la Saison',    shortLabel: 'Coach Sais.', icon: '🎖️', type: 'COACH', color: 'text-[#FCD116]', bg: 'bg-[#FCD116]/15 border-[#FCD116]/30' },
};
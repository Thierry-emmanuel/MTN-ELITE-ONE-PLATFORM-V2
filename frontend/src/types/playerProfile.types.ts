import type { Club, PlayerStat } from './football.types';
import type { TransferRecord, InjuryRecord } from './transfersInjuries.types';

// ─── Career timeline ──────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'academy' | 'debut' | 'transfer' | 'loan' | 'return' | 'honour' | 'milestone' | 'international';

export interface CareerTimelineEntry {
  id: string;
  date: string;              // ISO date
  season: string;            // "2023-24"
  type: TimelineEventType;
  club?: Club;
  title: string;
  description: string;
  statLabel?: string;
  statValue?: string;
}

export interface CareerSeasonRow {
  season: string;
  club: Club;
  competition: string;
  appearances: number;
  goals: number;
  assists: number;
  minutes: number;
  yellowCards: number;
  redCards: number;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export type AchievementLevel = 'club' | 'national' | 'continental' | 'international';

export interface AchievementEntry {
  id: string;
  title: string;
  competition: string;
  season: string;
  level: AchievementLevel;
  icon: 'trophy' | 'medal' | 'star' | 'award' | 'shield' | 'crown';
}

// ─── Market value & performance trend ────────────────────────────────────────

export interface MarketValuePoint {
  date: string;
  label: string;
  valueFcfa: number;
}

export interface PerformanceTrendPoint {
  matchLabel: string;
  opponent: string;
  date: string;
  rating: number;
  goals: number;
  assists: number;
  minutes: number;
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

// ─── Full profile ─────────────────────────────────────────────────────────────

export interface PlayerProfileExtra {
  nickname?: string;
  bio: string;
  birthDate?: string;
  birthPlace?: string;
  heightCm: number;
  weightKg: number;
  preferredFoot: 'Gauche' | 'Droit' | 'Ambidextre';
  jerseyNumber: number;
  contractExpiry: string;
  agentName?: string;
  formerClubs: string[];
  secondNationality?: string;
  marketValueFcfa: number;
  marketValueHistory: MarketValuePoint[];
  careerTimeline: CareerTimelineEntry[];
  careerSeasons: CareerSeasonRow[];
  achievements: AchievementEntry[];
  strengths: { label: string; value: number }[];
  strengthTags: string[];
  weaknessTags: string[];
  performanceTrend: PerformanceTrendPoint[];
  gallery: GalleryImage[];
  sinceClubDate: string;
  transferHistory: TransferRecord[];
  injuryHistory: InjuryRecord[];
}

export type PlayerProfile = PlayerStat & PlayerProfileExtra;

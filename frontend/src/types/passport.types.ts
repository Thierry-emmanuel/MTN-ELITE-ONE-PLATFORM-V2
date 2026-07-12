// ─── Football Passport — the signature career-journey feature ────────────────
import type { Club } from './football.types';

export type StampCategory =
  | 'formation' | 'debut' | 'club' | 'individual' | 'national' | 'continental' | 'record' | 'legacy';

export type StampTier = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface PassportStamp {
  id: string;
  title: string;
  category: StampCategory;
  tier: StampTier;
  date?: string;          // ISO date — undefined while locked
  club?: Club;
  competition?: string;
  story: string;
  unlocked: boolean;
}

export interface CareerChapter {
  id: string;
  numeral: 'I' | 'II' | 'III' | 'IV';
  title: string;
  theme: string;
  years: string;
  narrative: string;
  quote: string;
  quoteAuthor: string;
  image: string;
  stats: { label: string; value: string }[];
}

export type RoadToLionsEventType = 'callup' | 'debut' | 'goal' | 'tournament' | 'captain';

export interface RoadToLionsEvent {
  id: string;
  date: string;
  type: RoadToLionsEventType;
  title: string;
  opponent?: string;
  competition: string;
  description: string;
  caps?: number;
  goals?: number;
}

export interface MemoryObject {
  id: string;
  title: string;
  icon: 'shirt' | 'armband' | 'trophy' | 'boot' | 'medal' | 'ball';
  date: string;
  story: string;
}

export interface CareerDnaAttribute {
  label: string;
  value: number; // 0-100
}

export interface CareerDna {
  attributes: CareerDnaAttribute[];
  playingStyle: string;
  potential: 'En développement' | 'Confirmé' | 'Référence' | 'Icône';
  development: string;
}

export type MapStopKind = 'formation' | 'club' | 'national' | 'continental' | 'world';

export interface CareerMapStop {
  id: string;
  kind: MapStopKind;
  title: string;
  place: string;
  years: string;
  description: string;
  stats?: { label: string; value: string }[];
  club?: Club;
}

export interface LegacyTestimonial {
  id: string;
  quote: string;
  author: string;
  role: 'Coéquipier' | 'Entraîneur' | 'Supporter' | 'Journaliste';
}

export interface LegacyStat {
  label: string;
  value: string;
  detail: string;
}

export interface LegacyData {
  statement: string;
  stats: LegacyStat[];
  testimonials: LegacyTestimonial[];
  closingLine: string;
}

export interface PassportData {
  stamps: PassportStamp[];
  chapters: CareerChapter[];
  roadToLions: RoadToLionsEvent[];
  memoryBox: MemoryObject[];
  dna: CareerDna;
  careerMap: CareerMapStop[];
  legacy: LegacyData;
  passportNumber: string;
  issueDate: string;
  motto: string;
}

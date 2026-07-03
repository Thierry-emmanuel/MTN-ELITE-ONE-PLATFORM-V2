import type { Club } from './football.types';

// ─── Injuries ───────────────────────────────────────────────────────────────

export type InjurySeverity = 'MINOR' | 'MODERATE' | 'SEVERE';
export type InjuryStatus   = 'ACTIVE' | 'RECOVERING' | 'CLEARED';
export type InjuryBodyPart =
  | 'Cheville' | 'Genou' | 'Ischio-jambier' | 'Mollet' | 'Cuisse'
  | 'Épaule' | 'Dos' | 'Pied' | 'Commotion' | 'Autre';

export interface InjuryRecord {
  id: string;
  playerId: string;
  playerName: string;
  playerPhotoUrl?: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  club: Club;
  bodyPart: InjuryBodyPart;
  diagnosis: string;
  severity: InjurySeverity;
  status: InjuryStatus;
  injuredAt: string;        // ISO date
  expectedReturn?: string;  // ISO date
  gamesMissed: number;
  medicalNotes?: string;
  updatedAt: string;        // ISO date — "last update" for the medical report feed
}

export interface ClubMedicalReport {
  club: Club;
  activeCount: number;
  recoveringCount: number;
  totalDaysLost: number;
  injuries: InjuryRecord[];
}

// ─── Transfers ──────────────────────────────────────────────────────────────

export type TransferKind = 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';
export type TransferStage = 'CONFIRMED' | 'IN_TALKS' | 'RUMOR' | 'REJECTED';

/** Fabrizio-Romano-style confidence meter, 1 (whispers) → 5 (here we go). */
export type TransferConfidence = 1 | 2 | 3 | 4 | 5;

export interface TransferRecord {
  id: string;
  playerId: string;
  playerName: string;
  playerPhotoUrl?: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  age: number;
  fromClub: Club | null;   // null = free agent / academy
  toClub: Club;
  kind: TransferKind;
  stage: TransferStage;
  confidence: TransferConfidence;
  fee?: number;             // FCFA, undefined = undisclosed
  windowLabel: string;      // "Hiver 2025-26"
  transferDate: string;     // ISO date — effective / reported date
  announced: boolean;
  source?: string;          // "Officiel", "L'Équipe", "Journaliste X"
  quote?: string;           // short editorial blurb, NOT a real quotation
}

export interface ClubTransferActivity {
  club: Club;
  arrivals: number;
  departures: number;
  totalIn: number;   // FCFA spent
  totalOut: number;  // FCFA earned
  net: number;
}

# Skill: Football Data Schemas & TypeScript Types

## 1. Objectif
Garantir un contrat d'interface mathématique et logique inviolable entre les payloads JSON retournés par le backend NestJS (PostgreSQL/MongoDB) et l'état applicatif frontend géré par React Query et Zustand[cite: 1].

## 2. Modèles de Données Typés Strictement

Lors de la manipulation des données de match, applique ou valide l'implémentation de ces structures exactes :

```typescript
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED' | 'POSTPONED';
export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY_GOAL' | 'OWN_GOAL';

export interface Club {
  id: string;
  name: string;
  shortName?: string;
  city: string;
  stadium: string;
  logoUrl: string;
  foundedYear: number;[cite: 1]
}

export interface MatchEvent {
  id: string;
  matchId: string;
  clubId: string;
  playerId: string;
  playerName: string;
  type: EventType;
  minute: number;[cite: 1]
}

export interface MatchStats {
  possession: number; // Pourcentage ex: 54
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  passesCompleted: number;[cite: 1]
}

export interface Match {
  id: string;
  round: number; // Journée J1 à J34
  scheduledAt: string; // ISO Date String
  status: MatchStatus;
  homeClub: Club;
  awayClub: Club;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  stats?: {
    home: MatchStats;
    away: MatchStats;
  };[cite: 1]
}
// src/players/player.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';
import { MatchEvent } from '../matches/match-event.entity';
import { PlayerStats } from './player-stats.entity';

export enum PlayerPosition {
  GOALKEEPER = 'GK',
  DEFENDER   = 'DEF',
  MIDFIELDER = 'MID',
  FORWARD    = 'FWD',
}

export enum PreferredFoot {
  LEFT  = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH  = 'BOTH',
}

export enum PlayerStatus {
  ACTIVE    = 'ACTIVE',
  INJURED   = 'INJURED',
  SUSPENDED = 'SUSPENDED',
  LOANED    = 'LOANED',
  RETIRED   = 'RETIRED',
}

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Core Identity ──────────────────────────────────────────────
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  nickname: string;           // "Le Bison", "Magic"

  @Column({ type: 'enum', enum: PlayerPosition })
  position: PlayerPosition;

  @Column({ length: 100 })
  nationality: string;

  @Column({ length: 100, nullable: true })
  secondNationality: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'birth_place', length: 150, nullable: true })
  birthPlace: string;

  @Column({ name: 'jersey_number', type: 'int', nullable: true })
  jerseyNumber: number;

  // ── Physical ──────────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  height: number;             // cm

  @Column({ type: 'int', nullable: true })
  weight: number;             // kg

  @Column({
    name: 'preferred_foot',
    type: 'enum',
    enum: PreferredFoot,
    nullable: true,
  })
  preferredFoot: PreferredFoot;

  // ── Media ─────────────────────────────────────────────────────
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'secondary_photo_url', length: 500, nullable: true })
  secondaryPhotoUrl: string;  // Action shot

  @Column({ name: 'video_url', length: 500, nullable: true })
  videoUrl: string;           // Highlight video

  // ── Biography ────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ type: 'simple-array', name: 'former_clubs', nullable: true })
  formerClubs: string[];

  // ── Contract ─────────────────────────────────────────────────
  @Column({
    name: 'market_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  marketValue: number;

  @Column({ name: 'contract_expiry', type: 'date', nullable: true })
  contractExpiry: Date;

  @Column({ name: 'agent_name', length: 150, nullable: true })
  agentName: string;

  // ── Career Stats (cumulative) ─────────────────────────────────
  @Column({ name: 'career_appearances', type: 'int', default: 0 })
  appearances: number;

  @Column({ name: 'career_goals', type: 'int', default: 0 })
  goals: number;

  @Column({ name: 'career_assists', type: 'int', default: 0 })
  assists: number;

  @Column({ name: 'international_caps', type: 'int', default: 0 })
  internationalCaps: number;

  @Column({ name: 'international_goals', type: 'int', default: 0 })
  internationalGoals: number;

  // ── Status / Availability ─────────────────────────────────────
  @Column({
    type: 'enum',
    enum: PlayerStatus,
    default: PlayerStatus.ACTIVE,
  })
  status: PlayerStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ── Social Media ──────────────────────────────────────────────
  @Column({ name: 'social_media', type: 'jsonb', nullable: true })
  socialMedia: {
    twitter?:   string;
    instagram?: string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
  };

  // ── Club ──────────────────────────────────────────────────────
  @Column({ name: 'club_id', nullable: true })
  clubId: string;

  @ManyToOne(() => Club, (club) => club.players, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  // ── Relations ─────────────────────────────────────────────────
  @OneToMany(() => MatchEvent, (event) => event.player)
  matchEvents: MatchEvent[];

  @OneToMany(() => PlayerStats, (stats) => stats.player)
  stats: PlayerStats[];

  // ── Timestamps ────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
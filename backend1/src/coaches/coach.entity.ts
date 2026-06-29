// src/coaches/coach.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';

export enum CoachStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('coaches')
export class Coach {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Core Identity ──────────────────────────────────────────────
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 100 })
  nationality: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'birth_place', length: 150, nullable: true })
  birthPlace: string;

  // ── Visuals ────────────────────────────────────────────────────
  @Column({ name: 'photo_url',   length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'banner_url',  length: 500, nullable: true })
  bannerUrl: string;

  // ── Qualifications ────────────────────────────────────────────
  @Column({ length: 100, nullable: true })
  qualification: string;      // "UEFA Pro", "CAF A", "CAF B"

  @Column({ length: 100, nullable: true })
  specialization: string;     // "Offensive", "Defensive", "Goalkeeper"

  @Column({ name: 'contract_expiry', type: 'date', nullable: true })
  contractExpiry: Date;

  // ── Biography ────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ type: 'simple-array', name: 'former_clubs', nullable: true })
  formerClubs: string[];

  @Column({ type: 'simple-array', nullable: true })
  trophies: string[];         // ["MTN Elite One 2019", "Coupe du Cameroun 2021"]

  // ── Staff (sub-coaches) ───────────────────────────────────────
  @Column({ name: 'assistant_coach_name',    length: 150, nullable: true })
  assistantCoachName: string;

  @Column({ name: 'fitness_coach_name',      length: 150, nullable: true })
  fitnessCoachName: string;

  @Column({ name: 'goalkeeper_coach_name',   length: 150, nullable: true })
  goalkeeperCoachName: string;

  @Column({ name: 'analyst_name',            length: 150, nullable: true })
  analystName: string;

  // ── Social Media ──────────────────────────────────────────────
  @Column({ name: 'social_media', type: 'jsonb', nullable: true })
  socialMedia: {
    twitter?:   string;
    instagram?: string;
    linkedin?:  string;
  };

  // ── Club ──────────────────────────────────────────────────────
  @Column({ name: 'club_id', nullable: true })
  clubId: string;

  @ManyToOne(() => Club, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @Column({ type: 'enum', enum: CoachStatus, default: CoachStatus.ACTIVE })
  status: CoachStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // ── Timestamps ────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

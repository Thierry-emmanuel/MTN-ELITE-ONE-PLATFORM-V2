// src/staff/staff.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';

export enum StaffRole {
  HEAD_COACH         = 'HEAD_COACH',
  ASSISTANT_COACH    = 'ASSISTANT_COACH',
  GOALKEEPER_COACH   = 'GOALKEEPER_COACH',
  FITNESS_COACH      = 'FITNESS_COACH',
  PHYSIO             = 'PHYSIO',
  DOCTOR             = 'DOCTOR',
  ANALYST            = 'ANALYST',
  SCOUT              = 'SCOUT',
  KIT_MAN            = 'KIT_MAN',
  MEDIA_OFFICER      = 'MEDIA_OFFICER',
  SECRETARY          = 'SECRETARY',
  TEAM_MANAGER       = 'TEAM_MANAGER',
}

export enum StaffStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Identity ────────────────────────────────────────────────────
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  // ── Role & Club ─────────────────────────────────────────────────
  @Column({ type: 'enum', enum: StaffRole, default: StaffRole.ASSISTANT_COACH })
  role: StaffRole;

  @Column({ name: 'club_id', nullable: true })
  clubId: number | null;

  @ManyToOne(() => Club, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  // ── Contract ────────────────────────────────────────────────────
  @Column({ name: 'contract_start', type: 'date', nullable: true })
  contractStart: Date;

  @Column({ name: 'contract_end', type: 'date', nullable: true })
  contractEnd: Date;

  // ── Media ───────────────────────────────────────────────────────
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  // ── Status ──────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

  // ── Bio ─────────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  bio: string;

  // ── Timestamps ──────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// src/referees/referee.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum RefereeLevel {
  NATIONAL  = 'NATIONAL',
  CAF       = 'CAF',
  FIFA      = 'FIFA',
}

export enum RefereeStatus {
  ACTIVE    = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  RETIRED   = 'RETIRED',
}

@Entity('referees')
export class Referee {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Identity ────────────────────────────────────────────────────
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

  // ── License ─────────────────────────────────────────────────────
  @Column({
    name: 'license_level',
    type: 'enum',
    enum: RefereeLevel,
    default: RefereeLevel.NATIONAL,
  })
  licenseLevel: RefereeLevel;

  @Column({ name: 'license_number', length: 50, nullable: true })
  licenseNumber: string;

  @Column({ name: 'years_active', type: 'int', nullable: true })
  yearsActive: number;

  // ── Contact ─────────────────────────────────────────────────────
  @Column({ name: 'phone_number', length: 30, nullable: true })
  phoneNumber: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 150, nullable: true })
  city: string;

  // ── Media ───────────────────────────────────────────────────────
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  // ── Status ──────────────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: RefereeStatus,
    default: RefereeStatus.ACTIVE,
  })
  status: RefereeStatus;

  // ── Notes ───────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  notes: string;

  // ── Timestamps ──────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

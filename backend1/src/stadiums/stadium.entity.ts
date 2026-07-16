// src/stadiums/stadium.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Match } from '../matches/match.entity';

export enum StadiumSurface {
  GRASS      = 'GRASS',
  ARTIFICIAL = 'ARTIFICIAL',
  HYBRID     = 'HYBRID',
}

export enum StadiumStatus {
  ACTIVE      = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED      = 'CLOSED',
}

@Entity('stadiums')
export class Stadium {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Identity ────────────────────────────────────────────────────
  @Column({ length: 150, unique: true })
  name: string;                         // "Stade Ahmadou Ahidjo"

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100, default: 'Cameroun' })
  country: string;

  @Column({ length: 200, nullable: true })
  address: string;

  // ── Specs ───────────────────────────────────────────────────────
  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({
    type: 'enum',
    enum: StadiumSurface,
    default: StadiumSurface.GRASS,
  })
  surface: StadiumSurface;

  @Column({ name: 'opened_year', type: 'int', nullable: true })
  openedYear: number;

  // ── Geo ─────────────────────────────────────────────────────────
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  // ── Media ───────────────────────────────────────────────────────
  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl: string;

  // ── Narrative ───────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  description: string;

  // ── Status ──────────────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: StadiumStatus,
    default: StadiumStatus.ACTIVE,
  })
  status: StadiumStatus;

  // ── Timestamps ──────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

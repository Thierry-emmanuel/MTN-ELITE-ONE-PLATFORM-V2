// src/clubs/club.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from '../players/player.entity';
import { Match } from '../matches/match.entity';
import { MatchStats } from '../matches/match-stats.entity';
import { Standing } from '../standings/standing.entity';

export enum ClubStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Core Identity ──────────────────────────────────────────────
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, nullable: true })
  nickname: string;           // "Les Diables Noirs"

  @Column({ length: 100 })
  city: string;

  @Column({ length: 50, nullable: true })
  region: string;             // "Centre", "Littoral", "Ouest"…

  @Column({ name: 'founded_year', type: 'int' })
  foundedYear: number;

  @Column({ name: 'website_url', length: 500, nullable: true })
  websiteUrl: string;

  // ── Visuals ────────────────────────────────────────────────────
  @Column({ name: 'logo_url',   length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'banner_url', length: 500, nullable: true })
  bannerUrl: string;          // Hero image for club page

  @Column({ name: 'video_url',  length: 500, nullable: true })
  videoUrl: string;           // Promo/intro video

  @Column({ name: 'primary_color',   length: 7, nullable: true })
  primaryColor: string;

  @Column({ name: 'secondary_color', length: 7, nullable: true })
  secondaryColor: string;

  // ── Stadium ────────────────────────────────────────────────────
  @Column({ length: 150 })
  stadium: string;

  @Column({ name: 'stadium_capacity', type: 'int', nullable: true })
  stadiumCapacity: number;

  @Column({ name: 'stadium_photo_url', length: 500, nullable: true })
  stadiumPhotoUrl: string;

  // ── Club Narrative ────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  history: string;            // Full club history / rich text

  @Column({ type: 'simple-array', nullable: true })
  palmares: string[];         // ["MTN Elite One 2010", "Coupe du Cameroun 2015"]

  // ── Leadership ────────────────────────────────────────────────
  @Column({ name: 'president_name',      length: 150, nullable: true })
  presidentName: string;

  @Column({ name: 'president_photo_url', length: 500, nullable: true })
  presidentPhotoUrl: string;

  @Column({
    name: 'budget',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  budget: number;             // Annual budget in FCFA

  // ── Achievements counters (JSON) ──────────────────────────────
  @Column({ type: 'jsonb', nullable: true })
  achievements: {
    league?:   number;   // League titles
    cup?:      number;   // Cup titles
    regional?: number;   // Regional trophies
    african?:  number;   // CAF / continental
  };

  // ── Social Media (JSON) ────────────────────────────────────────
  @Column({ name: 'social_media', type: 'jsonb', nullable: true })
  socialMedia: {
    twitter?:   string;
    instagram?: string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
  };

  // ── Status ────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: ClubStatus, default: ClubStatus.ACTIVE })
  status: ClubStatus;

  // ── Relations ─────────────────────────────────────────────────
  @OneToMany(() => Player, (player) => player.club)
  players: Player[];

  @OneToMany(() => Match, (match) => match.homeClub)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.awayClub)
  awayMatches: Match[];

  @OneToMany(() => MatchStats, (stats) => stats.club)
  matchStats: MatchStats[];

  @OneToMany(() => Standing, (standing) => standing.club)
  standings: Standing[];

  // ── Timestamps ────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

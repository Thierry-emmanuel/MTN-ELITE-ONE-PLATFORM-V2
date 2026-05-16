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
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 150 })
  stadium: string;

  @Column({ name: 'founded_year', type: 'int' })
  foundedYear: number;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'primary_color', length: 7, nullable: true })
  primaryColor: string;

  @Column({ name: 'secondary_color', length: 7, nullable: true })
  secondaryColor: string;

  @Column({ type: 'enum', enum: ClubStatus, default: ClubStatus.ACTIVE })
  status: ClubStatus;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';
import { MatchEvent } from './match-event.entity';
import { MatchStats } from './match-stats.entity';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  CANCELLED = 'CANCELLED',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  round: number;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Column({ name: 'home_score', type: 'int', nullable: true })
  homeScore: number;

  @Column({ name: 'away_score', type: 'int', nullable: true })
  awayScore: number;

  @Column({ length: 150, nullable: true })
  venue: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ name: 'home_club_id' })
  homeClubId: string;

  @Column({ name: 'away_club_id' })
  awayClubId: string;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => Club, (club) => club.homeMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'home_club_id' })
  homeClub: Club;

  @ManyToOne(() => Club, (club) => club.awayMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'away_club_id' })
  awayClub: Club;

  @ManyToOne(() => Season, (season) => season.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @OneToMany(() => MatchEvent, (event) => event.match, { cascade: true })
  events: MatchEvent[];

  @OneToMany(() => MatchStats, (stats) => stats.match, { cascade: true })
  stats: MatchStats[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
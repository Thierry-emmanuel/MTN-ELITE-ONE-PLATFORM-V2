import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { Club } from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';
import { MatchEvent } from './match-event.entity';
import { MatchStats } from './match-stats.entity';
import { MatchLineup } from './match-lineup.entity';

export enum MatchStatus {
  SCHEDULED  = 'SCHEDULED',
  LIVE       = 'LIVE',
  FINISHED   = 'FINISHED',
  POSTPONED  = 'POSTPONED',
  CANCELLED  = 'CANCELLED',
}

// ─── Composite indexes ────────────────────────────────────────────────────────
// WHY: findAll() filters heavily by season + status + round.
// Without these, every filter does a full table scan.
@Index('idx_match_season_status', ['seasonId', 'status'])
@Index('idx_match_season_round',  ['seasonId', 'round'])
@Index('idx_match_scheduled_at',  ['scheduledAt'])
@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  round: number;

  @Index() // filtered often in isolation
  @Column({ name: 'scheduled_at', type: 'timestamp with time zone' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status: MatchStatus;

  @Column({ name: 'home_score', type: 'int', nullable: true })
  homeScore: number | null;

  @Column({ name: 'away_score', type: 'int', nullable: true })
  awayScore: number | null;

  @Column({ length: 150, nullable: true })
  venue: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ name: 'home_formation', type: 'varchar', length: 12, nullable: true })
  homeFormation: string | null;

  @Column({ name: 'away_formation', type: 'varchar', length: 12, nullable: true })
  awayFormation: string | null;

  // ── FK columns ──────────────────────────────────────────────────────────────
  @Column({ name: 'home_club_id' })
  homeClubId: number;

  @Column({ name: 'away_club_id' })
  awayClubId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  // ── Relations ────────────────────────────────────────────────────────────────
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

  @OneToMany(() => MatchLineup, (lineup) => lineup.match, { cascade: true })
  lineups: MatchLineup[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ── Virtual helpers (not persisted) ─────────────────────────────────────────
  /** Returns 'home' | 'away' | 'draw' | null for a finished match */
  get winner(): 'home' | 'away' | 'draw' | null {
    if (this.status !== MatchStatus.FINISHED) return null;
    if (this.homeScore === null || this.awayScore === null) return null;
    if (this.homeScore > this.awayScore) return 'home';
    if (this.awayScore > this.homeScore) return 'away';
    return 'draw';
  }
}
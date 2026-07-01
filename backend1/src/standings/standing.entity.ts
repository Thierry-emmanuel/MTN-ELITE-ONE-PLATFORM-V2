import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Index,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club }   from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';

// WHY: Every standings query filters by season and orders by points + goal_difference.
// Composite index makes that O(log n) instead of full scan.
@Index('idx_standing_season_points', ['seasonId', 'points', 'goalDifference'])
@Index('idx_standing_season_club',   ['seasonId', 'clubId'], { unique: true })
@Entity('standings')
export class Standing {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Position (persisted + recalculated on every standings update) ─────────
  // WHY: Storing position avoids re-sorting on every read.
  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'int', default: 0 })
  played: number;

  @Column({ type: 'int', default: 0 })
  won: number;

  @Column({ type: 'int', default: 0 })
  drawn: number;

  @Column({ type: 'int', default: 0 })
  lost: number;

  @Column({ name: 'goals_for', type: 'int', default: 0 })
  goalsFor: number;

  @Column({ name: 'goals_against', type: 'int', default: 0 })
  goalsAgainst: number;

  @Column({ name: 'goal_difference', type: 'int', default: 0 })
  goalDifference: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  // ── Form guide: last 5 results stored as char array ───────────────────────
  // WHY: simple[]  is cleaner than a raw "WWDLW" string — no manual slicing.
  // 'W' | 'D' | 'L'
  @Column({ name: 'form_guide', type: 'simple-array', nullable: true })
  formGuide: string[];

  // ── Home / Away split ─────────────────────────────────────────────────────
  @Column({ name: 'home_played',  type: 'int', default: 0 }) homePlayed:  number;
  @Column({ name: 'home_won',     type: 'int', default: 0 }) homeWon:     number;
  @Column({ name: 'home_drawn',   type: 'int', default: 0 }) homeDrawn:   number;
  @Column({ name: 'home_lost',    type: 'int', default: 0 }) homeLost:    number;

  @Column({ name: 'away_played',  type: 'int', default: 0 }) awayPlayed:  number;
  @Column({ name: 'away_won',     type: 'int', default: 0 }) awayWon:     number;
  @Column({ name: 'away_drawn',   type: 'int', default: 0 }) awayDrawn:   number;
  @Column({ name: 'away_lost',    type: 'int', default: 0 }) awayLost:    number;

  // ── FKs ──────────────────────────────────────────────────────────────────
  @Column({ name: 'club_id' })
  clubId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Club, (club) => club.standings, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Season, (season) => season.standings, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Match } from '../matches/match.entity';
import { Standing } from '../standings/standing.entity';
import { PlayerStats } from '../players/player-stats.entity';

export enum SeasonStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: SeasonStatus, default: SeasonStatus.UPCOMING })
  status: SeasonStatus;

  @OneToMany(() => Match, (match) => match.season)
  matches: Match[];

  /** Phase 5 — operational configuration of the season (calendar, match
   *  rules, registration, budgets, awards, public experience). */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  config: Record<string, any>;

  @Column({ name: 'competition_id', type: 'int', nullable: true })
  competitionId: number | null;

  @ManyToOne('Competition', 'seasons', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'competition_id' })
  competition: any;

  @OneToMany(() => Standing, (standing) => standing.season)
  standings: Standing[];

  @OneToMany(() => PlayerStats, (stats) => stats.season)
  playerStats: PlayerStats[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
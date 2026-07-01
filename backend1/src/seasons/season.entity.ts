import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn,
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

  @OneToMany(() => Standing, (standing) => standing.season)
  standings: Standing[];

  @OneToMany(() => PlayerStats, (stats) => stats.season)
  playerStats: PlayerStats[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
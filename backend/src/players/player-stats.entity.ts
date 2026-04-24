import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Season } from '../seasons/season.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  goals: number;

  @Column({ type: 'int', default: 0 })
  assists: number;

  @Column({ name: 'penalty_goals', type: 'int', default: 0 })
  penaltyGoals: number;

  @Column({ name: 'yellow_cards', type: 'int', default: 0 })
  yellowCards: number;

  @Column({ name: 'red_cards', type: 'int', default: 0 })
  redCards: number;

  @Column({ name: 'minutes_played', type: 'int', default: 0 })
  minutesPlayed: number;

  @Column({ type: 'int', default: 0 })
  appearances: number;

  @Column({ name: 'clean_sheets', type: 'int', default: 0 })
  cleanSheets: number;

  @Column({
    name: 'avg_rating',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  avgRating: number;

  @Column({ name: 'player_id' })
  playerId: string;

  @Column({ name: 'season_id' })
  seasonId: string;

  @ManyToOne(() => Player, (player) => player.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;
}
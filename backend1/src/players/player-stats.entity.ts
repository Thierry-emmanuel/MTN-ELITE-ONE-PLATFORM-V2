import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Player } from './player.entity';
import { Season } from '../seasons/season.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Core stats (existing) ──────────────────────────────────────────────────

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

  // ── Extended stats (new columns — requires migration) ─────────────────────

  @Column({ name: 'key_passes', type: 'int', default: 0 })
  keyPasses: number;

  @Column({ type: 'int', default: 0 })
  shots: number;

  @Column({ name: 'shots_on_target', type: 'int', default: 0 })
  shotsOnTarget: number;

  @Column({
    name: 'xg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  xG: number | null;

  @Column({
    name: 'pass_accuracy',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  passAccuracy: number | null;

  @Column({ name: 'penalties_missed', type: 'int', default: 0 })
  penaltiesMissed: number;

  // ── Relations ──────────────────────────────────────────────────────────────

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @ManyToOne(() => Player, (player) => player.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;
}
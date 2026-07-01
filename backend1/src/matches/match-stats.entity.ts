import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Match }  from './match.entity';
import { Player } from '../players/player.entity';
import { Club }   from '../clubs/club.entity';
import { Season } from '../seasons/season.entity';

@Entity('match_stats')
export class MatchStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  goals: number;

  @Column({ type: 'int', default: 0 })
  assists: number;

  @Column({ name: 'yellow_cards', type: 'int', default: 0 })
  yellowCards: number;

  @Column({ name: 'red_cards', type: 'int', default: 0 })
  redCards: number;

  @Column({ name: 'minutes_played', type: 'int', default: 0 })
  minutesPlayed: number;

  @Column({ name: 'was_substitute', default: false })
  wasSubstitute: boolean;

  @Column({ name: 'shots_on_target', type: 'int', default: 0 })
  shotsOnTarget: number;

  @Column({ name: 'passes_completed', type: 'int', default: 0 })
  passesCompleted: number;

  // ── FK columns ──────────────────────────────────────────────────────────
  @Column({ name: 'match_id' })
  matchId: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'club_id' })
  clubId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Match, (match) => match.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Player, (player) => player.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Club, (club) => club.matchStats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
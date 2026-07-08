import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Index,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Match }  from './match.entity';
import { Player } from '../players/player.entity';
import { Club }   from '../clubs/club.entity';

export enum LineupPosition {
  GK = 'GK',
  DF = 'DF',
  MF = 'MF',
  FW = 'FW',
}

// WHY: one row per player per match — mirrors match_stats/match_events shape
// so the same admin tooling patterns apply (bulk insert on lineup confirmation).
@Index('idx_lineup_match_club', ['matchId', 'clubId'])
@Entity('match_lineups')
export class MatchLineup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LineupPosition, nullable: true })
  position: LineupPosition | null;

  @Column({ name: 'shirt_number', type: 'int', nullable: true })
  shirtNumber: number | null;

  @Column({ name: 'is_starting', default: true })
  isStarting: boolean;

  @Column({ name: 'is_captain', default: false })
  isCaptain: boolean;

  @Column({ name: 'minutes_played', type: 'int', nullable: true })
  minutesPlayed: number | null;

  // Pitch placement for the formation view (0-100 percentages)
  @Column({ name: 'pos_x', type: 'float', nullable: true })
  posX: number | null;

  @Column({ name: 'pos_y', type: 'float', nullable: true })
  posY: number | null;

  // ── FK columns ──────────────────────────────────────────────────────────
  @Column({ name: 'match_id' })
  matchId: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'club_id' })
  clubId: number;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Match, (match) => match.lineups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

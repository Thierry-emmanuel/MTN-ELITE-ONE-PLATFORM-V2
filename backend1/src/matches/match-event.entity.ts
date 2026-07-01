import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Match }  from './match.entity';
import { Player } from '../players/player.entity';
import { Club }   from '../clubs/club.entity';

export enum MatchEventType {
  GOAL            = 'GOAL',
  OWN_GOAL        = 'OWN_GOAL',
  PENALTY_GOAL    = 'PENALTY_GOAL',
  YELLOW_CARD     = 'YELLOW_CARD',
  RED_CARD        = 'RED_CARD',
  SECOND_YELLOW   = 'SECOND_YELLOW',
  SUBSTITUTION_IN  = 'SUBSTITUTION_IN',
  SUBSTITUTION_OUT = 'SUBSTITUTION_OUT',
}

@Entity('match_events')
export class MatchEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MatchEventType })
  type: MatchEventType;

  @Column({ type: 'int' })
  minute: number;

  @Column({ name: 'extra_time', type: 'int', default: 0 })
  extraTime: number;

  // ── FK columns ──────────────────────────────────────────────────────────
  @Column({ name: 'match_id' })
  matchId: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'club_id' })
  clubId: number;

  // ── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Match, (match) => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Player, (player) => player.matchEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Award } from './award.entity';
import { Player } from '../../players/player.entity';

@Entity('award_nominations')
export class AwardNomination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vote_count', type: 'int', default: 0 })
  voteCount: number;

  // ── FK columns ──
  @Column({ name: 'award_id' })
  awardId: string;

  @Column({ name: 'player_id' })
  playerId: string;

  // ── Relations ──
  @ManyToOne(() => Award, (award) => award.nominations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'award_id' })
  award: Award;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player;
}

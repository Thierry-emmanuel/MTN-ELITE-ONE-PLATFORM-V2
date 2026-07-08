import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Award } from './award.entity';
import { Player } from '../../players/player.entity';
import { Club } from '../../clubs/club.entity';
import { Coach } from '../../coaches/coach.entity';

export enum NomineeType {
  PLAYER = 'PLAYER',
  TEAM = 'TEAM',
  COACH = 'COACH',
}

/**
 * A nomination is polymorphic: exactly one of player/team/coach is set,
 * matching `nomineeType`. This lets a single award pipeline (open/close/
 * vote/tally) serve Player, Team (Team of the Week/Month/Season -> a Club)
 * and Coach categories without three parallel tables.
 */
@Entity('award_nominations')
export class AwardNomination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vote_count', type: 'int', default: 0 })
  voteCount: number;

  @Column({ name: 'nominee_type', type: 'enum', enum: NomineeType, default: NomineeType.PLAYER })
  nomineeType: NomineeType;

  // -- FK columns --
  @Column({ name: 'award_id' })
  awardId: number;

  @Column({ name: 'player_id', nullable: true })
  playerId: number | null;

  @Column({ name: 'team_id', nullable: true })
  teamId: number | null;

  @Column({ name: 'coach_id', nullable: true })
  coachId: number | null;

  // -- Relations --
  @ManyToOne(() => Award, (award) => award.nominations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'award_id' })
  award: Award;

  @ManyToOne(() => Player, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'player_id' })
  player: Player | null;

  @ManyToOne(() => Club, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Club | null;

  @ManyToOne(() => Coach, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach | null;
}

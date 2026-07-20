import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Player } from '../players/player.entity';
import { Club } from '../clubs/club.entity';

export type TransferType = 'PERMANENT' | 'LOAN' | 'FREE' | 'RETURN_FROM_LOAN';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, { eager: true })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  playerId: number;

  @ManyToOne(() => Club, { eager: true, nullable: true })
  @JoinColumn({ name: 'fromClubId' })
  fromClub: Club | null;

  @Column({ type: 'int', nullable: true })
  fromClubId: number | null;

  @ManyToOne(() => Club, { eager: true })
  @JoinColumn({ name: 'toClubId' })
  toClub: Club;

  @Column()
  toClubId: number;

  @Column({ type: 'enum', enum: ['PERMANENT', 'LOAN', 'FREE', 'RETURN_FROM_LOAN'], default: 'PERMANENT' })
  type: TransferType;

  @Column({ type: 'numeric', nullable: true })
  fee: number | null;

  @Column()
  windowLabel: string;

  @Column({ type: 'date' })
  transferDate: string;

  @Column({ default: false })
  announced: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
// ── entity ──────────────────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Player } from '../players/player.entity';

export type InjurySeverity = 'MINOR' | 'MODERATE' | 'SEVERE';
export type InjuryStatus = 'ACTIVE' | 'RECOVERING' | 'CLEARED';

@Entity('injuries')
export class Injury {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, { eager: true })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  playerId: number;

  @Column()
  type: string;

  @Column({ type: 'enum', enum: ['MINOR', 'MODERATE', 'SEVERE'], default: 'MINOR' })
  severity: InjurySeverity;

  @Column({ type: 'enum', enum: ['ACTIVE', 'RECOVERING', 'CLEARED'], default: 'ACTIVE' })
  status: InjuryStatus;

  @Column({ type: 'date' })
  injuredAt: string;

  @Column({ type: 'date', nullable: true })
  expectedReturn: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
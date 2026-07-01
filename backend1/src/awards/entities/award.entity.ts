import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Season } from '../../seasons/season.entity';
import { AwardNomination } from './award-nomination.entity';

export enum AwardStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ANNOUNCED = 'ANNOUNCED',
}

@Entity('awards')
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  category: string; // e.g., 'Player of the Month', 'Young Player of the Year'

  @Column({ name: 'period_start', type: 'timestamp with time zone' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp with time zone' })
  periodEnd: Date;

  @Column({ type: 'enum', enum: AwardStatus, default: AwardStatus.CLOSED })
  status: AwardStatus;

  // ── FK columns ──
  @Column({ name: 'season_id' })
  seasonId: number;

  @Column({ name: 'winner_id', type: 'int', nullable: true })
  winnerId: number | null;

  // ── Relations ──
  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @OneToMany(() => AwardNomination, (nomination) => nomination.award, { cascade: true })
  nominations: AwardNomination[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

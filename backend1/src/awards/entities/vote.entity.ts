import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Award } from './award.entity';
import { AwardNomination } from './award-nomination.entity';
import { User } from '../../users/user.entity';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ip_hash', length: 64 })
  ipHash: string; // for anti-fraud

  // ── FK columns ──
  @Column({ name: 'award_id' })
  awardId: string;

  @Column({ name: 'nomination_id' })
  nominationId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  // ── Relations ──
  @ManyToOne(() => Award, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'award_id' })
  award: Award;

  @ManyToOne(() => AwardNomination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nomination_id' })
  nomination: AwardNomination;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

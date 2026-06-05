import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Club } from '../clubs/club.entity';
import { MatchEvent } from '../matches/match-event.entity';
import { PlayerStats } from './player-stats.entity';

export enum PlayerPosition {
  GOALKEEPER  = 'GK',
  DEFENDER    = 'DEF',
  MIDFIELDER  = 'MID',
  FORWARD     = 'FWD',
}

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ type: 'enum', enum: PlayerPosition })
  position: PlayerPosition;

  @Column({ length: 100 })
  nationality: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  @Column({ name: 'photo_url', length: 500, nullable: true })
  photoUrl: string;

  @Column({ name: 'jersey_number', type: 'int', nullable: true })
  jerseyNumber: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'market_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  marketValue: number;

  @Column({ name: 'club_id', nullable: true })
  clubId: string;

  @ManyToOne(() => Club, (club) => club.players, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @OneToMany(() => MatchEvent, (event) => event.player)
  matchEvents: MatchEvent[];

  @OneToMany(() => PlayerStats, (stats) => stats.player)
  stats: PlayerStats[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
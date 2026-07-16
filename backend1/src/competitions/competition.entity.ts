import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Season } from '../seasons/season.entity';

export enum CompetitionType {
  LEAGUE    = 'LEAGUE',
  CUP       = 'CUP',
  QUALIFIER = 'QUALIFIER',
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: CompetitionType, default: CompetitionType.LEAGUE })
  type: CompetitionType;

  /** ISO 3166-1 alpha-2, e.g. 'CM' */
  @Column({ length: 5, default: 'CM' })
  country: string;

  /** 1 = top flight, 2 = second division … */
  @Column({ type: 'int', default: 1 })
  tier: number;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @OneToMany(() => Season, (season) => season.competition)
  seasons: Season[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

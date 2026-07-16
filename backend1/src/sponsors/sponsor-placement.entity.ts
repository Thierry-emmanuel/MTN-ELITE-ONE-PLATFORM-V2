import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Sponsor } from './sponsor.entity';

export enum SponsorPlacementType {
  HERO_BANNER    = 'HERO_BANNER',
  AWARD_CATEGORY = 'AWARD_CATEGORY',
  MATCH_CENTER   = 'MATCH_CENTER',
  CLUB_PAGE      = 'CLUB_PAGE'
}

@Entity('sponsor_placements')
export class SponsorPlacement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sponsor_id' })
  sponsorId: number;

  @ManyToOne(() => Sponsor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: Sponsor;

  @Column({ type: 'enum', enum: SponsorPlacementType, default: SponsorPlacementType.HERO_BANNER })
  placementType: SponsorPlacementType;

  /** References target award ID, club ID, etc. depending on placementType */
  @Column({ name: 'target_id', type: 'int', nullable: true })
  targetId: number | null;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'starts_at', type: 'timestamp with time zone', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamp with time zone', nullable: true })
  endsAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

export enum SponsorTier {
  TITLE    = 'TITLE',
  GOLD     = 'GOLD',
  SILVER   = 'SILVER',
  PARTNER  = 'PARTNER'
}

@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'enum', enum: SponsorTier, default: SponsorTier.PARTNER })
  tier: SponsorTier;

  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  websiteUrl: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 150, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contract_start', type: 'date', nullable: true })
  contractStart: string | null;

  @Column({ name: 'contract_end', type: 'date', nullable: true })
  contractEnd: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

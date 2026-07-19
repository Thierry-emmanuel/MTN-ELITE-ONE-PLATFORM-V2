import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export type OrganizationType =
  | 'FEDERATION' | 'DEPARTMENT' | 'COMMITTEE' | 'REGIONAL_LEAGUE' | 'TEAM';

/**
 * IAM Organization — the federation's structure as a tree.
 * FECAFOOT (FEDERATION) → Departments / Committees / Regional Leagues → Teams.
 * Users carry organization_id; ownership and scoping rules build on it.
 */
@Entity('iam_organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 24 })
  type: OrganizationType;

  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  /** optional link to a football club record (for TEAM orgs) */
  @Column({ name: 'club_id', type: 'varchar', length: 64, nullable: true })
  clubId: string | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active' | 'archived';

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

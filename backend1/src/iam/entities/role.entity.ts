import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export type RoleStatus = 'active' | 'archived';

/**
 * IAM Role — a named permission bundle administrators create at runtime.
 * The three system roles (admin / editor / user) are seeded by the
 * IamFoundation migration and mirror the legacy users.role enum so
 * existing accounts keep their access.
 *
 * fieldPolicies example:
 *   { "articles": { "deny": ["slug", "seoTitle", "officialDate"] } }
 * → holders of this role cannot write those fields on that entity.
 */
@Entity('iam_roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** stable machine key, e.g. "journalist" — used in users.role_keys */
  @Index({ unique: true })
  @Column({ length: 64 })
  key: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** permission strings — see permission.catalog.ts */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions: string[];

  /** per-entity denied fields */
  @Column({ name: 'field_policies', type: 'jsonb', default: () => "'{}'" })
  fieldPolicies: Record<string, { deny: string[] }>;

  /** seeded roles cannot be deleted, only edited */
  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  /** assigned automatically to newly created users */
  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: RoleStatus;

  /** bumped on every permission/fieldPolicy change */
  @Column({ default: 1 })
  version: number;

  @Column({ name: 'cloned_from_key', type: 'varchar', length: 64, nullable: true })
  clonedFromKey: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

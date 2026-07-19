import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * IAM Config — generic namespaced JSON configuration store.
 * Powers the Menu Builder ("os.menu"), the Workspace Builder
 * ("os.workspace.<roleKey>") and future feature flags ("flags.*")
 * without a new table per concern.
 */
@Entity('iam_config')
export class IamConfig {
  @PrimaryColumn({ length: 120 })
  key: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  value: Record<string, unknown>;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

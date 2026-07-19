import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * IAM AuditLog — append-only trail of every important action.
 * Written by AuditService.log(); never updated or deleted through the API.
 */
@Entity('iam_audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index()
  @Column({ name: 'actor_id', nullable: true })
  actorId: number | null;

  @Column({ name: 'actor_email', length: 160, nullable: true })
  actorEmail: string | null;

  /** e.g. auth.login, auth.logout, roles.update, users.suspend, articles.publish */
  @Index()
  @Column({ length: 80 })
  action: string;

  @Index()
  @Column({ name: 'target_type', length: 64, nullable: true })
  targetType: string | null;

  @Column({ name: 'target_id', length: 64, nullable: true })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ length: 64, nullable: true })
  ip: string | null;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

/**
 * IAM UserSession — one row per login (per device). Stores only the
 * SHA-256 hash of the refresh token; the raw token lives client-side.
 * Access tokens carry the session id (sid) so revoking a session
 * invalidates its refresh chain, and "logout all devices" is one UPDATE.
 */
@Entity('iam_user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Index()
  @Column({ name: 'refresh_token_hash', length: 64 })
  refreshTokenHash: string;

  @Column({ name: 'user_agent', length: 400, nullable: true })
  userAgent: string | null;

  @Column({ length: 64, nullable: true })
  ip: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

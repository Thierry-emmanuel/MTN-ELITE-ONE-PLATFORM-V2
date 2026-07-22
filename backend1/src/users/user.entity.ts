// src/users/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER   = 'user',
  EDITOR = 'editor',
  ADMIN  = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // ── Authentication ─────────────────────────────────────────────
  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  username: string | null;

  @Column()
  password: string;           // bcrypt hash

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions: string[];

  // ── IAM (Sprint 1) ─────────────────────────────────────────────
  /** lifecycle: active | suspended | archived (supersedes isActive) */
  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active' | 'suspended' | 'archived';

  /** IAM role keys (iam_roles.key). Backfilled with the legacy enum value. */
  @Column({ name: 'role_keys', type: 'jsonb', default: () => "'[]'" })
  roleKeys: string[];

  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string | null;

  /** set by admin password reset — next login must change it */
  @Column({ name: 'must_change_password', default: false })
  mustChangePassword: boolean;

  // ── Profile ────────────────────────────────────────────────────
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true, default: 'Cameroun' })
  country: string;

  @Column({ length: 100, nullable: true })
  occupation: string;

  // ── Preferences ───────────────────────────────────────────────
  @Column({ name: 'favorite_club_id', nullable: true })
  favoriteClubId: number;     // UUID of preferred club

  @Column({ length: 5, nullable: true, default: 'fr' })
  language: string;           // "fr" | "en"

  @Column({ name: 'notifications_enabled', default: true })
  notificationsEnabled: boolean;

  // ── Editor-only fields ─────────────────────────────────────────
  @Column({ name: 'cni_number', nullable: true })
  cniNumber: string;          // Numéro CNI

  @Column({ nullable: true })
  agency: string;             // Agence / média

  @Column({ name: 'media_type', nullable: true })
  mediaType: string;          // presse, TV, digital…

  @Column({ type: 'text', nullable: true })
  purpose: string;            // Motif demande éditeur

  @Column({ name: 'press_card_number', nullable: true })
  pressCardNumber: string;

  @Column({ name: 'editor_approved', default: false })
  editorApproved: boolean;

  // ── Social Media ──────────────────────────────────────────────
  @Column({ name: 'social_media', type: 'jsonb', nullable: true })
  socialMedia: {
    twitter?:   string;
    instagram?: string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
  };

  // ── Security ──────────────────────────────────────────────────
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'mfa_secret', type: 'varchar', nullable: true })
  mfaSecret: string | null;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean;

  // ── Timestamps ────────────────────────────────────────────────
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
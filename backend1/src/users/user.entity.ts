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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Common fields ──────────────────────────────────────────
  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // bcrypt hash

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  // ── Editor-only fields ─────────────────────────────────────
  // Filled only when role === 'editor'

  @Column({ nullable: true })
  cniNumber: string;         // Numéro CNI

  @Column({ nullable: true })
  agency: string;            // Agence / média

  @Column({ nullable: true })
  mediaType: string;         // Type de média (presse, TV, digital…)

  @Column({ type: 'text', nullable: true })
  purpose: string;           // Motif / but de la demande d'accès éditeur

  @Column({ nullable: true })
  pressCardNumber: string;   // Numéro carte de presse (optionnel)

  @Column({ default: false })
  editorApproved: boolean;   // Admin approves editor accounts

  // ── Timestamps ─────────────────────────────────────────────
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
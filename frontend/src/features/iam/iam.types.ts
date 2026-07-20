/**
 * FootballOS IAM — frontend types (Sprint 1).
 * Mirrors backend1/src/iam entities and the /iam API surface.
 */

export interface IamRole {
  id?: string;
  key: string;
  name: string;
  description?: string | null;
  permissions: string[];
  fieldPolicies: Record<string, { deny: string[] }>;
  isSystem?: boolean;
  isDefault?: boolean;
  status?: 'active' | 'archived';
  version?: number;
  clonedFromKey?: string | null;
  updatedAt?: string;
}

export type OrganizationType =
  | 'FEDERATION' | 'DEPARTMENT' | 'COMMITTEE' | 'REGIONAL_LEAGUE' | 'TEAM';

export interface IamOrganization {
  id?: string;
  name: string;
  type: OrganizationType;
  parentId?: string | null;
  clubId?: string | null;
  status?: 'active' | 'archived';
  description?: string | null;
}

export interface IamUser {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'user' | 'editor' | 'admin';
  roleKeys: string[];
  organizationId?: string | null;
  status: 'active' | 'suspended' | 'archived';
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface IamSession {
  id: string;
  userId: number;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt: string;
  revokedAt?: string | null;
}

export interface IamAuditLog {
  id: string;
  actorId?: number | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string;
}

export interface PermissionCatalog {
  actions: string[];
  modules: { key: string; label: string; actions: string[]; ownable?: string[] }[];
}

export interface MeResponse {
  user: IamUser;
  roleKeys: string[];
  permissions: string[];
  fieldDeny: Record<string, string[]>;
  mustChangePassword: boolean;
}

import { apiClient } from '@/services/api';
import type {
  IamAuditLog, IamOrganization, IamRole, IamSession,
  MeResponse, PermissionCatalog,
} from './iam.types';

/**
 * iam.api — the connective layer between the IAM studios and the NestJS
 * /iam + /auth + /users endpoints. One file, no duplicated fetch logic:
 * everything rides the shared apiClient (auth header + refresh interceptor).
 */
export const iamApi = {
  // ── Identity ─────────────────────────────────────────────────
  me: async (): Promise<MeResponse> =>
    (await apiClient.get<MeResponse>('/auth/me')).data,

  changePassword: async (currentPassword: string, newPassword: string) =>
    (await apiClient.post('/auth/change-password', { currentPassword, newPassword })).data,

  logout: async () => (await apiClient.post('/auth/logout')).data,

  // ── Permission catalog ───────────────────────────────────────
  catalog: async (): Promise<PermissionCatalog> =>
    (await apiClient.get<PermissionCatalog>('/iam/permissions/catalog')).data,

  // ── Roles ────────────────────────────────────────────────────
  roles: {
    list: async (includeArchived = false): Promise<IamRole[]> =>
      (await apiClient.get<IamRole[]>('/iam/roles', { params: { includeArchived } })).data,
    get: async (key: string): Promise<IamRole> =>
      (await apiClient.get<IamRole>(`/iam/roles/${key}`)).data,
    create: async (dto: Partial<IamRole>): Promise<IamRole> =>
      (await apiClient.post<IamRole>('/iam/roles', dto)).data,
    update: async (key: string, dto: Partial<IamRole>): Promise<IamRole> =>
      (await apiClient.patch<IamRole>(`/iam/roles/${key}`, dto)).data,
    clone: async (key: string, newKey: string, newName?: string): Promise<IamRole> =>
      (await apiClient.post<IamRole>(`/iam/roles/${key}/clone`, { key: newKey, name: newName })).data,
    archive: async (key: string) => (await apiClient.post(`/iam/roles/${key}/archive`)).data,
    remove: async (key: string) => (await apiClient.delete(`/iam/roles/${key}`)).data,
  },

  // ── Organizations ────────────────────────────────────────────
  organizations: {
    list: async (): Promise<IamOrganization[]> =>
      (await apiClient.get<IamOrganization[]>('/iam/organizations')).data,
    create: async (dto: Partial<IamOrganization>) =>
      (await apiClient.post<IamOrganization>('/iam/organizations', dto)).data,
    update: async (id: string, dto: Partial<IamOrganization>) =>
      (await apiClient.patch<IamOrganization>(`/iam/organizations/${id}`, dto)).data,
    remove: async (id: string) => (await apiClient.delete(`/iam/organizations/${id}`)).data,
  },

  // ── Sessions ─────────────────────────────────────────────────
  sessions: {
    mine: async (): Promise<IamSession[]> =>
      (await apiClient.get<IamSession[]>('/iam/sessions/me')).data,
    revokeMine: async (id: string) => (await apiClient.delete(`/iam/sessions/me/${id}`)).data,
    revokeAllMine: async () => (await apiClient.post('/iam/sessions/me/revoke-all')).data,
    ofUser: async (userId: number): Promise<IamSession[]> =>
      (await apiClient.get<IamSession[]>(`/iam/sessions/user/${userId}`)).data,
  },

  // ── Audit ────────────────────────────────────────────────────
  audit: async (params: Record<string, unknown> = {}): Promise<{ data: IamAuditLog[]; total: number; page: number; limit: number }> =>
    (await apiClient.get('/iam/audit', { params })).data,

  // ── User lifecycle (extends the existing /users admin API) ───
  users: {
    suspend: async (id: number) => (await apiClient.patch(`/users/${id}/suspend`)).data,
    activate: async (id: number) => (await apiClient.patch(`/users/${id}/activate`)).data,
    archive: async (id: number) => (await apiClient.patch(`/users/${id}/archive`)).data,
    assignRoles: async (id: number, roleKeys: string[]) =>
      (await apiClient.patch(`/users/${id}/roles`, { roleKeys })).data,
    resetPassword: async (id: number, newPassword: string) =>
      (await apiClient.patch(`/users/${id}/reset-password`, { newPassword })).data,
    forcePasswordChange: async (id: number) =>
      (await apiClient.patch(`/users/${id}/force-password-change`)).data,
    loginHistory: async (id: number): Promise<IamAuditLog[]> =>
      (await apiClient.get(`/users/${id}/login-history`)).data,
    sessions: async (id: number): Promise<IamSession[]> =>
      (await apiClient.get(`/users/${id}/sessions`)).data,
  },

  // ── Configuration store (Menu Builder / Workspace Builder) ───
  config: {
    get: async <T = Record<string, unknown>>(key: string): Promise<T> =>
      (await apiClient.get<T>(`/iam/config/${key}`)).data,
    set: async (key: string, value: Record<string, unknown>) =>
      (await apiClient.put(`/iam/config/${key}`, value)).data,
  },
};

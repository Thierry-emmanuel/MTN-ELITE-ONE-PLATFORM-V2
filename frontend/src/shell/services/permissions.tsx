import { useEffect, useState } from 'react';
import { iamApi } from '@/features/iam/iam.api';
import type { MeResponse } from '@/features/iam/iam.types';

/**
 * Frontend Permission Engine (Sprint 1).
 * One fetch of GET /auth/me per app load, shared by every consumer through
 * a module-level cache. The backend remains the authority — this only
 * controls what the UI shows (menus, buttons, disabled fields).
 *
 * Grant grammar mirrors the backend: "*", "module.*", "module.action",
 * "module.action:own".
 */

let cached: MeResponse | null = null;
let inflight: Promise<MeResponse | null> | null = null;
const listeners = new Set<() => void>();

async function load(): Promise<MeResponse | null> {
  if (cached) return cached;
  if (!localStorage.getItem('mtn_token')) return null;
  inflight ??= iamApi.me()
    .then((me) => {
      cached = me;
      listeners.forEach((l) => l());
      return me;
    })
    .catch(() => null)
    .finally(() => { inflight = null; });
  return inflight;
}

/** Call on logout / role change so the next mount refetches. */
export function invalidatePermissions() {
  cached = null;
  listeners.forEach((l) => l());
}

export function checkGrant(permissions: string[], required: string): 'yes' | 'own' | 'no' {
  const [mod] = required.split('.');
  if (permissions.includes('*') || permissions.includes(`${mod}.*`) || permissions.includes(required)) return 'yes';
  if (permissions.includes(`${required}:own`)) return 'own';
  return 'no';
}

export interface PermissionsApi {
  loading: boolean;
  me: MeResponse | null;
  /** Full or own-scoped grant. */
  can: (permission: string) => boolean;
  /** 'yes' | 'own' | 'no' — when the distinction matters. */
  grant: (permission: string) => 'yes' | 'own' | 'no';
  /** Field denied for this user on this entity (Role Builder field policies). */
  fieldDenied: (entity: string, field: string) => boolean;
  roleKeys: string[];
}

export function usePermissions(): PermissionsApi {
  const [me, setMe] = useState<MeResponse | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const sync = () => setMe(cached);
    listeners.add(sync);
    load().then((m) => { setMe(m); setLoading(false); });
    return () => { listeners.delete(sync); };
  }, []);

  const permissions = me?.permissions ?? [];
  return {
    loading,
    me,
    can: (p) => checkGrant(permissions, p) !== 'no',
    grant: (p) => checkGrant(permissions, p),
    fieldDenied: (entity, field) =>
      !permissions.includes('*') && (me?.fieldDeny?.[entity] ?? []).includes(field),
    roleKeys: me?.roleKeys ?? [],
  };
}

/** Declarative guard: <Can permission="roles.view">…</Can> */
export function Can({ permission, children, fallback = null }: {
  permission: string; children: React.ReactNode; fallback?: React.ReactNode;
}) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  return <>{can(permission) ? children : fallback}</>;
}

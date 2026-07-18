import { apiClient } from '@/services/api';
import type { EntityConfig } from '../engine/entityConfig.types';

/**
 * Builds the CRUD calls for any entity from its config.
 * Removes the need for a bespoke createX/updateX/deleteX block per domain.
 *
 * Payloads are automatically filtered to only the keys declared in
 * `config.fields` so server-computed fields (id, createdAt, updatedAt,
 * relations like players/standings, …) are never forwarded – which
 * would trigger NestJS's `forbidNonWhitelisted` 400 guard.
 *
 * PHASE 2 NOTE — every entity talks to the real NestJS backend. The one
 * exception is `/equipments`: the backend has no equipments module yet
 * (see backend1/src — no such directory), so it keeps a localStorage
 * shim until that endpoint ships. Stadiums and sponsors previously used
 * mocks too; their controllers exist (backend1/src/stadiums, /sponsors),
 * so those mocks were removed.
 */
export function createEntityApi<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
) {
  const idOf = (row: T): string => String(config.idField === '_id' ? row._id! : row.id!);

  /** Keys that are safe to send to the backend (defined in config.fields). */
  const allowedKeys = new Set<string>(config.fields.map((f) => String(f.key)));

  /** Strip everything that isn't a declared form field. */
  function sanitise(payload: Partial<T>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(payload as Record<string, unknown>).filter(([k]) => allowedKeys.has(k)),
    );
  }

  // Backend endpoint not implemented yet — the only permitted shim.
  const isPendingBackend = config.apiBasePath === '/equipments';

  const shim = {
    read: (): T[] => JSON.parse(localStorage.getItem(`mock_entity_${config.name}`) ?? '[]') as T[],
    write: (data: T[]) => localStorage.setItem(`mock_entity_${config.name}`, JSON.stringify(data)),
  };

  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      if (isPendingBackend) return shim.read();
      const res = await apiClient.get<T[] | { data: T[] }>(config.apiBasePath, { params });
      const body = res.data;
      return Array.isArray(body) ? body : body.data;
    },

    get: async (id: string): Promise<T> => {
      if (isPendingBackend) {
        const row = shim.read().find((r) => idOf(r) === id);
        if (!row) throw new Error(`${config.labelSingular} ${id} introuvable`);
        return row;
      }
      const res = await apiClient.get<T>(`${config.apiBasePath}/${id}`);
      return res.data;
    },

    create: async (payload: Partial<T>): Promise<T> => {
      if (isPendingBackend) {
        const list = shim.read();
        const item = { ...sanitise(payload), id: String(Date.now()) } as unknown as T;
        shim.write([...list, item]);
        return item;
      }
      const res = await apiClient.post<T>(config.apiBasePath, sanitise(payload));
      return res.data;
    },

    update: async (id: string, payload: Partial<T>): Promise<T> => {
      if (isPendingBackend) {
        const next = shim.read().map((r) => (idOf(r) === id ? { ...r, ...sanitise(payload) } : r));
        shim.write(next);
        return next.find((r) => idOf(r) === id) ?? (payload as T);
      }
      const res = await apiClient.patch<T>(`${config.apiBasePath}/${id}`, sanitise(payload));
      return res.data;
    },

    remove: async (id: string): Promise<void> => {
      if (isPendingBackend) {
        shim.write(shim.read().filter((r) => idOf(r) !== id));
        return;
      }
      await apiClient.delete(`${config.apiBasePath}/${id}`);
    },

    idOf,
  };
}

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
 * SPRINT 2 NOTE — every entity talks to the real NestJS backend, with no
 * exceptions: the /equipments localStorage fallback (the last placeholder
 * from Phase 2) was retired when backend1/src/equipments shipped.
 */
export function createEntityApi<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
) {
  const idOf = (row: T): string => String(config.idField === '_id' ? row._id! : row.id!);

  /** Keys that are safe to send to the backend (defined in config.fields). */
  const allowedKeys = new Set<string>([
    ...config.fields.map((f) => String(f.key)),
    ...(config.extraPersistKeys ?? []),
  ]);

  /**
   * Shape then strip: config.beforeSave (slug generation, type coercion,
   * nested assembly) runs first — it was declared in the contract since
   * Phase 0 but never applied anywhere until Phase 4. Then everything that
   * isn't a declared form field is removed.
   */
  function sanitise(payload: Partial<T>): Record<string, unknown> {
    const shaped = config.beforeSave ? config.beforeSave(payload) : payload;
    return Object.fromEntries(
      Object.entries(shaped as Record<string, unknown>).filter(([k]) => allowedKeys.has(k)),
    );
  }

  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      const res = await apiClient.get<T[] | { data: T[] }>(config.apiBasePath, { params });
      const body = res.data;
      return Array.isArray(body) ? body : body.data;
    },

    get: async (id: string): Promise<T> => {
      const res = await apiClient.get<T>(`${config.apiBasePath}/${id}`);
      return res.data;
    },

    create: async (payload: Partial<T>): Promise<T> => {
      const res = await apiClient.post<T>(config.apiBasePath, sanitise(payload));
      return res.data;
    },

    update: async (id: string, payload: Partial<T>): Promise<T> => {
      const res = await apiClient.patch<T>(`${config.apiBasePath}/${id}`, sanitise(payload));
      return res.data;
    },

    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`${config.apiBasePath}/${id}`);
    },

    idOf,
  };
}

import { apiClient } from '@/services/api';
import type { EntityConfig } from '../engine/entityConfig.types';

/**
 * Builds the four CRUD calls for any entity from its config.
 * Removes the need for a bespoke createX/updateX/deleteX block per domain.
 */
export function createEntityApi<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
) {
  const idOf = (row: T): string => (config.idField === '_id' ? row._id! : row.id!);

  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      const res = await apiClient.get<T[] | { data: T[] }>(config.apiBasePath, { params });
      const body = res.data;
      return Array.isArray(body) ? body : body.data;
    },

    create: async (payload: Partial<T>): Promise<T> => {
      const res = await apiClient.post<T>(config.apiBasePath, payload);
      return res.data;
    },

    update: async (id: string, payload: Partial<T>): Promise<T> => {
      const res = await apiClient.patch<T>(`${config.apiBasePath}/${id}`, payload);
      return res.data;
    },

    remove: async (id: string): Promise<void> => {
      await apiClient.delete(`${config.apiBasePath}/${id}`);
    },

    idOf,
  };
}
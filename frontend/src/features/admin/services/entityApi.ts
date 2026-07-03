import { apiClient } from '@/services/api';
import type { EntityConfig } from '../engine/entityConfig.types';

/**
 * Builds the four CRUD calls for any entity from its config.
 * Removes the need for a bespoke createX/updateX/deleteX block per domain.
 *
 * Payloads are automatically filtered to only the keys declared in
 * `config.fields` so server-computed fields (id, createdAt, updatedAt,
 * relations like players/standings, …) are never forwarded – which
 * would trigger NestJS's `forbidNonWhitelisted` 400 guard.
 */
export function createEntityApi<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
) {
  const idOf = (row: T): string => (config.idField === '_id' ? row._id! : row.id!);

  /** Keys that are safe to send to the backend (defined in config.fields). */
  const allowedKeys = new Set<string>(config.fields.map((f) => String(f.key)));

  /** Strip everything that isn't a declared form field. */
  function sanitise(payload: Partial<T>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(payload as Record<string, unknown>).filter(([k]) => allowedKeys.has(k)),
    );
  }

  const isMocked = ['/stadiums', '/equipments', '/sponsors'].includes(config.apiBasePath);

  const getMockData = (): T[] => {
    const data = localStorage.getItem(`mock_entity_${config.name}`);
    if (data) return JSON.parse(data);
    
    // Seed initial mock data if empty
    let initial: T[] = [];
    if (config.name === 'stadiums') {
      initial = [
        { id: '1', name: 'Stade Ahmadou Ahidjo', city: 'Yaoundé', capacity: 42500, status: 'ACTIVE' },
        { id: '2', name: 'Stade de la Réunification', city: 'Douala', capacity: 30000, status: 'ACTIVE' },
        { id: '3', name: 'Stade de Roumdé Adjia', city: 'Garoua', capacity: 25000, status: 'ACTIVE' },
      ] as any;
    } else if (config.name === 'sponsors') {
      initial = [
        { id: '1', name: 'MTN Cameroon', type: 'TITLE', websiteUrl: 'https://www.mtn.cm' },
        { id: '2', name: 'Orange Cameroun', type: 'GOLD', websiteUrl: 'https://www.orange.cm' },
        { id: '3', name: 'Brasseries du Cameroun', type: 'SILVER', websiteUrl: 'https://www.sabcd.com' },
      ] as any;
    } else if (config.name === 'equipments') {
      initial = [
        { id: '1', name: 'Maillot Domicile 2026', type: 'JERSEY_HOME', brand: 'One All Sports' },
        { id: '2', name: 'Maillot Extérieur 2026', type: 'JERSEY_AWAY', brand: 'One All Sports' },
        { id: '3', name: 'Ballon officiel Elite One', type: 'BALL', brand: 'Puma' },
      ] as any;
    }
    localStorage.setItem(`mock_entity_${config.name}`, JSON.stringify(initial));
    return initial;
  };

  const saveMockData = (data: T[]) => {
    localStorage.setItem(`mock_entity_${config.name}`, JSON.stringify(data));
  };

  return {
    list: async (params?: Record<string, unknown>): Promise<T[]> => {
      if (isMocked) {
        return getMockData();
      }
      const res = await apiClient.get<T[] | { data: T[] }>(config.apiBasePath, { params });
      const body = res.data;
      return Array.isArray(body) ? body : body.data;
    },

    create: async (payload: Partial<T>): Promise<T> => {
      if (isMocked) {
        const list = getMockData();
        const newItem = {
          ...sanitise(payload),
          id: String(Date.now() + Math.random().toString(36).substr(2, 9)),
        } as unknown as T;
        list.push(newItem);
        saveMockData(list);
        return newItem;
      }
      const res = await apiClient.post<T>(config.apiBasePath, sanitise(payload));
      return res.data;
    },

    update: async (id: string, payload: Partial<T>): Promise<T> => {
      if (isMocked) {
        const list = getMockData();
        const updatedList = list.map((item) => {
          if (idOf(item) === id) {
            return { ...item, ...sanitise(payload) };
          }
          return item;
        });
        saveMockData(updatedList);
        return updatedList.find((item) => idOf(item) === id) || (payload as T);
      }
      const res = await apiClient.patch<T>(`${config.apiBasePath}/${id}`, sanitise(payload));
      return res.data;
    },

    remove: async (id: string): Promise<void> => {
      if (isMocked) {
        const list = getMockData();
        const filtered = list.filter((item) => idOf(item) !== id);
        saveMockData(filtered);
        return;
      }
      await apiClient.delete(`${config.apiBasePath}/${id}`);
    },

    idOf,
  };
}
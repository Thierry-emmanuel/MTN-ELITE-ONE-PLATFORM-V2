import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSEntity } from '../registry/types';

interface DraftsState {
  items: OSEntity[];
  upsert: (e: OSEntity) => void;
  remove: (id: string, type: string) => void;
}

/**
 * Draft OSEntities registered by builders the moment a create-flow starts
 * (Flow C in the spec) — they appear in the sidebar and Workspace instantly.
 */
export const useDrafts = create<DraftsState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (e) =>
        set({
          items: [e, ...get().items.filter((i) => !(i.id === e.id && i.type === e.type))],
        }),
      remove: (id, type) =>
        set({ items: get().items.filter((i) => !(i.id === id && i.type === type)) }),
    }),
    { name: 'fos.drafts' },
  ),
);

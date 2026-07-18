import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSEntity } from '../registry/types';

interface RecentsState {
  items: OSEntity[];
  push: (e: OSEntity) => void;
  clear: () => void;
}

const MAX = 8;

export const useRecents = create<RecentsState>()(
  persist(
    (set, get) => ({
      items: [],
      push: (e) =>
        set({
          items: [e, ...get().items.filter((i) => !(i.id === e.id && i.type === e.type))].slice(0, MAX),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'fos.recents' },
  ),
);

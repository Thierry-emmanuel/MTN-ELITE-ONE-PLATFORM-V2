import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSEntity } from '../registry/types';

interface FavoritesState {
  items: OSEntity[];
  toggle: (e: OSEntity) => void;
  isFavorite: (e: Pick<OSEntity, 'id' | 'type'>) => boolean;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (e) => {
        const exists = get().items.some((i) => i.id === e.id && i.type === e.type);
        set({
          items: exists
            ? get().items.filter((i) => !(i.id === e.id && i.type === e.type))
            : [...get().items, e],
        });
      },
      isFavorite: (e) => get().items.some((i) => i.id === e.id && i.type === e.type),
    }),
    { name: 'fos.favorites' },
  ),
);

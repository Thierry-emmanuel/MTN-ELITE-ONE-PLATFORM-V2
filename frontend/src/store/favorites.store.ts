import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  likedClubs: string[]; // Club IDs
  likedPlayers: string[]; // Player IDs
  toggleLikeClub: (clubId: string) => void;
  toggleLikePlayer: (playerId: string) => void;
  isClubLiked: (clubId: string) => boolean;
  isPlayerLiked: (playerId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      likedClubs: [],
      likedPlayers: [],

      toggleLikeClub: (clubId) => {
        set((state) => {
          const isLiked = state.likedClubs.includes(clubId);
          return {
            likedClubs: isLiked
              ? state.likedClubs.filter((id) => id !== clubId)
              : [...state.likedClubs, clubId],
          };
        });
      },

      toggleLikePlayer: (playerId) => {
        set((state) => {
          const isLiked = state.likedPlayers.includes(playerId);
          return {
            likedPlayers: isLiked
              ? state.likedPlayers.filter((id) => id !== playerId)
              : [...state.likedPlayers, playerId],
          };
        });
      },

      isClubLiked: (clubId) => get().likedClubs.includes(clubId),
      isPlayerLiked: (playerId) => get().likedPlayers.includes(playerId),
    }),
    {
      name: 'mtn-elite-favorites',
    }
  )
);

import { useQuery } from '@tanstack/react-query';
import { footballApi } from '@/services/api';
import type { SelectOption } from '../engine/entityConfig.types';

export function useClubOptions() {
  return useQuery({
    queryKey: ['lookup', 'clubs'],
    queryFn: async (): Promise<SelectOption[]> => {
      const clubs = await footballApi.getClubs();
      return clubs.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }));
    },
    staleTime: 300_000,
  });
}

export function usePlayerOptions() {
  return useQuery({
    queryKey: ['lookup', 'players'],
    queryFn: async (): Promise<SelectOption[]> => {
      const players = await footballApi.getPlayers();
      return players.map((p: { playerId: string; playerName: string }) => ({
        value: p.playerId, label: p.playerName,
      }));
    },
    staleTime: 300_000,
  });
}
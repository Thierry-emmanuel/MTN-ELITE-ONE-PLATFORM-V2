import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEntityApi } from '../services/entityApi';
import type { EntityConfig } from '../engine/entityConfig.types';

/**
 * One hook factory replaces useAwards/useFootball/useNews-style duplication
 * for every CRUD-only admin entity (transfers, injuries, selections, etc).
 * Read-heavy public hooks (live scores, voting) stay hand-written — they
 * have bespoke caching/socket needs this generic factory shouldn't hide.
 */
export function createEntityHooks<T extends { id?: string; _id?: string }>(
  config: EntityConfig<T>,
) {
  const api = createEntityApi(config);
  const queryKey = (params?: Record<string, unknown>) => [config.name, params] as const;

  function useList(params?: Record<string, unknown>) {
    return useQuery({
      queryKey: queryKey(params),
      queryFn: () => api.list(params),
      staleTime: 60_000,
    });
  }

  function useMutations() {
    const qc = useQueryClient();
    const invalidate = () => qc.invalidateQueries({ queryKey: [config.name] });

    const createMutation = useMutation({
      mutationFn: (payload: Partial<T>) => api.create(config.beforeSave ? config.beforeSave(payload) : payload),
      onSuccess: invalidate,
    });

    const updateMutation = useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<T> }) =>
        api.update(id, config.beforeSave ? config.beforeSave(payload) : payload),
      onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: invalidate,
    });

    return {
      create: createMutation,
      update: updateMutation,
      remove: deleteMutation,
      isSaving:
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
  }

  return { useList, useMutations, api };
}